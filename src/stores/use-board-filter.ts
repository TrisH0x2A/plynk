import { create } from "zustand";
import { CardStatus } from "@/types";

interface BoardFilterStore {
  keyword: string;
  selectedStatuses: CardStatus[];
  selectedLabels: string[];
  setKeyword: (keyword: string) => void;
  toggleStatus: (status: CardStatus) => void;
  toggleLabel: (label: string) => void;
  clearFilters: () => void;
  getActiveFilterCount: () => number;
}

export const useBoardFilter = create<BoardFilterStore>((set, get) => ({
  keyword: "",
  selectedStatuses: [],
  selectedLabels: [],
  setKeyword: (keyword) => set({ keyword }),
  toggleStatus: (status) =>
    set((state) => ({
      selectedStatuses: state.selectedStatuses.includes(status)
        ? state.selectedStatuses.filter((s) => s !== status)
        : [...state.selectedStatuses, status],
    })),
  toggleLabel: (label) =>
    set((state) => ({
      selectedLabels: state.selectedLabels.includes(label)
        ? state.selectedLabels.filter((l) => l !== label)
        : [...state.selectedLabels, label],
    })),
  clearFilters: () =>
    set({
      keyword: "",
      selectedStatuses: [],
      selectedLabels: [],
    }),
  getActiveFilterCount: () => {
    const state = get();
    let count = 0;
    if (state.keyword.trim().length > 0) count++;
    count += state.selectedStatuses.length;
    count += state.selectedLabels.length;
    return count;
  },
}));
