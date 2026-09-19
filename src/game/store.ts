import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { uid } from '../lib/random';
import { CHALLENGES, type ChallengeKind } from './data/challenges';
import { PLATE_THEMES } from './data/plateThemes';
import { RADAR_OBJECTS, type Rarity } from './data/radarObjects';
import { drawFresh, useMemory } from './memory';
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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ game: s.game }),
      // v1 had only the radar; keep players, scores and the board, add the new games.
      migrate: (persisted) => {
        const old = (persisted as { game?: Partial<GameState> } | undefined)?.game;
        return { game: { ...initialState, ...old, version: 2 } as GameState };
      },
    },
  ),
);

let transport: GameTransport = createLocalTransport((a) => useGameStore.getState().apply(a));

export function setTransport(next: GameTransport) {
  transport.dispose?.();
  transport = next;
}

const dispatch = (action: Action) => transport.dispatch(action);
const mark = (game: GameId, ids: string[], at?: number) => useMemory.getState().markUsed(game, ids, at);

/** 2 common, 1 medium, 1 rare + a golden rare/legendary — all preferring unseen objects. */
function drawRadarBoard(at?: number) {
  const taken: string[] = [];
  let recycled = false;
  const take = (rarities: Rarity[], n: number) => {
    const d = drawFresh('radar', RADAR_OBJECTS.filter((o) => rarities.includes(o.rarity)), n, taken);
    recycled ||= d.recycled;
    taken.push(...d.items.map((o) => o.id));
    return d.items.map((o) => o.id);
  };
  const regular = [...take(['częsty'], 2), ...take(['średni'], 1), ...take(['rzadki'], 1)];
  const golden = take(['rzadki', 'legendarny'], 1);
  const objectIds = [...regular.sort(() => Math.random() - 0.5), ...golden];
  mark('radar', objectIds, at);
  return { objectIds, recycled };
}

/** Plates themselves are also remembered (outside the % pool) to warn about repeats. */
export const plateKey = (letters: string) => `L:${letters}`;

export type ChallengeFilter = 'mix' | ChallengeKind;

/** Action creators — the only place ids, timestamps and content choices are made. */
export const game = {
  startTrip(players: Player[]) {
    // Same timestamp for the trip and its first board, so the board counts as "this trip".
    const startedAt = Date.now();
    const { objectIds } = drawRadarBoard(startedAt);
    dispatch({
      type: 'TRIP_START',
      trip: { id: uid(), startedAt, mode: 'local', roomCode: null },
      players,
      board: { id: uid(), objectIds },
    });
  },
  endTrip() {
    dispatch({ type: 'TRIP_END' });
  },

  // Radar
  newRadarBoard() {
    const { objectIds, recycled } = drawRadarBoard();
    dispatch({ type: 'RADAR_NEW_BOARD', id: uid(), objectIds });
    return recycled;
  },
  claimRadar(objectId: string, playerId: string) {
    dispatch({ type: 'RADAR_CLAIM', objectId, playerId, entryId: uid(), at: Date.now() });
  },
  undoRadar(objectId: string) {
    dispatch({ type: 'RADAR_UNDO', objectId });
  },

  // Sprawa Tablicy
  startPlates(letters: string) {
    mark('plates', [plateKey(letters)]);
    const current = useGameStore.getState().game.plates.round?.themeId;
    const { items, recycled } = drawFresh('plates', PLATE_THEMES, 1, current ? [current] : []);
    mark('plates', [items[0].id]);
    dispatch({ type: 'PLATES_START', id: uid(), letters, themeId: items[0].id });
    return recycled;
  },
  newPlatesTheme() {
    const current = useGameStore.getState().game.plates.round?.themeId;
    const { items, recycled } = drawFresh('plates', PLATE_THEMES, 1, current ? [current] : []);
    mark('plates', [items[0].id]);
    dispatch({ type: 'PLATES_SET_THEME', themeId: items[0].id });
    return recycled;
  },
  /** `null` withdraws the proposal; an empty string means "said it out loud". */
  proposePlates(playerId: string, text: string | null) {
    dispatch({ type: 'PLATES_PROPOSE', playerId, text });
  },
  platesToVote() {
    dispatch({ type: 'PLATES_TO_VOTE' });
  },
  platesBackToPropose() {
    dispatch({ type: 'PLATES_BACK_TO_PROPOSE' });
  },
  votePlates(playerId: string, delta: 1 | -1) {
    dispatch({ type: 'PLATES_VOTE', playerId, delta });
  },
  finishPlates() {
    dispatch({ type: 'PLATES_FINISH', at: Date.now() });
  },
  cancelPlates() {
    dispatch({ type: 'PLATES_CANCEL' });
  },

  // Czarne Historie
  /** A card was dealt face-up (played or skipped) — never deal it again until reset. */
  storySeen(storyId: string) {
    mark('stories', [storyId]);
  },
  startStory(storyId: string) {
    mark('stories', [storyId]);
    dispatch({ type: 'STORY_START', storyId, at: Date.now() });
  },
  storyQuestion(delta: 1 | -1) {
    dispatch({ type: 'STORY_QUESTION', delta });
  },
  storyHint() {
    dispatch({ type: 'STORY_HINT' });
  },
  storyReveal() {
    dispatch({ type: 'STORY_REVEAL' });
  },
  storySolved(playerId: string | null) {
    dispatch({ type: 'STORY_SOLVED', playerId, entryId: uid(), at: Date.now() });
  },
  abandonStory() {
    dispatch({ type: 'STORY_ABANDON' });
  },

  // Licznik Wyzwań
  nextChallenge(filter: ChallengeFilter) {
    const current = useGameStore.getState().game.challenge?.itemId;
    const pool = filter === 'mix' ? CHALLENGES : CHALLENGES.filter((c) => c.kind === filter);
    const { items, recycled } = drawFresh('challenges', pool, 1, current ? [current] : []);
    if (!items[0]) return recycled;
    mark('challenges', [items[0].id]);
    dispatch({ type: 'CHALLENGE_SHOW', itemId: items[0].id, at: Date.now() });
    return recycled;
  },
  revealChallenge() {
    dispatch({ type: 'CHALLENGE_REVEAL' });
  },
  scoreChallenge(playerId: string | null) {
    dispatch({ type: 'CHALLENGE_SCORE', playerId, entryId: uid(), at: Date.now() });
  },

  adjustScore(playerId: string, points: number, gameId: GameId, label: string) {
    dispatch({ type: 'SCORE_ADJUST', entryId: uid(), playerId, points, game: gameId, label, at: Date.now() });
  },
};
