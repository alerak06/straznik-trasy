import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { newSeed, uid } from '../lib/random';
import { initialState, reduce } from './reducer';
import { createLocalTransport, type GameTransport } from './transport';
import type { Action, GameId, GameState, Player } from './types';

interface GameStore {
  game: GameState;
  /** Applies a confirmed action to local state (called by the transport). */
  apply: (action: Action) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      game: initialState,
      apply: (action) => set((s) => ({ game: reduce(s.game, action) })),
    }),
    {
      name: 'straznik-trasy:game',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ game: s.game }),
    },
  ),
);

let transport: GameTransport = createLocalTransport((a) => useGameStore.getState().apply(a));

export function setTransport(next: GameTransport) {
  transport.dispose?.();
  transport = next;
}

const dispatch = (action: Action) => transport.dispatch(action);

/** Action creators — the only place ids, timestamps and seeds are minted. */
export const game = {
  startTrip(players: Player[]) {
    dispatch({
      type: 'TRIP_START',
      trip: { id: uid(), startedAt: Date.now(), mode: 'local', roomCode: null },
      players,
      board: { id: uid(), seed: newSeed() },
    });
  },
  endTrip() {
    dispatch({ type: 'TRIP_END' });
  },
  newRadarBoard() {
    dispatch({ type: 'RADAR_NEW_BOARD', id: uid(), seed: newSeed() });
  },
  claimRadar(objectId: string, playerId: string) {
    dispatch({ type: 'RADAR_CLAIM', objectId, playerId, entryId: uid(), at: Date.now() });
  },
  undoRadar(objectId: string) {
    dispatch({ type: 'RADAR_UNDO', objectId });
  },
  adjustScore(playerId: string, points: number, game: GameId, label: string) {
    dispatch({ type: 'SCORE_ADJUST', entryId: uid(), playerId, points, game, label, at: Date.now() });
  },
};
