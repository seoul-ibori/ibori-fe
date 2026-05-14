import { useCallback, useEffect, useRef, useState } from 'react';

import { deleteMedicalRecord, patchMedicalRecord, postMedicalRecord } from '@/api/medicalRecord';
import CalendarIcon from '@/assets/icons/calender.svg?react';
import DownArrowIcon from '@/assets/icons/down-arrow.svg?react';
import LeftArrowIcon from '@/assets/icons/left-arrow.svg?react';
import PencilIcon from '@/assets/icons/pencil.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';
import { SwipeableEventRow } from '@/components/Summary/CalendarDelete';
import CalenderEdit from '@/components/Summary/CalenderEdit';
import CalenderForm from '@/components/Summary/CalenderForm';
import Button from '@/components/common/Button';
import { useCalendarDelete } from '@/hooks/useCalendarDelete';
import { normalizeEventForEdit, useCalendarEdit } from '@/hooks/useCalendarEdit';
import { useChildrenStore } from '@/store/childrenStore';
import { calendarLabelBgClassFromChildren } from '@/utils/calendarChildColor';
import { childLegalNameFromList } from '@/utils/childDisplayName';
import { koreanMeridiemToHHmm } from '@/utils/koreanMeridiemTime';

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

/** POST /medical-records 응답에서 생성 id만 추출 (스키마가 달라도 최대한 대응) */
function recordIdFromCreateResponse(data) {
  if (data == null) return undefined;
  if (typeof data === 'number' && Number.isFinite(data)) return data;
  if (typeof data === 'object') {
    const inner = data.data !== undefined ? data.data : data;
    const id = inner?.id ?? inner?.recordId ?? data.id ?? data.recordId;
    if (typeof id === 'number' && Number.isFinite(id)) return id;
    if (typeof id === 'string' && /^\d+$/.test(id)) return Number(id);
  }
  return undefined;
}

function hexFromTailwindCellColor(colorClass) {
  if (typeof colorClass !== 'string') return '#5AA7FF';
  const m = colorClass.match(/#[0-9A-Fa-f]{6}/);
  return m ? m[0] : '#5AA7FF';
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
  selectedYear = '',
  events = [],
  onClose,
  onAddSchedule = () => {},
  onSaveEvents = () => {},
  scheduleAddPrefill = null,
  onScheduleAddPrefillConsumed = () => {},
  summaryDateText = '',
  onViewRecordingSummary = () => {},
  onRequestRecording = () => {},
  /** 선택한 날짜 `YYYYMMDD` (일정 추가 API용) */
  treatDate = '',
}) {
  const syncDeletedRecords = useCallback(async (removed) => {
    const ids = [
      ...new Set(
        removed
          .map((ev) => ev?.recordId)
          .filter((id) => id != null && Number.isFinite(Number(id)) && Number(id) >= 1)
          .map((id) => Number(id))
      ),
    ];
    await Promise.all(ids.map((id) => deleteMedicalRecord(id)));
  }, []);

  const {
    deleteMode,
    listEvents,
    swipeOffsets,
    enterDeleteMode,
    handleCancelDeleteMode,
    handleCompleteDeleteMode,
    handleOffsetChange,
    removeDraftAt,
    isCommittingDelete,
  } = useCalendarDelete(events, onSaveEvents, { syncDeletedRecords });

  const { editPhase, editingIndex, exitEditModes, enterEditList, openEditForm, backToEditList } =
    useCalendarEdit();

  const childrenFromApi = useChildrenStore((s) => s.children);

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
  const [isPostingSchedule, setIsPostingSchedule] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [formModeVisible, setFormModeVisible] = useState(true);
  const prefillConsumedRef = useRef(onScheduleAddPrefillConsumed);
  const formModeRafRef = useRef(null);

  useEffect(() => {
    prefillConsumedRef.current = onScheduleAddPrefillConsumed;
  }, [onScheduleAddPrefillConsumed]);

  useEffect(() => {
    return () => {
      if (formModeRafRef.current) {
        window.cancelAnimationFrame(formModeRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setSheetVisible(isOpen);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [isOpen]);

  const triggerFormModeInteraction = useCallback(() => {
    if (formModeRafRef.current) {
      window.cancelAnimationFrame(formModeRafRef.current);
    }
    setFormModeVisible(false);
    formModeRafRef.current = window.requestAnimationFrame(() => {
      setFormModeVisible(true);
      formModeRafRef.current = null;
    });
  }, []);

  const exitEditModesFully = useCallback(() => {
    setSelectedEditRowIndex(null);
    setIsAddingForm(false);
    setExpandedRowKey(null);
    setHighlightHospitalLocation(false);
    setAddFormPrimaryLabel('추가 일정 저장하기');
    setAddFormPrimaryBg('#FFC721');
    setAddFormRecordingMeta(null);
    setIsPostingSchedule(false);
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
      triggerFormModeInteraction();
      openEditForm(index);
    },
    [events, openEditForm, triggerFormModeInteraction]
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
    triggerFormModeInteraction();
    setIsAddingForm(true);
    onAddSchedule();
  }, [exitEditModesFully, handleCancelDeleteMode, onAddSchedule, triggerFormModeInteraction]);

  /* Sync summary → 일정 추가 프리필(한 번에 폼 모드 전환) */
  useEffect(() => {
    if (!isOpen || !scheduleAddPrefill) return;
    /* eslint-disable react-hooks/set-state-in-effect -- 외부 프리필을 단일 틱에 폼 상태로 반영 */
    handleCancelDeleteMode();
    exitEditModes();
    setSelectedEditRowIndex(null);
    setExpandedRowKey(null);
    triggerFormModeInteraction();
    setIsAddingForm(true);
    const childId = scheduleAddPrefill.childId ?? '';
    const childIdStr = String(childId).trim();
    const childrenForColor = useChildrenStore.getState().children;
    setFormDraft({
      label: scheduleAddPrefill.label ?? '',
      location: scheduleAddPrefill.location ?? '',
      memo: scheduleAddPrefill.memo ?? '',
      time: scheduleAddPrefill.time ?? '오전 10:30',
      color:
        scheduleAddPrefill.color ??
        (childIdStr ? calendarLabelBgClassFromChildren(childrenForColor, childId) : 'bg-[#FFC721]'),
      childId,
    });
    setHighlightHospitalLocation(Boolean(scheduleAddPrefill.highlightHospitalLocation));
    setAddFormPrimaryLabel(scheduleAddPrefill.saveButtonLabel ?? '추가 일정 저장하기');
    setAddFormPrimaryBg(scheduleAddPrefill.primaryButtonBgColor ?? '#FFC721');
    const metaBase = scheduleAddPrefill.recordingMeta ?? null;
    const existingId = scheduleAddPrefill.existingRecordId;
    setAddFormRecordingMeta(
      metaBase != null || existingId != null
        ? {
            ...(metaBase ?? {}),
            ...(existingId != null && Number.isFinite(Number(existingId)) && Number(existingId) >= 1
              ? { existingRecordId: Number(existingId) }
              : {}),
          }
        : null
    );
    /* eslint-enable react-hooks/set-state-in-effect */
    prefillConsumedRef.current?.();
  }, [
    isOpen,
    scheduleAddPrefill,
    handleCancelDeleteMode,
    exitEditModes,
    triggerFormModeInteraction,
  ]);

  const handleSaveForm = useCallback(async () => {
    if (!formDraft.label.trim()) return;
    const formattedTime = formatKoreanMeridiemTime(formDraft.time);
    const recordingExtras =
      isAddingForm && addFormRecordingMeta
        ? {
            fromRecording: true,
            recordingChildName: addFormRecordingMeta.childName ?? '',
            recordingChildLabelColor: addFormRecordingMeta.childLabelColor ?? '#5AA7FF',
            medicineText: addFormRecordingMeta.medicineText ?? '',
          }
        : {};

    let createdRecordId;

    if (isAddingForm) {
      const childIdStr = String(formDraft.childId ?? '').trim();
      const childIdNum = Number(childIdStr);
      if (!childIdStr || !Number.isFinite(childIdNum) || childIdNum < 1) {
        alert('아이를 선택해 주세요.');
        return;
      }
      if (!treatDate || !/^\d{8}$/.test(treatDate)) {
        alert('일정 날짜를 확인할 수 없습니다.');
        return;
      }
      const existingRecordId = addFormRecordingMeta?.existingRecordId;
      setIsPostingSchedule(true);
      try {
        if (
          existingRecordId != null &&
          Number.isFinite(Number(existingRecordId)) &&
          Number(existingRecordId) >= 1
        ) {
          await patchMedicalRecord(Number(existingRecordId), {
            childId: childIdNum,
            title: formDraft.label.trim(),
            hospitalName: (formDraft.location ?? '').trim(),
            treatDate,
            treatTime: koreanMeridiemToHHmm(formattedTime),
            memo: (formDraft.memo ?? '').trim(),
          });
          createdRecordId = Number(existingRecordId);
        } else {
          const postRes = await postMedicalRecord({
            childId: childIdNum,
            title: formDraft.label.trim(),
            hospitalName: (formDraft.location ?? '').trim(),
            treatDate,
            treatTime: koreanMeridiemToHHmm(formattedTime),
            memo: (formDraft.memo ?? '').trim(),
          });
          createdRecordId = recordIdFromCreateResponse(postRes);
        }
      } catch (err) {
        const data = err?.response?.data;
        const msg =
          (typeof data?.message === 'string' && data.message) ||
          (typeof data === 'string' ? data : null) ||
          err?.message ||
          '일정 저장에 실패했습니다.';
        alert(msg);
        return;
      } finally {
        setIsPostingSchedule(false);
      }
    } else if (editingIndex !== null) {
      const rawId = events[editingIndex]?.recordId;
      const recordId = rawId != null ? Number(rawId) : NaN;
      if (Number.isFinite(recordId) && recordId >= 1) {
        const childIdStr = String(formDraft.childId ?? '').trim();
        const childIdNum = Number(childIdStr);
        if (!childIdStr || !Number.isFinite(childIdNum) || childIdNum < 1) {
          alert('아이를 선택해 주세요.');
          return;
        }
        setIsPostingSchedule(true);
        try {
          await patchMedicalRecord(recordId, {
            childId: childIdNum,
            title: formDraft.label.trim(),
            hospitalName: (formDraft.location ?? '').trim(),
            treatTime: koreanMeridiemToHHmm(formattedTime),
            memo: (formDraft.memo ?? '').trim(),
          });
        } catch (err) {
          const data = err?.response?.data;
          const msg =
            (typeof data?.message === 'string' && data.message) ||
            (typeof data === 'string' ? data : null) ||
            err?.message ||
            '일정 수정에 실패했습니다.';
          alert(msg);
          return;
        } finally {
          setIsPostingSchedule(false);
        }
      }
    }

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
            childName:
              childLegalNameFromList(childrenFromApi, formDraft.childId || '') || undefined,
            ...(createdRecordId != null ? { recordId: createdRecordId } : {}),
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
            childName:
              childLegalNameFromList(childrenFromApi, formDraft.childId || '') || undefined,
          };
        });

    onSaveEvents(next);
    exitEditModesFully();
  }, [
    addFormRecordingMeta,
    childrenFromApi,
    editingIndex,
    events,
    formDraft,
    isAddingForm,
    onSaveEvents,
    exitEditModesFully,
    treatDate,
  ]);

  const isEditForm = editPhase === 'form';
  const isFormMode = isEditForm || isAddingForm;
  const isEditList = editPhase === 'list';
  const patchTargetRecordId =
    !isAddingForm && editingIndex !== null
      ? (() => {
          const raw = events[editingIndex]?.recordId;
          if (raw == null) return null;
          const n = Number(raw);
          return Number.isFinite(n) && n >= 1 ? n : null;
        })()
      : null;
  const requiresChildForApi = isAddingForm || patchTargetRecordId != null;
  const saveEditDisabled =
    !formDraft.label.trim() ||
    (requiresChildForApi && !String(formDraft.childId ?? '').trim()) ||
    isPostingSchedule;

  const formSaveLabel = isAddingForm ? addFormPrimaryLabel : '수정 저장하기';
  const formSaveBg = saveEditDisabled ? '#B9B2A6' : isAddingForm ? addFormPrimaryBg : '#FFC721';

  const headerDateBlock = (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
        <CalendarIcon className="size-12" />
      </div>
      <div>
        <p className="text-[15px] font-bold leading-none text-[#777]">{selectedYear}년</p>
        <p className="mt-2 text-[18px] font-bold leading-none text-black">{selectedLabel}</p>
      </div>
    </div>
  );

  const editFormHeaderDateBlock = (
    <div className="mt-[10px] flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        <CalendarIcon className="size-8" />
      </div>
      <div>
        <p className="mt-[4px] text-[16px] font-medium leading-none text-[#706963]">
          {selectedYear}년
        </p>
        <p className="mt-1 text-[18px] font-bold leading-none text-black">{selectedLabel}</p>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed bottom-0 left-1/2 z-50 w-full max-w-112.5 -translate-x-1/2 bg-white shadow-[0_-8px_20px_rgba(18,18,23,0.1)] transition-transform duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        sheetVisible ? 'translate-y-0' : 'translate-y-[calc(100%+24px)]'
      } ${
        isFormMode
          ? 'flex flex-col rounded-tl-[20px] rounded-tr-[30px] pt-[12px]'
          : 'rounded-t-[28px] pt-7'
      }`}
      style={isFormMode ? { height: 'min(34rem, calc(100dvh - 7.5rem))' } : undefined}
    >
      <div
        className={`${
          isFormMode ? 'flex h-full flex-col' : 'block'
        } transition-[transform,opacity] duration-650 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isFormMode && !formModeVisible ? 'translate-y-12 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="shrink-0 px-6 pb-4">
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
                  className="-ml-1 mt-3 flex size-[25px] shrink-0 items-center justify-center rounded-[8.5px] bg-[#F0F2F5] text-[#706963]"
                >
                  <LeftArrowIcon className="h-[12px] w-[9px]" />
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
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <CalenderEdit
              key={isAddingForm ? 'schedule-add' : `schedule-edit-${editingIndex ?? 'x'}`}
              title={formDraft.label}
              location={formDraft.location}
              memo={formDraft.memo}
              timeDisplay={formDraft.time}
              selectedChildId={formDraft.childId}
              childrenList={childrenFromApi}
              showChildSelect={isAddingForm || patchTargetRecordId != null}
              highlightHospitalLocation={highlightHospitalLocation}
              onTitleChange={(v) => setFormDraft((p) => ({ ...p, label: v }))}
              onLocationChange={(v) => {
                setFormDraft((p) => ({ ...p, location: v }));
                if (v.trim()) setHighlightHospitalLocation(false);
              }}
              onMemoChange={(v) => setFormDraft((p) => ({ ...p, memo: v }))}
              onTimeChange={(v) => setFormDraft((p) => ({ ...p, time: v }))}
              onChildIdChange={(id) =>
                setFormDraft((p) => ({
                  ...p,
                  childId: id,
                  color:
                    id != null && String(id).trim() !== ''
                      ? calendarLabelBgClassFromChildren(childrenFromApi, id)
                      : 'bg-[#FFC721]',
                }))
              }
            />
          </div>
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
                            key={event.recordId != null ? `mr-${event.recordId}` : rowKey}
                            label={event.label}
                            time={rowTime}
                            location={event.location}
                            memo={event.memo}
                            childId={event.childId}
                            childLabelColor={hexFromTailwindCellColor(event.color)}
                            childDisplayName={childLegalNameFromList(
                              childrenFromApi,
                              event.childId ?? ''
                            )}
                            fromRecording={Boolean(event.fromRecording)}
                            medicineText={event.medicineText ?? ''}
                            recordId={event.recordId}
                            onViewSummary={(meta) =>
                              onViewRecordingSummary({
                                childName:
                                  meta?.childName ??
                                  event.recordingChildName ??
                                  childLegalNameFromList(childrenFromApi, event.childId ?? '') ??
                                  '',
                                childLabelColor:
                                  meta?.childLabelColor ??
                                  event.recordingChildLabelColor ??
                                  hexFromTailwindCellColor(event.color),
                                summaryDateText,
                                eventIndex: index,
                                recordId: meta?.recordId ?? event.recordId ?? null,
                                scheduleTitle: meta?.scheduleTitle ?? event.label ?? '',
                              })
                            }
                            onAddRecording={(args) =>
                              onRequestRecording({
                                recordId: args?.recordId ?? event.recordId ?? null,
                                childId: args?.childId ?? event.childId ?? null,
                                childName: args?.childName ?? '',
                                childLabelColor:
                                  args?.childLabelColor ?? hexFromTailwindCellColor(event.color),
                              })
                            }
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

        <div className={`shrink-0 px-6 pb-6 ${isFormMode ? 'pt-8' : 'pt-8'}`}>
          {deleteMode ? (
            <>
              <button
                type="button"
                disabled={isCommittingDelete}
                onClick={() => void handleCompleteDeleteMode()}
                className="h-14 w-full rounded-xl bg-[#FFC721] text-[18px] font-bold leading-none text-white disabled:opacity-60"
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
                bgColor={formSaveBg}
                textColor="#FFFCF9"
                disabled={saveEditDisabled}
                onClick={() => void handleSaveForm()}
                className="rounded-[10px] font-semibold"
              >
                {formSaveLabel}
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
    </div>
  );
}
