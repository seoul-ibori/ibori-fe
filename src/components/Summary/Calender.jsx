import { useCallback, useState } from 'react';

import MicrophoneIcon from '@/assets/icons/summary/microphone.svg?react';
import BottomSheet from '@/components/Summary/BottomSheet';
import Record from '@/components/Summary/Record';
import SummaryRecord from '@/components/Summary/SummaryRecord';
import VoiceChildSelectScreen from '@/components/Summary/VoiceChildSelectScreen';
import Modal from '@/components/common/Modal';
import { CELLS, WEEK_DAYS } from '@/constants/calenderDummyData';
import { formatDateToKoreanMeridiem } from '@/utils/koreanMeridiemTime';

function cloneCells(source) {
  return source.map((cell) => ({
    ...cell,
    events: cell.events?.map((e) => ({ ...e })),
  }));
}

export default function Calendar() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [cells, setCells] = useState(() => cloneCells(CELLS));
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isVoiceChildSelectOpen, setIsVoiceChildSelectOpen] = useState(false);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedVoiceChild, setSelectedVoiceChild] = useState(null);
  const [recordingCellIndex, setRecordingCellIndex] = useState(null);
  const [scheduleAddPrefill, setScheduleAddPrefill] = useState(null);
  const [recordingSummaryView, setRecordingSummaryView] = useState(null);

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
              {cell.events?.map((event) => (
                <div
                  key={event.label}
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
        onClick={() => setIsVoiceModalOpen(true)}
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
        scheduleAddPrefill={scheduleAddPrefill}
        onScheduleAddPrefillConsumed={clearSchedulePrefill}
        summaryDateText={selectedCell ? `2026년 4월 ${selectedCell.day}일` : ''}
        onViewRecordingSummary={(payload) => {
          setRecordingSummaryView({
            childName: payload.childName || '우리집 아들',
            childLabelColor: payload.childLabelColor || '#5AA7FF',
            summaryDateText: payload.summaryDateText ?? '',
          });
        }}
      />

      {recordingSummaryView ? (
        <SummaryRecord
          childName={recordingSummaryView.childName}
          childLabelColor={recordingSummaryView.childLabelColor}
          summaryDateText={recordingSummaryView.summaryDateText}
          hideScheduleCta
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
          setRecordingCellIndex(resolveRecordingCellIndex());
          setIsVoiceChildSelectOpen(false);
          setIsRecordOpen(true);
        }}
      />

      <Record
        isOpen={isRecordOpen}
        childName={selectedVoiceChild?.name ?? ''}
        childLabelColor={selectedVoiceChild?.labelColor ?? '#5AA7FF'}
        recordingCellIndex={recordingCellIndex}
        summaryDateText={
          recordingCellIndex != null && cells[recordingCellIndex]
            ? `2026년 4월 ${cells[recordingCellIndex].day}일`
            : ''
        }
        onBack={() => {
          setIsRecordOpen(false);
          setIsVoiceChildSelectOpen(true);
        }}
        onOpenScheduleFromSummary={({ completedAt, cellIndex }) => {
          if (cellIndex == null || cellIndex < 0) return;
          setScheduleAddPrefill({
            time: formatDateToKoreanMeridiem(completedAt),
            location: '',
            label: '',
            memo: '',
            highlightHospitalLocation: true,
            saveButtonLabel: '녹음 저장하기',
            primaryButtonBgColor: '#B9B2A6',
            recordingMeta: {
              childName: selectedVoiceChild?.name ?? '',
              childLabelColor: selectedVoiceChild?.labelColor ?? '#5AA7FF',
              medicineText: '항히스타민제 알비다정10mg',
            },
          });
          setIsRecordOpen(false);
          setIsVoiceChildSelectOpen(false);
          setIsVoiceModalOpen(false);
          setSelectedIndex(cellIndex);
        }}
      />
    </section>
  );
}
