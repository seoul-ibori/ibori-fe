import { create } from 'zustand';

export const useChildrenStore = create((set) => ({
  children: [],
  setChildren: (children) => set({ children: children ?? [] }),
  clearChildren: () => set({ children: [] }),
}));
