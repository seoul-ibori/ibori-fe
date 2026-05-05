import { useCallback, useRef, useState } from 'react';

import CalendarIcon from '@/assets/icons/calender.svg?react';
import DownArrowIcon from '@/assets/icons/down-arrow.svg?react';
import PencilIcon from '@/assets/icons/pencil.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';

const DELETE_BTN_WIDTH = 72;

function EventRow({ title, time, trailing }) {
  return (
    <div className="flex items-center justify-between px-6 py-5">
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

function SwipeableEventRow({
  rowKey,
  title,
  time,
  offset,
  onOffsetChange,
  showDividerAbove,
  onDeleteRow,
}) {
  const [dragging, setDragging] = useState(false);
  const pointerIdRef = useRef(null);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);

  const clamp = useCallback((value) => Math.min(0, Math.max(-DELETE_BTN_WIDTH, value)), []);

  const endDrag = useCallback(
    (clientX) => {
      const dx = clientX - startXRef.current;
      const next = clamp(startOffsetRef.current + dx);
      const snapped = next < -DELETE_BTN_WIDTH / 2 ? -DELETE_BTN_WIDTH : 0;
      onOffsetChange(rowKey, snapped);
      setDragging(false);
      pointerIdRef.current = null;
    },
    [clamp, onOffsetChange, rowKey]
  );

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    startOffsetRef.current = offset;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - startXRef.current;
    onOffsetChange(rowKey, clamp(startOffsetRef.current + dx));
  };

  const onPointerUp = (e) => {
    if (pointerIdRef.current !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    endDrag(e.clientX);
  };

  const onPointerCancel = () => {
    setDragging(false);
    pointerIdRef.current = null;
    onOffsetChange(rowKey, 0);
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        role="presentation"
        className="flex touch-none select-none flex-col gap-0"
        style={{
          width: `calc(100% + ${DELETE_BTN_WIDTH}px)`,
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {showDividerAbove ? (
          <div className="mx-auto block h-px w-[88%] shrink-0 bg-[#A49F9B]/50" aria-hidden />
        ) : null}
        <div className="flex items-stretch gap-0">
          <div className="flex min-w-0 flex-1 flex-col bg-white">
            <EventRow
              title={title}
              time={time}
              trailing={
                <span className="text-[22px] font-medium leading-none text-[#C7C1B8]">›</span>
              }
            />
          </div>
          <button
            type="button"
            aria-label={`${title} 일정 삭제`}
            className="pointer-events-auto z-10 flex w-[72px] shrink-0 flex-col items-center justify-center self-stretch bg-[#A8A19A] text-[14px] font-bold leading-none text-white"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRow();
            }}
          >
            삭제
          </button>
        </div>
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
  const [deleteMode, setDeleteMode] = useState(false);
  const [swipeOffsets, setSwipeOffsets] = useState({});
  const [draftEvents, setDraftEvents] = useState([]);

  const resetDeleteUi = useCallback(() => {
    setDeleteMode(false);
    setSwipeOffsets({});
  }, []);

  const enterDeleteMode = useCallback(() => {
    setDraftEvents(events.map((e) => ({ ...e })));
    setDeleteMode(true);
  }, [events]);

  const handleOffsetChange = useCallback((key, value) => {
    setSwipeOffsets((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeDraftAt = useCallback((index) => {
    setDraftEvents((prev) => prev.filter((_, i) => i !== index));
    setSwipeOffsets({});
  }, []);

  const handleCancelDeleteMode = useCallback(() => {
    resetDeleteUi();
  }, [resetDeleteUi]);

  const handleCompleteDeleteMode = useCallback(() => {
    onSaveEvents(draftEvents);
    resetDeleteUi();
  }, [draftEvents, onSaveEvents, resetDeleteUi]);

  const listEvents = deleteMode ? draftEvents : events;

  if (!isOpen) return null;

  const trailingNormal = <DownArrowIcon className="size-[12px]" />;

  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-112.5 -translate-x-1/2 rounded-t-[28px] bg-white pt-7 shadow-[0_-8px_20px_rgba(18,18,23,0.1)]">
      <div className="px-6 pb-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl">
              <CalendarIcon className="size-12" />
            </div>
            <div>
              <p className="text-[15px] font-bold leading-none text-[#777]">2026년</p>
              <p className="mt-2 text-[18px] font-bold leading-none text-black">{selectedLabel}</p>
            </div>
          </div>
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
            ) : (
              <>
                <button
                  type="button"
                  aria-label="편집"
                  className="flex size-9 items-center justify-center rounded-xl bg-[#FFC721] text-xl text-[#773C14]"
                >
                  <PencilIcon className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="삭제 모드"
                  onClick={() => enterDeleteMode()}
                  className="flex size-9 items-center justify-center rounded-xl bg-[#FFC721] text-xl text-[#773C14]"
                >
                  <TrashIcon className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-[88%] border-t-[0.5px] border-[#A49F9B] opacity-50" />

      <div>
        {listEvents.length > 0 ? (
          listEvents.map((event, index) => {
            const rowKey = `${index}-${event.label}`;
            return (
              <div key={rowKey}>
                {index > 0 && !deleteMode ? (
                  <div className="mx-auto h-[0.5px] w-[88%] bg-[#A49F9B]/50" aria-hidden />
                ) : null}
                {deleteMode ? (
                  <SwipeableEventRow
                    rowKey={rowKey}
                    title={event.label}
                    time="오전 10:30"
                    offset={swipeOffsets[rowKey] ?? 0}
                    onOffsetChange={handleOffsetChange}
                    showDividerAbove={index > 0}
                    onDeleteRow={() => removeDraftAt(index)}
                  />
                ) : (
                  <EventRow title={event.label} time="오전 10:30" trailing={trailingNormal} />
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

      <div className="px-6 pb-6 pt-8">
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
        ) : (
          <>
            <button
              type="button"
              onClick={onAddSchedule}
              className="h-14 w-full rounded-xl bg-[#FFC721] text-[18px] font-bold leading-none text-white"
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
