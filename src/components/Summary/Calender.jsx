import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TokenManager } from '@/api/api';
import { getChildren } from '@/api/child';
import { getMedicalRecord } from '@/api/medicalRecord';
import MicrophoneIcon from '@/assets/icons/summary/microphone.svg?react';
import BottomSheet from '@/components/Summary/BottomSheet';
import Record from '@/components/Summary/Record';
import SummaryRecord from '@/components/Summary/SummaryRecord';
import VoiceChildSelectScreen from '@/components/Summary/VoiceChildSelectScreen';
import CalendarPeriodHeader from '@/components/common/CalendarPeriodHeader';
import Modal from '@/components/common/Modal';
import { WEEK_DAYS } from '@/constants/calenderDummyData';
import { useChildrenStore } from '@/store/childrenStore';
import { calendarLabelBgClassFromChildren } from '@/utils/calendarChildColor';
import { childLegalNameFromList } from '@/utils/childDisplayName';
import { formatDateToKoreanMeridiem, hhmmToKoreanMeridiem } from '@/utils/koreanMeridiemTime';

const TODAY = new Date();
const INITIAL_VIEW_YEAR = TODAY.getFullYear();
const INITIAL_VIEW_MONTH = TODAY.getMonth() + 1;
const BOTTOM_SHEET_CLOSE_MS = 800;

function toTreatDateYmd(year, month, day) {
  if (typeof day !== 'number' || day < 1 || day > 31) return '';
  return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
}

function formatKoreanDateText(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function createMonthCells(year, month) {
  const firstWeekDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDate = new Date(year, month - 1, 0);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth() + 1;
  const prevDaysInMonth = prevMonthDate.getDate();
  const nextMonthDate = new Date(year, month, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = nextMonthDate.getMonth() + 1;
  const totalCells = Math.max(35, Math.ceil((firstWeekDay + daysInMonth) / 7) * 7);

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - firstWeekDay + 1;
    if (dayOffset < 1) {
      return {
        year: prevYear,
        month: prevMonth,
        day: prevDaysInMonth + dayOffset,
        muted: true,
      };
    }
    if (dayOffset > daysInMonth) {
      return {
        year: nextYear,
        month: nextMonth,
        day: dayOffset - daysInMonth,
        muted: true,
      };
    }
    return { year, month, day: dayOffset };
  });
}

function normalizeMedicalRecordList(raw) {
  const candidates = [
    raw,
    raw?.data,
    raw?.records,
    raw?.medicalRecords,
    raw?.result,
    raw?.result?.data,
    raw?.data?.records,
    raw?.data?.medicalRecords,
    raw?.result?.records,
    raw?.result?.medicalRecords,
  ];
  const found = candidates.find(Array.isArray);
  return found ?? [];
}

function resolveMedicalRecordChildId(record) {
  const rawId =
    record?.childId ??
    record?.child?.childId ??
    record?.child?.id ??
    record?.childInfo?.childId ??
    record?.childInfo?.id;
  return rawId == null || rawId === '' ? '' : String(rawId).trim();
}

function normalizeChildName(name) {
  return name != null ? String(name).trim() : '';
}

function resolveMedicalRecordChildName(record, children) {
  const rawName =
    record?.childName ??
    record?.child?.childName ??
    record?.child?.name ??
    record?.childInfo?.childName ??
    record?.childInfo?.name;
  const childName = normalizeChildName(rawName);
  if (childName) return childName;
  return childLegalNameFromList(children, resolveMedicalRecordChildId(record));
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

function mergeApiMedicalRecordsIntoCells(
  baseCells,
  records,
  year,
  month,
  childrenRaw,
  filterChildId,
  filterChildName
) {
  const fid = filterChildId != null && filterChildId !== '' ? String(filterChildId) : null;
  const fname = normalizeChildName(filterChildName);
  const copy = baseCells.map((cell) => ({
    ...cell,
    events: cell.events
      ?.filter((e) => e.recordId == null)
      .filter((e) => {
        const eventChildId = String(e.childId ?? '').trim();
        const eventChildName =
          normalizeChildName(e.childName) ||
          normalizeChildName(e.recordingChildName) ||
          childLegalNameFromList(childrenRaw, e.childId);
        if (fname) return eventChildName === fname;
        if (fid != null) return eventChildId === fid;
        return true;
      })
      .map((e) => ({ ...e })),
  }));
  for (const r of records) {
    const recordChildId = resolveMedicalRecordChildId(r);
    const recordChildName = resolveMedicalRecordChildName(r, childrenRaw);
    if (fname && recordChildName !== fname) continue;
    if (!fname && fid != null && recordChildId !== fid) continue;
    const t = parseTreatDateParts(r.treatDate);
    if (!t || t.y !== year || t.m !== month || !Number.isFinite(t.d)) continue;
    const idx = findCellIndexForMonthDay(copy, t.d);
    if (idx == null) continue;
    const ev = {
      label: r.title ?? '',
      location: r.hospitalName ?? '',
      memo: r.memo ?? '',
      time: hhmmToKoreanMeridiem(r.treatTime),
      color: calendarLabelBgClassFromChildren(childrenRaw, recordChildId, recordChildName),
      childId: recordChildId || undefined,
      childName: recordChildName || undefined,
      recordId: r.recordId,
    };
    const cell = copy[idx];
    const nextEvents = [...(cell.events ?? []), ev];
    copy[idx] = { ...cell, events: nextEvents };
  }
  return copy;
}

function filterEventsByChild(events, filterChildId, filterChildName, children) {
  if (!Array.isArray(events) || events.length === 0) return events;
  const fid = filterChildId != null && filterChildId !== '' ? String(filterChildId).trim() : '';
  const fname = normalizeChildName(filterChildName);
  if (!fid && !fname) return events;
  return events.filter((event) => {
    const eventChildId = String(event?.childId ?? '').trim();
    const eventChildName =
      normalizeChildName(event?.childName) ||
      normalizeChildName(event?.recordingChildName) ||
      childLegalNameFromList(children, event?.childId);
    if (fname) return eventChildName === fname;
    return eventChildId === fid;
  });
}

function applyChildColorsToEvents(events, children) {
  if (!Array.isArray(events) || events.length === 0) return events;
  return events.map((event) => {
    const eventChildName = event?.childName ?? event?.recordingChildName ?? '';
    const resolvedColor =
      event?.childId != null || eventChildName
        ? calendarLabelBgClassFromChildren(children, event?.childId, eventChildName)
        : null;
    return {
      ...event,
      color: resolvedColor ?? event?.color ?? 'bg-[#FFC721]',
    };
  });
}

function colorHexFromEventLabelClass(colorClass) {
  if (typeof colorClass !== 'string') return '#FFC721';
  const matched = colorClass.match(/#[0-9A-Fa-f]{6}/);
  return matched ? matched[0] : '#FFC721';
}

export default function Calendar({ filterChildId = null, filterChildName = '' }) {
  const navigate = useNavigate();
  const childrenRaw = useChildrenStore((s) => s.children);
  const setChildren = useChildrenStore((s) => s.setChildren);
  const [viewYear, setViewYear] = useState(INITIAL_VIEW_YEAR);
  const [viewMonth, setViewMonth] = useState(INITIAL_VIEW_MONTH);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [closingSheetIndex, setClosingSheetIndex] = useState(null);
  const [cells, setCells] = useState(() => createMonthCells(INITIAL_VIEW_YEAR, INITIAL_VIEW_MONTH));
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
  const sheetCloseTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (sheetCloseTimerRef.current) {
        window.clearTimeout(sheetCloseTimerRef.current);
      }
    };
  }, []);

  const visibleCells = useMemo(
    () =>
      cells.map((cell) => ({
        ...cell,
        events: applyChildColorsToEvents(
          filterEventsByChild(cell.events, filterChildId, filterChildName, childrenRaw),
          childrenRaw
        ),
      })),
    [cells, filterChildId, filterChildName, childrenRaw]
  );

  const activeSheetIndex = selectedIndex ?? closingSheetIndex;
  const selectedCell = activeSheetIndex !== null ? visibleCells[activeSheetIndex] : null;

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
  const selectedWeekDay = activeSheetIndex !== null ? WEEK_DAYS[activeSheetIndex % 7]?.label : '';

  const handleCloseBottomSheet = useCallback(() => {
    if (selectedIndex === null) return;
    if (sheetCloseTimerRef.current) {
      window.clearTimeout(sheetCloseTimerRef.current);
    }
    setClosingSheetIndex(selectedIndex);
    setSelectedIndex(null);
    sheetCloseTimerRef.current = window.setTimeout(() => {
      setClosingSheetIndex(null);
      sheetCloseTimerRef.current = null;
    }, BOTTOM_SHEET_CLOSE_MS);
  }, [selectedIndex]);

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
    if (childrenRaw.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getChildren();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setChildren(list);
      } catch (e) {
        console.error('아이 목록 불러오기 실패', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [childrenRaw.length, setChildren]);

  useEffect(() => {
    if (!TokenManager.getAccessToken()) return;
    let cancelled = false;
    (async () => {
      try {
        const raw = await getMedicalRecord({
          year: viewYear,
          month: viewMonth,
          childId: filterChildId != null ? filterChildId : undefined,
        });
        if (cancelled) return;
        const list = normalizeMedicalRecordList(raw);
        setCells(
          mergeApiMedicalRecordsIntoCells(
            createMonthCells(viewYear, viewMonth),
            list,
            viewYear,
            viewMonth,
            childrenRaw,
            filterChildId,
            filterChildName
          )
        );
      } catch (e) {
        console.error('캘린더 진료 기록 불러오기 실패', e);
        if (!cancelled) {
          setCells(createMonthCells(viewYear, viewMonth));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewYear, viewMonth, filterChildId, filterChildName, childrenRaw]);

  return (
    <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white px-6 pb-6 pt-0">
      <div className="mb-3 shrink-0">
        <CalendarPeriodHeader
          textColor="text-[#AB4C0A]"
          year={viewYear}
          month={viewMonth}
          onChange={(y, m) => {
            setViewYear(y);
            setViewMonth(m);
            setSelectedIndex(null);
            setCells(createMonthCells(y, m));
          }}
          prevButtonClassName="-ml-2"
          className=""
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden pb-6">
        <div className="grid grid-cols-7">
          {WEEK_DAYS.map((day) => (
            <div key={day.label} className={`pb-2 text-center text-sm font-bold ${day.color}`}>
              {day.label}
            </div>
          ))}

          {visibleCells.map((cell, index) => (
            <button
              type="button"
              key={`${cell.day}-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={`box-border flex h-[81px] flex-col overflow-hidden px-[2px] py-[2px] ${
                selectedIndex === index ? 'rounded border border-[#FFC721]' : ''
              }`}
            >
              <div
                className={`flex h-6 shrink-0 items-center justify-center text-[14px] font-bold leading-none ${
                  cell.muted ? 'text-[#252525]/50' : 'text-[#252525]'
                }`}
              >
                {selectedIndex === index ? (
                  <span className="flex size-[20px] items-center justify-center rounded-full bg-[#FFC721] text-[14px] text-white">
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
                        : 'text-[#FFFCF9]'
                    }`}
                    style={
                      event.fromRecording
                        ? undefined
                        : { backgroundColor: colorHexFromEventLabelClass(event.color) }
                    }
                  >
                    {event.label}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none fixed inset-x-0 z-10 flex justify-center"
        style={{
          bottom: 'calc(7.2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="pointer-events-auto flex w-full max-w-112.5 justify-end pr-6">
          <button
            type="button"
            aria-label="음성 입력"
            onClick={() => {
              returnToDayIndexRef.current = null;
              setRecordingOpenedFromSchedule(false);
              setRecordingRecordId(null);
              setIsVoiceModalOpen(true);
            }}
            className={`flex size-13.75 items-center justify-center rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.15)] ${
              isVoiceModalOpen || isVoiceChildSelectOpen || isRecordOpen
                ? 'bg-[#E28906]'
                : 'bg-[#FFC721]'
            }`}
          >
            <MicrophoneIcon
              className={`size-8.25 ${
                isVoiceModalOpen || isVoiceChildSelectOpen || isRecordOpen
                  ? '[&_rect]:fill-[#E28906]'
                  : '[&_rect]:fill-[#FFC721]'
              }`}
            />
          </button>
        </div>
      </div>

      {activeSheetIndex !== null && (
        <button
          type="button"
          aria-label="오버레이 닫기"
          onClick={handleCloseBottomSheet}
          className={`fixed inset-0 z-40 bg-black/35 transition-opacity duration-650 ${
            selectedIndex !== null ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {activeSheetIndex !== null ? (
        <BottomSheet
          key={selectedCell != null ? `${selectedCell.day}-${activeSheetIndex}` : 'sheet-closed'}
          isOpen={selectedIndex !== null}
          selectedLabel={
            selectedCell
              ? `${selectedCell.month}월 ${selectedCell.day}일 ${selectedWeekDay}요일`
              : ''
          }
          events={selectedCell?.events ?? []}
          onClose={handleCloseBottomSheet}
          onSaveEvents={handleSaveDayEvents}
          treatDate={
            selectedCell
              ? toTreatDateYmd(selectedCell.year, selectedCell.month, selectedCell.day)
              : ''
          }
          selectedYear={selectedCell?.year ?? viewYear}
          scheduleAddPrefill={scheduleAddPrefill}
          onScheduleAddPrefillConsumed={clearSchedulePrefill}
          summaryDateText={
            selectedCell
              ? `${selectedCell.year}년 ${selectedCell.month}월 ${selectedCell.day}일`
              : ''
          }
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
      ) : null}

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
        key={`vcs-${isVoiceChildSelectOpen}-${childrenRaw.map((c) => c.childId).join('-') || 'local'}`}
        isOpen={isVoiceChildSelectOpen}
        children={childrenRaw}
        onClose={() => setIsVoiceChildSelectOpen(false)}
        onConfirm={(child) => {
          if (!child) return;
          setSelectedVoiceChild(child);
          setRecordingRecordId(null);
          setRecordingOpenedFromSchedule(false);
          setRecordingCellIndex(null);
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
          recordingOpenedFromSchedule && recordingCellIndex != null && cells[recordingCellIndex]
            ? `${cells[recordingCellIndex].year}년 ${cells[recordingCellIndex].month}월 ${cells[recordingCellIndex].day}일`
            : formatKoreanDateText(new Date())
        }
        onBack={() => {
          setIsRecordOpen(false);
          setRecordingRecordId(null);
          setIsVoiceModalOpen(false);
          setIsVoiceChildSelectOpen(false);
          if (recordingOpenedFromSchedule) {
            const back = returnToDayIndexRef.current;
            returnToDayIndexRef.current = null;
            setRecordingOpenedFromSchedule(false);
            if (back != null) setSelectedIndex(back);
          }
          navigate('/summary', { replace: true });
        }}
        onOpenScheduleFromSummary={({ completedAt, cellIndex, recordId: aiRecordId }) => {
          const completedDate =
            completedAt instanceof Date && !Number.isNaN(completedAt.getTime())
              ? completedAt
              : new Date();
          const targetCells =
            cellIndex == null
              ? createMonthCells(completedDate.getFullYear(), completedDate.getMonth() + 1)
              : cells;
          const resolvedIdx =
            cellIndex != null && cellIndex >= 0
              ? cellIndex
              : findCellIndexForMonthDay(targetCells, completedDate.getDate());
          if (resolvedIdx == null || resolvedIdx < 0) return;
          if (cellIndex == null) {
            setViewYear(completedDate.getFullYear());
            setViewMonth(completedDate.getMonth() + 1);
            setCells(targetCells);
          }
          setScheduleAddPrefill({
            time: formatDateToKoreanMeridiem(completedDate),
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
              medicineText: '',
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
