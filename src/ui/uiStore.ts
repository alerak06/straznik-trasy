import { create } from 'zustand';

/** Ephemeral UI state (not persisted, not shared between phones). */
interface UiStore {
  setupOpen: boolean;
  openSetup: () => void;
  closeSetup: () => void;
}

export const useUi = create<UiStore>((set) => ({
  setupOpen: false,
  openSetup: () => set({ setupOpen: true }),
  closeSetup: () => set({ setupOpen: false }),
}));
