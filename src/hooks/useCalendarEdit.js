import { useCallback, useState } from 'react';

export function normalizeEventForEdit(event) {
  if (!event) {
    return { label: '', color: 'bg-[#FFC721]', location: '', memo: '', time: '오전 10:30' };
  }
  return {
    ...event,
    location: event.location ?? '',
    memo: event.memo ?? '',
    time: event.time ?? '오전 10:30',
  };
}

export function useCalendarEdit() {
  const [editPhase, setEditPhase] = useState('idle');
  const [editingIndex, setEditingIndex] = useState(null);

  const exitEditModes = useCallback(() => {
    setEditPhase('idle');
    setEditingIndex(null);
  }, []);

  const enterEditList = useCallback(() => {
    setEditPhase('list');
    setEditingIndex(null);
  }, []);

  const openEditForm = useCallback((index) => {
    setEditingIndex(index);
    setEditPhase('form');
  }, []);

  const backToEditList = useCallback(() => {
    setEditingIndex(null);
    setEditPhase('list');
  }, []);

  return {
    editPhase,
    editingIndex,
    exitEditModes,
    enterEditList,
    openEditForm,
    backToEditList,
  };
}
