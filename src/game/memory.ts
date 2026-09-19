import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { shuffle } from '../lib/random';
import type { GameId } from './types';

/**
 * Content memory: which cards/objects/questions this device has already used,
 * and when. It survives the end of a trip (that is the point — no repeats on the
 * next drive) and is only cleared by an explicit reset.
 */
type UsedMap = Record<string, number>; // contentId → usedAt

interface MemoryStore {
  used: Record<GameId, UsedMap>;
  /** Bumped on every reset, so decks built from the memory know to rebuild. */
  epoch: number;
  markUsed: (game: GameId, ids: string[], at?: number) => void;
  reset: (game: GameId | 'all') => void;
}

const empty = (): Record<GameId, UsedMap> => ({ radar: {}, plates: {}, stories: {}, challenges: {} });

export const useMemory = create<MemoryStore>()(
  persist(
    (set) => ({
      used: empty(),
      epoch: 0,
      markUsed: (game, ids, at = Date.now()) =>
        set((s) => {
          const next = { ...s.used[game] };
          for (const id of ids) next[id] = at;
          return { used: { ...s.used, [game]: next } };
        }),
      reset: (game) => set((s) => ({ used: game === 'all' ? empty() : { ...s.used, [game]: {} }, epoch: s.epoch + 1 })),
    }),
    {
      name: 'straznik-trasy:memory',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ used: s.used }),
    },
  ),
);

export interface Draw<T> {
  items: T[];
  /** True when the fresh pool ran out and least-recently-used items were recycled. */
  recycled: boolean;
}

/**
 * Pick `n` items the group hasn't seen yet. When the fresh pool is short, top up
 * with the items used longest ago — play never blocks, repeats come as late as possible.
 */
export function drawFresh<T extends { id: string }>(game: GameId, pool: readonly T[], n: number, exclude: string[] = []): Draw<T> {
  const used = useMemory.getState().used[game];
  const skip = new Set(exclude);
  const candidates = pool.filter((it) => !skip.has(it.id));
  const fresh = shuffle(
    candidates.filter((it) => !(it.id in used)),
    Math.random,
  );
  if (fresh.length >= n) return { items: fresh.slice(0, n), recycled: false };
  const oldest = candidates.filter((it) => it.id in used).sort((a, b) => used[a.id] - used[b.id]);
  return { items: [...fresh, ...oldest].slice(0, n), recycled: true };
}

/** Ordered queue of every item, fresh ones (shuffled) first, then used ones oldest-first. */
export function freshQueue<T extends { id: string }>(game: GameId, pool: readonly T[]): T[] {
  return drawFresh(game, pool, pool.length).items;
}
