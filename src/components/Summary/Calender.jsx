import { useCallback, useEffect, useRef, useState } from 'react';

import { TokenManager } from '@/api/api';
import { getMedicalRecord } from '@/api/medicalRecord';
import MicrophoneIcon from '@/assets/icons/summary/microphone.svg?react';
import BottomSheet from '@/components/Summary/BottomSheet';
import Record from '@/components/Summary/Record';
import SummaryRecord from '@/components/Summary/SummaryRecord';
import VoiceChildSelectScreen from '@/components/Summary/VoiceChildSelectScreen';
import Modal from '@/components/common/Modal';
import { CELLS, WEEK_DAYS } from '@/constants/calenderDummyData';
import { formatDateToKoreanMeridiem, hhmmToKoreanMeridiem } from '@/utils/koreanMeridiemTime';

/** UI 헤더와 동일 (월 이동 연동 전까지 고정) */
const CALENDAR_YEAR = 2026;
const CALENDAR_MONTH = 4;

function toTreatDateYmd(day) {
  if (typeof day !== 'number' || day < 1 || day > 31) return '';
  return `${CALENDAR_YEAR}${String(CALENDAR_MONTH).padStart(2, '0')}${String(day).padStart(2, '0')}`;
}

function cloneCells(source) {
  return source.map((cell) => ({
    ...cell,
    events: cell.events?.map((e) => ({ ...e })),
  }));
}

const CHILD_EVENT_COLORS = {
  1: 'bg-[#5AA7FF]',
  2: 'bg-[#FFC721]',
  3: 'bg-[#FF8763]',
};

function eventColorForChildId(childId) {
  const n = Number(childId);
  return CHILD_EVENT_COLORS[n] ?? 'bg-[#FFC721]';
}

function normalizeMedicalRecordList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  if (raw && Array.isArray(raw.records)) return raw.records;
  return [];
}

function parseTreatDateParts(treatDate) {
  if (treatDate == null) return null;
  const s = String(treatDate);
  if (s.length < 8) return null;
  return {
    y: Number(s.slice(0, 4)),
    m: Number(s.slice(4, 6)),
    d: Number(s.slice(6, 8)),
  };
}

/** 더미 그리드에서 해당 월의 `day` 일에 해당하는 칸 (같은 day가 두 칸이면 비-muted 우선) */
function findCellIndexForMonthDay(cells, day) {
  const matches = cells.map((c, i) => ({ c, i })).filter(({ c }) => c.day === day);
  if (matches.length === 0) return null;
  const nonMuted = matches.find(({ c }) => !c.muted);
  return (nonMuted ?? matches[0]).i;
}

function mergeApiMedicalRecordsIntoCells(baseCells, records, year, month) {
  const copy = baseCells.map((cell) => ({
    ...cell,
    events: cell.events?.filter((e) => e.recordId == null).map((e) => ({ ...e })),
  }));
  for (const r of records) {
    const t = parseTreatDateParts(r.treatDate);
    if (!t || t.y !== year || t.m !== month || !Number.isFinite(t.d)) continue;
    const idx = findCellIndexForMonthDay(copy, t.d);
    if (idx == null) continue;
    const ev = {
      label: r.title ?? '',
      location: r.hospitalName ?? '',
      memo: r.memo ?? '',
      time: hhmmToKoreanMeridiem(r.treatTime),
      color: eventColorForChildId(r.childId),
      childId: r.childId != null ? String(r.childId) : undefined,
      recordId: r.recordId,
    };
    const cell = copy[idx];
    const nextEvents = [...(cell.events ?? []), ev];
    copy[idx] = { ...cell, events: nextEvents };
  }
  return copy;
}

function cellIndexForCompletedAt(cells, completedAt) {
  if (!(completedAt instanceof Date) || Number.isNaN(completedAt.getTime())) return null;
  if (
    completedAt.getFullYear() !== CALENDAR_YEAR ||
    completedAt.getMonth() + 1 !== CALENDAR_MONTH
  ) {
    const first = cells.findIndex(
      (c) => !c.muted && typeof c.day === 'number' && c.day >= 1 && c.day <= 31
    );
    return first >= 0 ? first : 0;
  }
  const idx = findCellIndexForMonthDay(cells, completedAt.getDate());
  return idx != null ? idx : 0;
}

export default function Calendar() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [cells, setCells] = useState(() => cloneCells(CELLS));
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isVoiceChildSelectOpen, setIsVoiceChildSelectOpen] = useState(false);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedVoiceChild, setSelectedVoiceChild] = useState(null);
  const [recordingCellIndex, setRecordingCellIndex] = useState(null);
  const [recordingRecordId, setRecordingRecordId] = useState(null);
  const [recordingOpenedFromSchedule, setRecordingOpenedFromSchedule] = useState(false);
  const [scheduleAddPrefill, setScheduleAddPrefill] = useState(null);
  const [recordingSummaryView, setRecordingSummaryView] = useState(null);
  const returnToDayIndexRef = useRef(null);

  const selectedCell = selectedIndex !== null ? cells[selectedIndex] : null;

  const handleSaveDayEvents = useCallback(
    (nextEvents) => {
      if (selectedIndex === null) return;
      setCells((prev) => {
        const copy = [...prev];
        copy[selectedIndex] = {
          ...copy[selectedIndex],
          events: nextEvents.length > 0 ? nextEvents.map((e) => ({ ...e })) : undefined,
        };
        return copy;
      });
    },
    [selectedIndex]
  );
  const selectedWeekDay = selectedIndex !== null ? WEEK_DAYS[selectedIndex % 7]?.label : '';

  const resolveRecordingCellIndex = useCallback(() => {
    if (selectedIndex !== null) return selectedIndex;
    const marked = cells.findIndex((c) => c.selected);
    if (marked >= 0) return marked;
    const firstDay = cells.findIndex(
      (c) => !c.muted && typeof c.day === 'number' && c.day >= 1 && c.day <= 31
    );
    return firstDay >= 0 ? firstDay : 0;
  }, [cells, selectedIndex]);

  const clearSchedulePrefill = useCallback(() => setScheduleAddPrefill(null), []);

  useEffect(() => {
    if (!TokenManager.getAccessToken()) return;
    let cancelled = false;
    (async () => {
      try {
        const raw = await getMedicalRecord({
          year: CALENDAR_YEAR,
          month: CALENDAR_MONTH,
        });
        if (cancelled) return;
        const list = normalizeMedicalRecordList(raw);
        setCells((prev) =>
          mergeApiMedicalRecordsIntoCells(cloneCells(prev), list, CALENDAR_YEAR, CALENDAR_MONTH)
        );
      } catch (e) {
        console.error('캘린더 진료 기록 불러오기 실패', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative h-[530px] w-full overflow-hidden bg-white px-6 pb-6 pt-[25px]">
      <div className="mb-5 flex h-[39px] items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          className="flex size-[39px] items-center justify-center rounded-full bg-white text-[39px] leading-none text-[#0B1324] shadow-[0_0.9px_0.45px_rgba(0,14,51,0.05)]"
        >
          ‹
        </button>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="flex items-center gap-0.5 rounded-md bg-white px-[10px] py-[9px] text-[21px] font-bold leading-none text-[#5F3010] tracking-[-0.21px] shadow-[0_0.8px_0.4px_rgba(0,14,51,0.05)]"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          >
            2026년 <span className="text-[11px] text-[#FFC721]">▼</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-0.5 rounded-md bg-white px-[10px] py-[9px] text-[21px] font-bold leading-none text-[#5F3010] tracking-[-0.21px] shadow-[0_0.8px_0.4px_rgba(0,14,51,0.05)]"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          >
            4월 <span className="text-[11px] text-[#FFC721]">▼</span>
          </button>
        </div>
        <button
          type="button"
          aria-label="다음 달"
          className="flex size-[39px] items-center justify-center rounded-full bg-white text-[39px] leading-none text-[#0B1324] shadow-[0_0.9px_0.45px_rgba(0,14,51,0.05)]"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7">
        {WEEK_DAYS.map((day) => (
          <div key={day.label} className={`pb-2 text-center text-sm font-bold ${day.color}`}>
            {day.label}
          </div>
        ))}

        {cells.map((cell, index) => (
          <button
            type="button"
            key={`${cell.day}-${index}`}
            onClick={() => setSelectedIndex(index)}
            className={`box-border flex h-[81px] flex-col overflow-hidden px-[2px] py-[2px] ${
              selectedIndex === index ? 'rounded border border-[#FFC721]' : ''
            }`}
          >
            <div
              className={`flex h-6 shrink-0 items-center justify-center text-[10px] font-bold leading-none ${
                cell.muted ? 'text-[#252525]/50' : 'text-[#252525]'
              }`}
            >
              {selectedIndex === index ? (
                <span className="flex size-[18px] items-center justify-center rounded-full bg-[#FFC721] text-[10px] text-white">
                  {cell.day}
                </span>
              ) : (
                cell.day
              )}
            </div>
            <div className="min-h-0 flex-1 space-y-0.5 overflow-hidden">
              {cell.events?.map((event, ei) => (
                <div
                  key={
                    event.recordId != null
                      ? `r-${event.recordId}`
                      : `e-${cell.day}-${ei}-${event.label}`
                  }
                  className={`truncate rounded-[2px] px-1 py-0.5 text-[8px] font-medium ${
                    event.fromRecording
                      ? 'border border-[#FF3D00] bg-[#FFFCF9] text-[#FF3D00]'
                      : `text-[#FFFCF9] ${event.color}`
                  }`}
                >
                  {event.label}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="음성 입력"
        onClick={() => {
          returnToDayIndexRef.current = null;
          setRecordingOpenedFromSchedule(false);
          setRecordingRecordId(null);
          setIsVoiceModalOpen(true);
        }}
        className={`absolute bottom-[22px] right-6 z-30 flex size-[68px] items-center justify-center rounded-full text-[30px] text-white shadow-[0_4px_6px_rgba(18,18,23,0.2)] ${
          isVoiceModalOpen || isVoiceChildSelectOpen || isRecordOpen
            ? 'bg-[#E28906]'
            : 'bg-[#FFC722]'
        }`}
      >
        <MicrophoneIcon
          className={`size-10 ${
            isVoiceModalOpen || isVoiceChildSelectOpen || isRecordOpen
              ? '[&_rect]:fill-[#E28906]'
              : '[&_rect]:fill-[#FFC722]'
          }`}
        />
      </button>

      {selectedIndex !== null && (
        <button
          type="button"
          aria-label="오버레이 닫기"
          onClick={() => setSelectedIndex(null)}
          className="fixed inset-0 z-40 bg-black/35"
        />
      )}

      <BottomSheet
        key={
          selectedCell != null && selectedIndex !== null
            ? `${selectedCell.day}-${selectedIndex}`
            : 'sheet-closed'
        }
        isOpen={selectedIndex !== null}
        selectedLabel={selectedCell ? `4월 ${selectedCell.day}일 ${selectedWeekDay}요일` : ''}
        events={selectedCell?.events ?? []}
        onClose={() => setSelectedIndex(null)}
        onSaveEvents={handleSaveDayEvents}
        treatDate={selectedCell ? toTreatDateYmd(selectedCell.day) : ''}
        scheduleAddPrefill={scheduleAddPrefill}
        onScheduleAddPrefillConsumed={clearSchedulePrefill}
        summaryDateText={selectedCell ? `2026년 4월 ${selectedCell.day}일` : ''}
        onViewRecordingSummary={(payload) => {
          const rawRid = payload?.recordId;
          const recordIdNum =
            rawRid != null &&
            rawRid !== '' &&
            Number.isFinite(Number(rawRid)) &&
            Number(rawRid) >= 1
              ? Number(rawRid)
              : null;
          setRecordingSummaryView({
            childName: payload.childName || '우리집 아들',
            childLabelColor: payload.childLabelColor || '#5AA7FF',
            summaryDateText: payload.summaryDateText ?? '',
            eventIndex: typeof payload.eventIndex === 'number' ? payload.eventIndex : -1,
            recordId: recordIdNum,
            scheduleTitle: typeof payload.scheduleTitle === 'string' ? payload.scheduleTitle : '',
          });
        }}
        onRequestRecording={(payload) => {
          const returnIdx = selectedIndex;
          const rid = payload?.recordId;
          const hasRecord =
            rid != null && rid !== '' && Number.isFinite(Number(rid)) && Number(rid) >= 1;
          if (hasRecord) {
            returnToDayIndexRef.current = returnIdx;
            setRecordingOpenedFromSchedule(true);
            setRecordingRecordId(Number(rid));
            setSelectedVoiceChild({
              id: payload.childId != null ? String(payload.childId) : '',
              name: payload.childName ?? '',
              labelColor: payload.childLabelColor ?? '#5AA7FF',
            });
            const cellIdx =
              returnIdx != null && returnIdx >= 0 ? returnIdx : resolveRecordingCellIndex();
            setRecordingCellIndex(cellIdx);
            setSelectedIndex(null);
            setIsVoiceModalOpen(false);
            setIsVoiceChildSelectOpen(false);
            setIsRecordOpen(true);
            return;
          }
          returnToDayIndexRef.current = null;
          setRecordingOpenedFromSchedule(false);
          setRecordingRecordId(null);
          setSelectedIndex(null);
          setIsVoiceModalOpen(true);
        }}
      />

      {recordingSummaryView ? (
        <SummaryRecord
          childName={recordingSummaryView.childName}
          childLabelColor={recordingSummaryView.childLabelColor}
          summaryDateText={recordingSummaryView.summaryDateText}
          recordId={recordingSummaryView.recordId}
          scheduleTitle={recordingSummaryView.scheduleTitle}
          hideScheduleCta
          allowSummaryDelete={
            typeof recordingSummaryView.eventIndex === 'number' &&
            recordingSummaryView.eventIndex >= 0 &&
            recordingSummaryView.recordId != null &&
            Number(recordingSummaryView.recordId) >= 1
          }
          onConfirmDeleteSummary={() => {
            const idx = recordingSummaryView?.eventIndex;
            const rid = recordingSummaryView?.recordId;
            if (typeof idx !== 'number' || idx < 0 || selectedIndex === null || rid == null) {
              setRecordingSummaryView(null);
              return;
            }
            setCells((prev) => {
              const copy = [...prev];
              const cell = copy[selectedIndex];
              if (!cell?.events || idx >= cell.events.length) return prev;
              const nextEvents = cell.events.map((e, i) =>
                i === idx
                  ? {
                      ...e,
                      fromRecording: false,
                      recordingChildName: undefined,
                      recordingChildLabelColor: undefined,
                    }
                  : e
              );
              copy[selectedIndex] = { ...cell, events: nextEvents };
              return copy;
            });
            setRecordingSummaryView(null);
          }}
          onBack={() => setRecordingSummaryView(null)}
          onGoToSchedule={() => {}}
        />
      ) : null}

      <Modal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAgree={() => setIsVoiceChildSelectOpen(true)}
      />

      <VoiceChildSelectScreen
        isOpen={isVoiceChildSelectOpen}
        onClose={() => setIsVoiceChildSelectOpen(false)}
        onConfirm={(child) => {
          if (!child) return;
          setSelectedVoiceChild(child);
          setRecordingRecordId(null);
          setRecordingOpenedFromSchedule(false);
          setRecordingCellIndex(resolveRecordingCellIndex());
          setIsVoiceChildSelectOpen(false);
          setIsRecordOpen(true);
        }}
      />

      <Record
        isOpen={isRecordOpen}
        childId={selectedVoiceChild?.id ?? null}
        recordId={recordingRecordId}
        childName={selectedVoiceChild?.name ?? ''}
        childLabelColor={selectedVoiceChild?.labelColor ?? '#5AA7FF'}
        openedWithScheduleRecord={recordingOpenedFromSchedule}
        recordingCellIndex={recordingCellIndex}
        summaryDateText={
          recordingCellIndex != null && cells[recordingCellIndex]
            ? `2026년 4월 ${cells[recordingCellIndex].day}일`
            : ''
        }
        onBack={() => {
          setIsRecordOpen(false);
          setRecordingRecordId(null);
          if (recordingOpenedFromSchedule) {
            const back = returnToDayIndexRef.current;
            returnToDayIndexRef.current = null;
            setRecordingOpenedFromSchedule(false);
            if (back != null) setSelectedIndex(back);
            return;
          }
          setIsVoiceChildSelectOpen(true);
        }}
        onOpenScheduleFromSummary={({ completedAt, cellIndex, recordId: aiRecordId }) => {
          const resolvedIdx =
            cellIndex != null && cellIndex >= 0
              ? cellIndex
              : cellIndexForCompletedAt(cells, completedAt);
          if (resolvedIdx == null || resolvedIdx < 0) return;
          setScheduleAddPrefill({
            time: formatDateToKoreanMeridiem(completedAt),
            location: '',
            label: '',
            memo: '',
            childId: selectedVoiceChild?.id ?? '',
            highlightHospitalLocation: true,
            saveButtonLabel: '일정 저장하기',
            primaryButtonBgColor: '#FFC721',
            existingRecordId:
              aiRecordId != null && Number.isFinite(Number(aiRecordId)) && Number(aiRecordId) >= 1
                ? Number(aiRecordId)
                : undefined,
            recordingMeta: {
              childName: selectedVoiceChild?.name ?? '',
              childLabelColor: selectedVoiceChild?.labelColor ?? '#5AA7FF',
              medicineText: '항히스타민제 알비다정10mg',
            },
          });
          setIsRecordOpen(false);
          setIsVoiceChildSelectOpen(false);
          setIsVoiceModalOpen(false);
          setRecordingRecordId(null);
          setRecordingOpenedFromSchedule(false);
          returnToDayIndexRef.current = null;
          setSelectedIndex(resolvedIdx);
        }}
      />
    </section>
  );
}
