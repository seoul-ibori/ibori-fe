import { create } from 'zustand';

export const useChildrenStore = create((set) => ({
  children: [],
  setChildren: (children) => set({ children: children ?? [] }),
  clearChildren: () => set({ children: [] }),
  deleteChildren: (childId) =>
    set((state) => ({
      children: state.children.filter((c) => c.childId !== childId),
    })),
}));
