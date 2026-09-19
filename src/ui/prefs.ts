import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChallengeFilter } from '../game/store';

/** Per-device preferences (not part of the shared game). */
interface Prefs {
  speak: boolean;
  challengeFilter: ChallengeFilter;
  storyDifficulty: 0 | 1 | 2 | 3;
  set: (patch: Partial<Omit<Prefs, 'set'>>) => void;
}

export const usePrefs = create<Prefs>()(
  persist(
    (set) => ({
      speak: false,
      challengeFilter: 'mix',
      storyDifficulty: 0,
      set: (patch) => set(patch),
    }),
    { name: 'straznik-trasy:prefs', storage: createJSONStorage(() => localStorage), partialize: ({ set: _s, ...rest }) => rest },
  ),
);
