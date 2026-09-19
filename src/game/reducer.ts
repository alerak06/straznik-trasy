import { CHALLENGE_BY_ID } from './data/challenges';
import { RADAR_BY_ID } from './data/radarObjects';
import { STORY_BY_ID } from './data/stories';
import { platesPoints, storyPoints } from './scoring';
import { bingoRef, bingoWinner, claimRef, isComplete, pointsFor } from './radar';
import type { Action, GameState, ScoreEntry } from './types';

export const initialState: GameState = {
  version: 2,
  trip: null,
  players: [],
  ledger: [],
  radar: null,
  plates: { round: null, history: [] },
  story: null,
  challenge: null,
};

const board = (id: string, objectIds: string[]) => ({ id, objectIds, claims: {}, bingo: null });

/**
 * Pure and deterministic: every id, timestamp and piece of content comes in on
 * the action. The same reducer will run on the server for room mode (phase 2).
 */
export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TRIP_START':
      return {
        ...initialState,
        trip: action.trip,
        players: action.players,
        radar: board(action.board.id, action.board.objectIds),
      };

    case 'TRIP_END':
      return initialState;

    // ── Radar ──────────────────────────────────────────────────────────
    case 'RADAR_NEW_BOARD':
      return { ...state, radar: board(action.id, action.objectIds) };

    case 'RADAR_CLAIM': {
      const b = state.radar;
      if (!b || b.claims[action.objectId] || !b.objectIds.includes(action.objectId)) return state;
      if (!hasPlayer(state, action.playerId)) return state;

      const points = pointsFor(b, action.objectId);
      let next = { ...b, claims: { ...b.claims, [action.objectId]: { playerId: action.playerId, points, at: action.at } } };
      const ledger: ScoreEntry[] = [
        ...state.ledger,
        {
          id: action.entryId,
          playerId: action.playerId,
          points,
          game: 'radar',
          ref: claimRef(b.id, action.objectId),
          label: RADAR_BY_ID[action.objectId]?.name ?? 'Radar',
          at: action.at,
        },
      ];

      if (isComplete(next) && !next.bingo) {
        const bingo = bingoWinner(next);
        if (bingo) {
          next = { ...next, bingo };
          ledger.push({
            id: `${action.entryId}-bingo`,
            playerId: bingo.playerId,
            points: bingo.points,
            game: 'radar',
            ref: bingoRef(b.id),
            label: 'Bingo radaru',
            at: action.at,
          });
        }
      }
      return { ...state, radar: next, ledger };
    }

    case 'RADAR_UNDO': {
      const b = state.radar;
      if (!b?.claims[action.objectId]) return state;
      const { [action.objectId]: _removed, ...claims } = b.claims;
      const drop = new Set([claimRef(b.id, action.objectId), bingoRef(b.id)]);
      return {
        ...state,
        radar: { ...b, claims, bingo: null },
        ledger: state.ledger.filter((e) => !drop.has(e.ref)),
      };
    }

    // ── Sprawa Tablicy ─────────────────────────────────────────────────
    case 'PLATES_START':
      return {
        ...state,
        plates: {
          ...state.plates,
          round: { id: action.id, letters: action.letters, themeId: action.themeId, proposals: {}, votes: {}, phase: 'propose' },
        },
      };

    case 'PLATES_SET_THEME': {
      const round = state.plates.round;
      if (!round) return state;
      return { ...state, plates: { ...state.plates, round: { ...round, themeId: action.themeId } } };
    }

    case 'PLATES_PROPOSE': {
      const round = state.plates.round;
      if (!round || round.phase !== 'propose' || !hasPlayer(state, action.playerId)) return state;
      const proposals = { ...round.proposals };
      if (action.text === null) delete proposals[action.playerId];
      else proposals[action.playerId] = action.text;
      return { ...state, plates: { ...state.plates, round: { ...round, proposals } } };
    }

    case 'PLATES_TO_VOTE': {
      const round = state.plates.round;
      if (!round) return state;
      return { ...state, plates: { ...state.plates, round: { ...round, phase: 'vote' } } };
    }

    case 'PLATES_BACK_TO_PROPOSE': {
      const round = state.plates.round;
      if (!round) return state;
      return { ...state, plates: { ...state.plates, round: { ...round, phase: 'propose', votes: {} } } };
    }

    case 'PLATES_VOTE': {
      const round = state.plates.round;
      if (!round || round.phase !== 'vote' || !(action.playerId in round.proposals)) return state;
      const max = state.players.length;
      const current = round.votes[action.playerId] ?? 0;
      const total = Object.values(round.votes).reduce((a, b) => a + b, 0);
      if (action.delta > 0 && total >= max) return state; // one vote per person in the car
      const nextVotes = Math.max(0, current + action.delta);
      return {
        ...state,
        plates: { ...state.plates, round: { ...round, votes: { ...round.votes, [action.playerId]: nextVotes } } },
      };
    }

    case 'PLATES_FINISH': {
      const round = state.plates.round;
      if (!round) return state;
      const top = Math.max(0, ...Object.values(round.votes));
      const winnerIds = top > 0 ? Object.keys(round.votes).filter((id) => round.votes[id] === top) : [];
      const points = platesPoints(winnerIds.length);
      const entries: ScoreEntry[] = winnerIds.map((playerId) => ({
        id: `${round.id}:${playerId}`,
        playerId,
        points,
        game: 'plates',
        ref: `plates:${round.id}`,
        label: `Tablica ${round.letters}`,
        at: action.at,
      }));
      return {
        ...state,
        ledger: [...state.ledger, ...entries],
        plates: {
          round: null,
          history: [
            {
              id: round.id,
              letters: round.letters,
              themeId: round.themeId,
              winnerIds,
              text: winnerIds.map((id) => round.proposals[id]).find(Boolean) ?? '',
              at: action.at,
            },
            ...state.plates.history,
          ].slice(0, 30),
        },
      };
    }

    case 'PLATES_CANCEL':
      return { ...state, plates: { ...state.plates, round: null } };

    // ── Czarne Historie ────────────────────────────────────────────────
    case 'STORY_START':
      if (!STORY_BY_ID[action.storyId]) return state;
      return {
        ...state,
        story: { storyId: action.storyId, startedAt: action.at, questions: 0, hintShown: false, revealed: false },
      };

    case 'STORY_QUESTION':
      if (!state.story) return state;
      return { ...state, story: { ...state.story, questions: Math.max(0, state.story.questions + action.delta) } };

    case 'STORY_HINT':
      if (!state.story) return state;
      return { ...state, story: { ...state.story, hintShown: true } };

    case 'STORY_REVEAL':
      if (!state.story) return state;
      return { ...state, story: { ...state.story, revealed: true } };

    case 'STORY_SOLVED': {
      const play = state.story;
      const story = play && STORY_BY_ID[play.storyId];
      if (!play || !story) return state;
      if (!action.playerId || !hasPlayer(state, action.playerId)) return { ...state, story: null };
      return {
        ...state,
        story: null,
        ledger: [
          ...state.ledger,
          {
            id: action.entryId,
            playerId: action.playerId,
            points: storyPoints(story.difficulty, play.hintShown),
            game: 'stories',
            ref: `stories:${play.storyId}:${play.startedAt}`,
            label: story.title,
            at: action.at,
          },
        ],
      };
    }

    case 'STORY_ABANDON':
      return { ...state, story: null };

    // ── Licznik Wyzwań ─────────────────────────────────────────────────
    case 'CHALLENGE_SHOW':
      if (!CHALLENGE_BY_ID[action.itemId]) return state;
      return { ...state, challenge: { itemId: action.itemId, startedAt: action.at, revealed: false } };

    case 'CHALLENGE_REVEAL':
      if (!state.challenge) return state;
      return { ...state, challenge: { ...state.challenge, revealed: true } };

    case 'CHALLENGE_SCORE': {
      const play = state.challenge;
      const item = play && CHALLENGE_BY_ID[play.itemId];
      if (!play || !item) return state;
      if (!action.playerId || !hasPlayer(state, action.playerId)) return { ...state, challenge: null };
      return {
        ...state,
        challenge: null,
        ledger: [
          ...state.ledger,
          {
            id: action.entryId,
            playerId: action.playerId,
            points: item.points,
            game: 'challenges',
            ref: `challenges:${play.itemId}:${play.startedAt}`,
            label: item.kind === 'wyzwanie' ? 'Wyzwanie' : item.kind === 'przyslowie' ? 'Przysłowie' : item.kind === 'zagadka' ? 'Zagadka' : 'Pytanie',
            at: action.at,
          },
        ],
      };
    }

    case 'SCORE_ADJUST':
      return {
        ...state,
        ledger: [
          ...state.ledger,
          {
            id: action.entryId,
            playerId: action.playerId,
            points: action.points,
            game: action.game,
            ref: `adjust:${action.entryId}`,
            label: action.label,
            at: action.at,
          },
        ],
      };
  }
}

function hasPlayer(state: GameState, id: string) {
  return state.players.some((p) => p.id === id);
}

export function totals(state: Pick<GameState, 'players' | 'ledger'>): Record<string, number> {
  const out: Record<string, number> = Object.fromEntries(state.players.map((p) => [p.id, 0]));
  for (const e of state.ledger) out[e.playerId] = (out[e.playerId] ?? 0) + e.points;
  return out;
}
