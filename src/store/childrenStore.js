import { create } from 'zustand';

export const useChildrenStore = create((set) => ({
  children: [],
  setChildren: (children) => set({ children: children ?? [] }),
  clearChildren: () => set({ children: [] }),
  deleteChildren: (childId) =>
    set((state) => ({
      children: state.children.filter((c) => c.childId !== childId),
    })),
  updateChildren: (childId, profileData) =>
    set((state) => ({
      children: state.children.map(
        (c) =>
          c.childId === childId
            ? { ...c, ...profileData } // ID가 같으면 기존 데이터(c)에 새 데이터(profileData)를 덮어씀
            : c // ID가 다르면 그대로 유지
      ),
    })),
}));
