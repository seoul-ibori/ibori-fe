import { useCallback, useEffect, useRef, useState } from 'react';

import CalendarIcon from '@/assets/icons/calender.svg?react';
import DownArrowIcon from '@/assets/icons/down-arrow.svg?react';
import PencilIcon from '@/assets/icons/pencil.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';
import { SwipeableEventRow } from '@/components/Summary/CalendarDelete';
import CalenderEdit from '@/components/Summary/CalenderEdit';
import CalenderForm from '@/components/Summary/CalenderForm';
import Button from '@/components/common/Button';
import { getRegisteredChildFullName } from '@/constants/voiceChildren';
import { useCalendarDelete } from '@/hooks/useCalendarDelete';
import { normalizeEventForEdit, useCalendarEdit } from '@/hooks/useCalendarEdit';

function EventRow({ title, time, trailing, fromRecording = false }) {
  const titleClass = fromRecording
    ? 'text-[18px] font-bold leading-none text-[#FF3D00]'
    : 'text-[18px] font-semibold leading-none text-[#8D8782]';

  return (
    <div className="flex w-full items-center justify-between px-6 py-5">
      <div className="flex items-center gap-4">
        <span className="h-6 w-1 rounded bg-[#FFC721]" />
        <p className={titleClass}>{title}</p>
      </div>
      <div className="flex items-center gap-5">
        <span className="text-[15px] font-medium leading-none text-[#C7C1B8]">{time}</span>
        {trailing}
      </div>
    </div>
  );
}

function formatKoreanMeridiemTime(value) {
  if (!value) return '오전 10:30';
  const already = value.match(/^(오전|오후)\s*\d{1,2}:\d{2}$/);
  if (already) return value;

  const hhmm = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!hhmm) return value;

  const hour24 = Math.min(23, Math.max(0, Number(hhmm[1])));
  const minute = Math.min(59, Math.max(0, Number(hhmm[2])));
  const meridiem = hour24 < 12 ? '오전' : '오후';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${meridiem} ${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function BottomSheet({
  isOpen,
  selectedLabel,
  events = [],
  onClose,
  onAddSchedule = () => {},
  onSaveEvents = () => {},
  scheduleAddPrefill = null,
  onScheduleAddPrefillConsumed = () => {},
  summaryDateText = '',
  onViewRecordingSummary = () => {},
  onRequestRecording = () => {},
}) {
  const {
    deleteMode,
    listEvents,
    swipeOffsets,
    enterDeleteMode,
    handleCancelDeleteMode,
    handleCompleteDeleteMode,
    handleOffsetChange,
    removeDraftAt,
  } = useCalendarDelete(events, onSaveEvents);

  const { editPhase, editingIndex, exitEditModes, enterEditList, openEditForm, backToEditList } =
    useCalendarEdit();

  const [formDraft, setFormDraft] = useState({
    label: '',
    location: '',
    memo: '',
    time: '오전 10:30',
    color: 'bg-[#FFC721]',
    childId: '',
  });

  const [selectedEditRowIndex, setSelectedEditRowIndex] = useState(null);
  const [isAddingForm, setIsAddingForm] = useState(false);
  const [expandedRowKey, setExpandedRowKey] = useState(null);
  const [highlightHospitalLocation, setHighlightHospitalLocation] = useState(false);
  const [addFormPrimaryLabel, setAddFormPrimaryLabel] = useState('추가 일정 저장하기');
  const [addFormPrimaryBg, setAddFormPrimaryBg] = useState('#FFC721');
  const [addFormRecordingMeta, setAddFormRecordingMeta] = useState(null);
  const prefillConsumedRef = useRef(onScheduleAddPrefillConsumed);

  useEffect(() => {
    prefillConsumedRef.current = onScheduleAddPrefillConsumed;
  }, [onScheduleAddPrefillConsumed]);

  const exitEditModesFully = useCallback(() => {
    setSelectedEditRowIndex(null);
    setIsAddingForm(false);
    setExpandedRowKey(null);
    setHighlightHospitalLocation(false);
    setAddFormPrimaryLabel('추가 일정 저장하기');
    setAddFormPrimaryBg('#FFC721');
    setAddFormRecordingMeta(null);
    exitEditModes();
  }, [exitEditModes]);

  const openEditFormWithDraft = useCallback(
    (index) => {
      const ev = events[index];
      if (!ev) return;
      const n = normalizeEventForEdit(ev);
      setFormDraft({
        label: n.label,
        location: n.location,
        memo: n.memo,
        time: n.time,
        color: n.color,
        childId: n.childId ?? '',
      });
      openEditForm(index);
    },
    [events, openEditForm]
  );

  const onEnterDeleteMode = useCallback(() => {
    exitEditModesFully();
    enterDeleteMode();
  }, [exitEditModesFully, enterDeleteMode]);

  const openAddScheduleForm = useCallback(() => {
    exitEditModesFully();
    handleCancelDeleteMode();
    setHighlightHospitalLocation(false);
    setAddFormPrimaryLabel('추가 일정 저장하기');
    setAddFormPrimaryBg('#FFC721');
    setAddFormRecordingMeta(null);
    setFormDraft({
      label: '',
      location: '',
      memo: '',
      time: '오전 10:30',
      color: 'bg-[#FFC721]',
      childId: '',
    });
    setIsAddingForm(true);
    onAddSchedule();
  }, [exitEditModesFully, handleCancelDeleteMode, onAddSchedule]);

  /* Sync summary → 일정 추가 프리필(한 번에 폼 모드 전환) */
  useEffect(() => {
    if (!isOpen || !scheduleAddPrefill) return;
    /* eslint-disable react-hooks/set-state-in-effect -- 외부 프리필을 단일 틱에 폼 상태로 반영 */
    handleCancelDeleteMode();
    exitEditModes();
    setSelectedEditRowIndex(null);
    setExpandedRowKey(null);
    setIsAddingForm(true);
    const childId = scheduleAddPrefill.childId ?? '';
    setFormDraft({
      label: scheduleAddPrefill.label ?? '',
      location: scheduleAddPrefill.location ?? '',
      memo: scheduleAddPrefill.memo ?? '',
      time: scheduleAddPrefill.time ?? '오전 10:30',
      color: scheduleAddPrefill.color ?? 'bg-[#FFC721]',
      childId,
    });
    setHighlightHospitalLocation(Boolean(scheduleAddPrefill.highlightHospitalLocation));
    setAddFormPrimaryLabel(scheduleAddPrefill.saveButtonLabel ?? '추가 일정 저장하기');
    setAddFormPrimaryBg(scheduleAddPrefill.primaryButtonBgColor ?? '#FFC721');
    setAddFormRecordingMeta(scheduleAddPrefill.recordingMeta ?? null);
    /* eslint-enable react-hooks/set-state-in-effect */
    prefillConsumedRef.current?.();
  }, [isOpen, scheduleAddPrefill, handleCancelDeleteMode, exitEditModes]);

  const handleSaveForm = useCallback(() => {
    if (!formDraft.label.trim()) return;
    const formattedTime = formatKoreanMeridiemTime(formDraft.time);
    const recordingExtras =
      isAddingForm && addFormRecordingMeta
        ? {
            fromRecording: true,
            recordingChildName: addFormRecordingMeta.childName ?? '',
            recordingChildLabelColor: addFormRecordingMeta.childLabelColor ?? '#5AA7FF',
            medicineText: addFormRecordingMeta.medicineText ?? '항히스타민제 알비다정10mg',
          }
        : {};

    const next = isAddingForm
      ? [
          ...events.map((e) => ({ ...e })),
          {
            label: formDraft.label.trim(),
            location: formDraft.location,
            memo: formDraft.memo,
            time: formattedTime,
            color: formDraft.color ?? 'bg-[#FFC721]',
            childId: formDraft.childId || undefined,
            ...recordingExtras,
          },
        ]
      : events.map((e, i) => {
          if (i !== editingIndex) return { ...e };
          return {
            ...e,
            label: formDraft.label.trim(),
            location: formDraft.location,
            memo: formDraft.memo,
            time: formattedTime,
            color: formDraft.color ?? e.color,
            childId: formDraft.childId || undefined,
          };
        });

    onSaveEvents(next);
    exitEditModesFully();
  }, [
    addFormRecordingMeta,
    editingIndex,
    events,
    formDraft,
    isAddingForm,
    onSaveEvents,
    exitEditModesFully,
  ]);

  if (!isOpen) return null;

  const isEditForm = editPhase === 'form';
  const isFormMode = isEditForm || isAddingForm;
  const isEditList = editPhase === 'list';
  const saveEditDisabled = !formDraft.label.trim();

  const headerDateBlock = (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
        <CalendarIcon className="size-12" />
      </div>
      <div>
        <p className="text-[15px] font-bold leading-none text-[#777]">2026년</p>
        <p className="mt-2 text-[18px] font-bold leading-none text-black">{selectedLabel}</p>
      </div>
    </div>
  );

  const editFormHeaderDateBlock = (
    <div className="mt-[10px] flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        <CalendarIcon className="size-10" />
      </div>
      <div>
        <p className="mt-[4px] text-[16px] font-medium leading-none text-[#706963]">2026년</p>
        <p className="mt-1 text-[18px] font-bold leading-none text-black">{selectedLabel}</p>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed bottom-0 left-1/2 z-50 w-full max-w-112.5 -translate-x-1/2 bg-white shadow-[0_-8px_20px_rgba(18,18,23,0.1)] ${
        isFormMode ? 'rounded-tl-[20px] rounded-tr-[30px] pt-[15px]' : 'rounded-t-[28px] pt-7'
      }`}
    >
      <div className="px-6 pb-4">
        {isFormMode ? (
          <div className="mb-1 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <button
                type="button"
                aria-label="뒤로"
                onClick={() => {
                  setSelectedEditRowIndex(null);
                  if (isAddingForm) {
                    setIsAddingForm(false);
                    return;
                  }
                  backToEditList();
                }}
                className="-ml-1 flex size-[25px] shrink-0 items-center justify-center rounded-[8.5px] bg-[#F0F2F5] text-[20px] font-bold leading-none text-[#706963]"
              >
                ‹
              </button>
              <div className="min-w-0 flex-1">{editFormHeaderDateBlock}</div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-[15px] font-bold text-[#AB4C0A]">수정모드</span>
              <div className="flex size-[25px] items-center justify-center rounded-md bg-[#AB4C0A]">
                <PencilIcon className="size-3 [&_path]:fill-[#FFC721]" />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-2 flex items-start justify-between">
            {headerDateBlock}
            <div className="flex items-center gap-3">
              {deleteMode ? (
                <>
                  <span className="text-[15px] font-bold text-[#AB4C0A]">삭제모드</span>
                  <button
                    type="button"
                    aria-label="삭제 모드 해제"
                    onClick={() => handleCancelDeleteMode()}
                    className="flex size-9 items-center justify-center rounded-xl bg-[#AB4C0A]"
                  >
                    <TrashIcon className="size-3 [&_path]:fill-[#FFC721]" />
                  </button>
                </>
              ) : isEditList ? (
                <>
                  <span className="text-[15px] font-bold text-[#AB4C0A]">수정모드</span>
                  <button
                    type="button"
                    aria-label="수정 모드 종료"
                    onClick={() => exitEditModesFully()}
                    className="flex size-8 items-center justify-center rounded-xl bg-[#AB4C0A]"
                  >
                    <PencilIcon className="size-3 [&_path]:fill-[#FFC721]" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    aria-label="수정 모드"
                    onClick={() => {
                      handleCancelDeleteMode();
                      setSelectedEditRowIndex(null);
                      enterEditList();
                    }}
                    className="flex size-9 items-center justify-center rounded-xl bg-[#FFC721] text-xl text-[#773C14]"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="삭제 모드"
                    onClick={() => onEnterDeleteMode()}
                    className="flex size-9 items-center justify-center rounded-xl bg-[#FFC721] text-xl text-[#773C14]"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {!isFormMode ? (
        <div className="mx-auto w-[88%] border-t-[0.5px] border-[#A49F9B] opacity-50" />
      ) : null}

      {isFormMode ? (
        <CalenderEdit
          key={isAddingForm ? 'schedule-add' : `schedule-edit-${editingIndex ?? 'x'}`}
          title={formDraft.label}
          location={formDraft.location}
          memo={formDraft.memo}
          timeDisplay={formDraft.time}
          selectedChildId={formDraft.childId}
          showChildSelect={isAddingForm}
          highlightHospitalLocation={highlightHospitalLocation}
          onTitleChange={(v) => setFormDraft((p) => ({ ...p, label: v }))}
          onLocationChange={(v) => {
            setFormDraft((p) => ({ ...p, location: v }));
            if (v.trim()) setHighlightHospitalLocation(false);
          }}
          onMemoChange={(v) => setFormDraft((p) => ({ ...p, memo: v }))}
          onTimeChange={(v) => setFormDraft((p) => ({ ...p, time: v }))}
          onChildIdChange={(id) => setFormDraft((p) => ({ ...p, childId: id }))}
        />
      ) : (
        <div>
          {listEvents.length > 0 ? (
            listEvents.map((event, index) => {
              const rowKey = `${index}-${event.label}`;
              const rowTime = event.time ?? '오전 10:30';
              const rowSelected = isEditList && selectedEditRowIndex === index;
              return (
                <div key={rowKey}>
                  {index > 0 && !deleteMode ? (
                    <div className="mx-auto h-[0.5px] w-[88%] bg-[#A49F9B]/50" aria-hidden />
                  ) : null}
                  {deleteMode ? (
                    <SwipeableEventRow
                      rowKey={rowKey}
                      offset={swipeOffsets[rowKey] ?? 0}
                      onOffsetChange={handleOffsetChange}
                      showDividerAbove={index > 0}
                      deleteLabel={event.label}
                      onDeleteRow={() => removeDraftAt(index)}
                    >
                      <EventRow
                        title={event.label}
                        time={rowTime}
                        fromRecording={Boolean(event.fromRecording)}
                        trailing={
                          <span className="text-[22px] font-medium leading-none text-[#C7C1B8]">
                            ›
                          </span>
                        }
                      />
                    </SwipeableEventRow>
                  ) : isEditList ? (
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`${event.label} 선택`}
                      aria-pressed={rowSelected}
                      onClick={() =>
                        setSelectedEditRowIndex((prev) => (prev === index ? null : index))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedEditRowIndex((prev) => (prev === index ? null : index));
                        }
                      }}
                      className={`w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[#FFC721]/50 ${
                        rowSelected ? 'bg-[#FAF7F2]' : 'bg-white'
                      }`}
                    >
                      <EventRow
                        title={event.label}
                        time={rowTime}
                        fromRecording={Boolean(event.fromRecording)}
                        trailing={
                          <button
                            type="button"
                            aria-label={`${event.label} 수정`}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditFormWithDraft(index);
                            }}
                            className="flex size-8 items-center justify-center"
                          >
                            <PencilIcon className="size-4 [&_path]:fill-[#8D8782]" />
                          </button>
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <EventRow
                        title={event.label}
                        time={rowTime}
                        fromRecording={Boolean(event.fromRecording)}
                        trailing={
                          <button
                            type="button"
                            aria-label={`${event.label} 상세 토글`}
                            onClick={() =>
                              setExpandedRowKey((prev) => (prev === rowKey ? null : rowKey))
                            }
                            className="flex size-8 items-center justify-center"
                          >
                            <DownArrowIcon
                              className={`size-[12px] transition-transform ${
                                expandedRowKey === rowKey ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        }
                      />
                      {expandedRowKey === rowKey ? (
                        <CalenderForm
                          label={event.label}
                          time={rowTime}
                          location={event.location}
                          memo={event.memo}
                          childDisplayName={getRegisteredChildFullName(event.childId ?? '')}
                          fromRecording={Boolean(event.fromRecording)}
                          medicineText={event.medicineText ?? '항히스타민제 알비다정10mg'}
                          onViewSummary={() =>
                            onViewRecordingSummary({
                              childName: event.recordingChildName ?? '',
                              childLabelColor: event.recordingChildLabelColor ?? '#5AA7FF',
                              summaryDateText,
                              eventIndex: index,
                            })
                          }
                          onAddRecording={onRequestRecording}
                        />
                      ) : null}
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-6 py-8 text-center text-[18px] text-[#B7ADA5]">
              등록된 일정이 없습니다.
            </div>
          )}
        </div>
      )}

      <div className={`px-6 pb-6 ${isFormMode ? 'pt-3' : 'pt-8'}`}>
        {deleteMode ? (
          <>
            <button
              type="button"
              onClick={() => handleCompleteDeleteMode()}
              className="h-14 w-full rounded-xl bg-[#FFC721] text-[18px] font-bold leading-none text-white"
            >
              완료
            </button>
            <button
              type="button"
              onClick={() => handleCancelDeleteMode()}
              className="mt-4 w-full text-center text-[15px] font-medium leading-none text-[#C8BFB7]"
            >
              취소하기 / 돌아가기
            </button>
          </>
        ) : isFormMode ? (
          <>
            <Button
              bgColor={saveEditDisabled ? '#B9B2A6' : addFormPrimaryBg}
              textColor="#FFFCF9"
              disabled={saveEditDisabled}
              onClick={() => handleSaveForm()}
              className="rounded-[10px] font-semibold"
            >
              {addFormPrimaryLabel}
            </Button>
            <button
              type="button"
              onClick={() => exitEditModesFully()}
              className="mt-3 w-full text-center text-[15px] font-medium leading-normal text-[#B9B2A6]"
            >
              취소하기/ 돌아가기
            </button>
          </>
        ) : isEditList ? (
          <>
            <Button
              backgroundColor={
                selectedEditRowIndex !== null && selectedEditRowIndex < listEvents.length
                  ? '#FFC721'
                  : '#B9B2A6'
              }
              textColor="#FFFFFF"
              disabled={listEvents.length === 0}
              onClick={() => {
                if (listEvents.length === 0) return;
                if (selectedEditRowIndex !== null && selectedEditRowIndex < listEvents.length) {
                  openEditFormWithDraft(selectedEditRowIndex);
                  return;
                }
                exitEditModesFully();
                enterDeleteMode();
              }}
            >
              {selectedEditRowIndex !== null && selectedEditRowIndex < listEvents.length
                ? '수정하러 가기'
                : '삭제 저장하기'}
            </Button>
            <button
              type="button"
              onClick={() => exitEditModesFully()}
              className="mt-4 w-full text-center text-[15px] font-medium leading-none text-[#C8BFB7]"
            >
              취소하기 / 돌아가기
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={openAddScheduleForm}
              className="h-14 w-full rounded-xl bg-[#FFC721] text-[18px] font-semibold leading-none text-white"
            >
              일정 추가하기
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full text-center text-[15px] font-medium leading-none text-[#C8BFB7]"
            >
              아래 창 닫기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
