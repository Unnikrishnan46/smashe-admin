import { create } from "zustand";



export const votePeriodStore = create<any>((set: any) => ({
    isVotePeriodModalOpen: false,
    setIsVotePeriodModalOpen: (isOpen: boolean) => set({ isVotePeriodModalOpen: isOpen }),
  }));

  export const alertStore = create<any>((set: any) => ({
    isDeleteAlertOpen: false,
    setIsDeleteAlertOpen: (isOpen: boolean) => set({ isDeleteAlertOpen: isOpen }),
  }));

  export const sheetStore = create<any>((set: any) => ({
    isCommentsSheetOpen: false,
    setIsCommentsSheetOpen: (isOpen: boolean) => set({ isCommentsSheetOpen: isOpen }),
  }));

  interface SearchState {
    searchInput: string;  // Changed to string to hold the input value
    setSearchInput: (input: string) => void;  // Changed to accept a string
  }
  
  export const useSearchStore = create<SearchState>((set) => ({
    searchInput: '',
    setSearchInput: (input: string) => set({ searchInput: input }),
  }));