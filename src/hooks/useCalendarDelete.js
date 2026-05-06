import { useCallback, useState } from 'react';

export function useCalendarDelete(events, onSaveEvents) {
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

  return {
    deleteMode,
    listEvents,
    swipeOffsets,
    enterDeleteMode,
    handleCancelDeleteMode,
    handleCompleteDeleteMode,
    handleOffsetChange,
    removeDraftAt,
  };
}
