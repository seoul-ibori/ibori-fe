import { useCallback, useState } from 'react';

function isSameCalendarEvent(a, b) {
  if (a.recordId != null && b.recordId != null) {
    return Number(a.recordId) === Number(b.recordId);
  }
  return (a.label ?? '') === (b.label ?? '') && (a.time ?? '') === (b.time ?? '');
}

/** 삭제 모드 진입 시점의 목록 대비, 완료 시 사라진 일정 */
function eventsRemovedSince(original, draft) {
  return original.filter((ev) => !draft.some((d) => isSameCalendarEvent(ev, d)));
}

/**
 * @param {Array} events
 * @param {function} onSaveEvents
 * @param {{ syncDeletedRecords?: (removed: unknown[]) => Promise<void> }} [options]
 */
export function useCalendarDelete(events, onSaveEvents, options = {}) {
  const { syncDeletedRecords } = options;
  const [deleteMode, setDeleteMode] = useState(false);
  const [swipeOffsets, setSwipeOffsets] = useState({});
  const [draftEvents, setDraftEvents] = useState([]);
  const [isCommittingDelete, setIsCommittingDelete] = useState(false);

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

  const handleCompleteDeleteMode = useCallback(async () => {
    const removed = eventsRemovedSince(events, draftEvents);
    if (syncDeletedRecords && removed.length > 0) {
      setIsCommittingDelete(true);
      try {
        await syncDeletedRecords(removed);
      } catch (err) {
        const data = err?.response?.data;
        const msg =
          (typeof data?.message === 'string' && data.message) ||
          (typeof data === 'string' ? data : null) ||
          err?.message ||
          '일정 삭제에 실패했습니다.';
        alert(msg);
        return;
      } finally {
        setIsCommittingDelete(false);
      }
    }
    onSaveEvents(draftEvents);
    resetDeleteUi();
  }, [events, draftEvents, onSaveEvents, resetDeleteUi, syncDeletedRecords]);

  const listEvents = deleteMode ? draftEvents : events;

  return {
    deleteMode,
    listEvents,
    swipeOffsets,
    enterDeleteMode,
    handleCancelDeleteMode,
    handleCompleteDeleteMode,
    handleOffsetChange,
    removeDraftAt,
    isCommittingDelete,
  };
}
