import { create } from 'zustand';

interface SearchStore {
  searchTerm: string;
  setSearchTerm: (text: string) => void;
}

const useSearchStore = create<SearchStore>((set) => ({
  searchTerm: '',
  setSearchTerm: (text: string) => set(() => ({ searchTerm: text })),

  reset: set(() => ({
    searchTerm: '',
  })),
}));

export default useSearchStore;
