import { create } from 'zustand';
import type { GameId } from '../game/types';

interface Toast {
  id: number;
  text: string;
}

/** Ephemeral UI state (not persisted, not shared between phones). */
interface UiStore {
  setupOpen: boolean;
  openSetup: () => void;
  closeSetup: () => void;
  memoryGame: GameId | null;
  openMemory: (game: GameId) => void;
  closeMemory: () => void;
  toast: Toast | null;
  showToast: (text: string) => void;
  hideToast: () => void;
}

let toastSeq = 0;

export const useUi = create<UiStore>((set) => ({
  setupOpen: false,
  openSetup: () => set({ setupOpen: true }),
  closeSetup: () => set({ setupOpen: false }),
  memoryGame: null,
  openMemory: (game) => set({ memoryGame: game }),
  closeMemory: () => set({ memoryGame: null }),
  toast: null,
  showToast: (text) => set({ toast: { id: ++toastSeq, text } }),
  hideToast: () => set({ toast: null }),
}));

export const RECYCLED_TOAST = 'Pula się skończyła — wracają najdawniej użyte. Wyzeruj pamięć, aby zacząć od nowa.';
