import { create } from "zustand";
import { AppModule, VRScene } from "../types";

interface UIState {
  currentModule: AppModule;
  previousModule: AppModule | null;
  activeVRScene: VRScene | null;
  isVRModalOpen: boolean;
  isAIConciergeOpen: boolean;
  isMobileMenuOpen: boolean;
  isGlobalSearchOpen: boolean;
  globalSearchQuery: string;
  theme: "light" | "dark";
  selectedBookingDetailId: string | null;
  selectedTripDetailId: string | null;
  selectedDestinationId: string | null;
  aiInitialPrompt: string | null;
  isDealScopeOpen: boolean;
  dealScopeData: any | null;
  
  setModule: (module: AppModule) => void;
  openVR: (scene: VRScene) => void;
  closeVR: () => void;
  toggleAIConcierge: () => void;
  setAIConciergeOpen: (open: boolean) => void;
  openAIWithPrompt: (prompt: string) => void;
  clearAIInitialPrompt: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setGlobalSearchQuery: (query: string) => void;
  toggleTheme: () => void;
  setSelectedBookingDetailId: (id: string | null) => void;
  setSelectedTripDetailId: (id: string | null) => void;
  setSelectedDestinationId: (id: string | null) => void;
  openDealScope: (data?: any) => void;
  closeDealScope: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentModule: "home",
  previousModule: null,
  activeVRScene: null,
  isVRModalOpen: false,
  isAIConciergeOpen: false,
  aiInitialPrompt: null,
  isMobileMenuOpen: false,
  isGlobalSearchOpen: false,
  globalSearchQuery: "",
  theme: "light",
  selectedBookingDetailId: null,
  selectedTripDetailId: null,
  selectedDestinationId: null,
  isDealScopeOpen: false,
  dealScopeData: null,

  setModule: (module) =>
    set((state) => ({
      previousModule: state.currentModule,
      currentModule: module,
      isMobileMenuOpen: false,
    })),

  openVR: (scene) => set({ activeVRScene: scene, isVRModalOpen: true }),
  closeVR: () => set({ activeVRScene: null, isVRModalOpen: false }),
  toggleAIConcierge: () => set((state) => ({ isAIConciergeOpen: !state.isAIConciergeOpen })),
  setAIConciergeOpen: (open) => set({ isAIConciergeOpen: open }),
  openAIWithPrompt: (prompt) => set({ isAIConciergeOpen: true, aiInitialPrompt: prompt }),
  clearAIInitialPrompt: () => set({ aiInitialPrompt: null }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setGlobalSearchOpen: (open) => set({ isGlobalSearchOpen: open }),
  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  setSelectedBookingDetailId: (id) => set({ selectedBookingDetailId: id }),
  setSelectedTripDetailId: (id) => set({ selectedTripDetailId: id }),
  setSelectedDestinationId: (id) => set({ selectedDestinationId: id }),
  openDealScope: (data) => set({ isDealScopeOpen: true, dealScopeData: data || null }),
  closeDealScope: () => set({ isDealScopeOpen: false, dealScopeData: null }),
}));
