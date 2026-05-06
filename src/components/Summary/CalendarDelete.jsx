import { useCallback, useRef, useState } from 'react';

const DELETE_BTN_WIDTH = 72;

export function SwipeableEventRow({
  rowKey,
  offset,
  onOffsetChange,
  showDividerAbove,
  onDeleteRow,
  deleteLabel,
  children,
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
          <div className="flex min-w-0 flex-1 flex-col bg-white">{children}</div>
          <button
            type="button"
            aria-label={deleteLabel ? `${deleteLabel} 일정 삭제` : '일정 삭제'}
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
