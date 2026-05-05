import { useCallback, useState } from 'react';

import CalendarIcon from '@/assets/icons/calender.svg?react';
import DownArrowIcon from '@/assets/icons/down-arrow.svg?react';
import PencilIcon from '@/assets/icons/pencil.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';
import { SwipeableEventRow } from '@/components/Summary/CalendarDelete';
import CalenderEdit from '@/components/Summary/CalenderEdit';
import Button from '@/components/common/Button';
import { useCalendarDelete } from '@/hooks/useCalendarDelete';
import { normalizeEventForEdit, useCalendarEdit } from '@/hooks/useCalendarEdit';

function EventRow({ title, time, trailing }) {
  return (
    <div className="flex w-full items-center justify-between px-6 py-5">
      <div className="flex items-center gap-4">
        <span className="h-6 w-1 rounded bg-[#FFC721]" />
        <p className="text-[18px] font-semibold leading-none text-[#8D8782]">{title}</p>
      </div>
      <div className="flex items-center gap-5">
        <span className="text-[15px] font-medium leading-none text-[#C7C1B8]">{time}</span>
        {trailing}
      </div>
    </div>
  );
}

export default function BottomSheet({
  isOpen,
  selectedLabel,
  events = [],
  onClose,
  onAddSchedule = () => {},
  onSaveEvents = () => {},
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
  });

  const [selectedEditRowIndex, setSelectedEditRowIndex] = useState(null);

  const exitEditModesFully = useCallback(() => {
    setSelectedEditRowIndex(null);
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
      });
      openEditForm(index);
    },
    [events, openEditForm]
  );

  const onEnterDeleteMode = useCallback(() => {
    exitEditModesFully();
    enterDeleteMode();
  }, [exitEditModesFully, enterDeleteMode]);

  const handleSaveEdit = useCallback(() => {
    if (editingIndex === null || !formDraft.label.trim()) return;
    const next = events.map((e, i) => {
      if (i !== editingIndex) return { ...e };
      return {
        ...e,
        label: formDraft.label.trim(),
        location: formDraft.location,
        memo: formDraft.memo,
        time: formDraft.time,
        color: formDraft.color ?? e.color,
      };
    });
    onSaveEvents(next);
    exitEditModesFully();
  }, [editingIndex, events, formDraft, onSaveEvents, exitEditModesFully]);

  if (!isOpen) return null;

  const trailingNormal = <DownArrowIcon className="size-[12px]" />;
  const isEditForm = editPhase === 'form';
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
        isEditForm ? 'rounded-tl-[20px] rounded-tr-[30px] pt-[15px]' : 'rounded-t-[28px] pt-7'
      }`}
    >
      <div className="px-6 pb-4">
        {isEditForm ? (
          <div className="mb-1 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <button
                type="button"
                aria-label="뒤로"
                onClick={() => {
                  setSelectedEditRowIndex(null);
                  backToEditList();
                }}
                className="-ml-1 flex size-[25px] shrink-0 items-center justify-center rounded-[8.5px] bg-[#F0F2F5] text-[20px] font-bold leading-none text-[#706963]"
              >
                ‹
              </button>
              <div className="min-w-0 flex-1">{editFormHeaderDateBlock}</div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-[18px] font-medium tracking-[-0.45px] text-[#AB4C0A]">
                수정모드
              </span>
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

      {!isEditForm ? (
        <div className="mx-auto w-[88%] border-t-[0.5px] border-[#A49F9B] opacity-50" />
      ) : null}

      {isEditForm ? (
        <CalenderEdit
          title={formDraft.label}
          location={formDraft.location}
          memo={formDraft.memo}
          timeDisplay={formDraft.time}
          onTitleChange={(v) => setFormDraft((p) => ({ ...p, label: v }))}
          onLocationChange={(v) => setFormDraft((p) => ({ ...p, location: v }))}
          onMemoChange={(v) => setFormDraft((p) => ({ ...p, memo: v }))}
          onTimeChange={(v) => setFormDraft((p) => ({ ...p, time: v }))}
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
                    <EventRow title={event.label} time={rowTime} trailing={trailingNormal} />
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

      <div className={`px-6 pb-6 ${isEditForm ? 'pt-3' : 'pt-8'}`}>
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
        ) : isEditForm ? (
          <>
            <Button
              backgroundColor={saveEditDisabled ? '#B9B2A6' : '#FFC721'}
              textColor="#FFFCF9"
              disabled={saveEditDisabled}
              onClick={() => handleSaveEdit()}
              className="rounded-[10px] font-semibold"
            >
              추가 일정 저장하기
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
              onClick={onAddSchedule}
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
