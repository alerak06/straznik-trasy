import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { totals } from './reducer';
import { useGameStore } from './store';

export const usePlayers = () => useGameStore((s) => s.game.players);
export const useTrip = () => useGameStore((s) => s.game.trip);
export const useRadar = () => useGameStore((s) => s.game.radar);

/** Players with totals, ranked. Stable order for ties (join order). */
export function useLeaderboard() {
  const { players, ledger } = useGameStore(useShallow((s) => ({ players: s.game.players, ledger: s.game.ledger })));
  return useMemo(() => {
    const t = totals({ version: 1, trip: null, players, ledger, radar: null });
    return players
      .map((p, i) => ({ ...p, score: t[p.id] ?? 0, order: i }))
      .sort((a, b) => b.score - a.score || a.order - b.order);
  }, [players, ledger]);
}
