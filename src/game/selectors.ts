import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { GAME_META } from './content';
import { useMemory } from './memory';
import { totals } from './reducer';
import { useGameStore } from './store';
import type { GameId } from './types';

export const usePlayers = () => useGameStore((s) => s.game.players);
export const useTrip = () => useGameStore((s) => s.game.trip);
export const useRadar = () => useGameStore((s) => s.game.radar);

/** Players with totals, ranked. Stable order for ties (join order). */
export function useLeaderboard() {
  const { players, ledger } = useGameStore(useShallow((s) => ({ players: s.game.players, ledger: s.game.ledger })));
  return useMemo(() => {
    const t = totals({ players, ledger });
    return players
      .map((p, i) => ({ ...p, score: t[p.id] ?? 0, order: i }))
      .sort((a, b) => b.score - a.score || a.order - b.order);
  }, [players, ledger]);
}

export interface MemoryStats {
  used: number;
  total: number;
  /** 0–100, share of the content pool already used on this device. */
  pct: number;
  /** Display form: "<1" once something is used but it rounds to 0. */
  pctLabel: string;
  /** Used during the current trip. */
  inTrip: number;
  left: number;
}

/** How much of a game's content pool has been used — overall and during this trip. */
export function useMemoryStats(game: GameId): MemoryStats {
  const used = useMemory((s) => s.used[game]);
  const tripStart = useGameStore((s) => s.game.trip?.startedAt ?? null);
  return useMemo(() => {
    const pool = GAME_META[game].ids;
    let count = 0;
    let inTrip = 0;
    for (const [id, at] of Object.entries(used)) {
      if (!pool.has(id)) continue; // content removed in a later version
      count++;
      if (tripStart !== null && at >= tripStart) inTrip++;
    }
    const total = pool.size;
    const pct = total ? Math.round((count / total) * 100) : 0;
    const pctLabel = count > 0 && pct === 0 ? '<1' : String(pct);
    return { used: count, total, pct: Math.max(pct, count > 0 ? 1 : 0), pctLabel, inTrip, left: total - count };
  }, [used, tripStart, game]);
}
