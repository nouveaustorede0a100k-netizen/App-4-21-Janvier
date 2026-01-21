import { create } from 'zustand';

interface UIState {
  // Modals
  isCreateCategoryOpen: boolean;
  isEditObjectiveOpen: boolean;
  editingObjectiveId: string | null;
  
  // Drawers
  isNotesDrawerOpen: boolean;
  
  // Actions
  openCreateCategory: () => void;
  closeCreateCategory: () => void;
  openEditObjective: (id: string) => void;
  closeEditObjective: () => void;
  toggleNotesDrawer: () => void;
  setNotesDrawer: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateCategoryOpen: false,
  isEditObjectiveOpen: false,
  editingObjectiveId: null,
  isNotesDrawerOpen: false,

  openCreateCategory: () => set({ isCreateCategoryOpen: true }),
  closeCreateCategory: () => set({ isCreateCategoryOpen: false }),
  openEditObjective: (id) => set({ isEditObjectiveOpen: true, editingObjectiveId: id }),
  closeEditObjective: () => set({ isEditObjectiveOpen: false, editingObjectiveId: null }),
  toggleNotesDrawer: () => set(state => ({ isNotesDrawerOpen: !state.isNotesDrawerOpen })),
  setNotesDrawer: (open) => set({ isNotesDrawerOpen: open }),
}));