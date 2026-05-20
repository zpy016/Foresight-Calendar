import { create } from 'zustand';

interface FilterState {
  activeCategory: string;
  selectedCompanies: string[];
  minScore: number;
  currentYear: number;
  currentMonth: number;
  viewMode: 'calendar' | 'timeline';
  setActiveCategory: (category: string) => void;
  setSelectedCompanies: (companies: string[]) => void;
  setMinScore: (score: number) => void;
  setCurrentYear: (year: number) => void;
  setCurrentMonth: (month: number) => void;
  setViewMode: (mode: 'calendar' | 'timeline') => void;
  prevMonth: () => void;
  nextMonth: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  activeCategory: 'all',
  selectedCompanies: [],
  minScore: 3,
  currentYear: 2026,
  currentMonth: 5,
  viewMode: 'calendar',
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSelectedCompanies: (companies) => set({ selectedCompanies: companies }),
  setMinScore: (score) => set({ minScore: score }),
  setCurrentYear: (year) => set({ currentYear: year }),
  setCurrentMonth: (month) => set({ currentMonth: month }),
  setViewMode: (mode) => set({ viewMode: mode }),
  prevMonth: () => set((state) => {
    if (state.currentMonth === 1) {
      return { currentMonth: 12, currentYear: state.currentYear - 1 };
    }
    return { currentMonth: state.currentMonth - 1 };
  }),
  nextMonth: () => set((state) => {
    if (state.currentMonth === 12) {
      return { currentMonth: 1, currentYear: state.currentYear + 1 };
    }
    return { currentMonth: state.currentMonth + 1 };
  }),
}));
