import { RADAR_BY_ID } from './data/radarObjects';
import { bingoRef, bingoWinner, claimRef, generateBoard, isComplete, pointsFor } from './radar';
import type { Action, GameState } from './types';

export const initialState: GameState = { version: 1, trip: null, players: [], ledger: [], radar: null };

/**
 * Pure and deterministic: every id/timestamp/seed comes in on the action.
 * The same reducer will run on the server for room mode (phase 2).
 */
export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TRIP_START':
      return {
        version: 1,
        trip: action.trip,
        players: action.players,
        ledger: [],
        radar: generateBoard(action.board.id, action.board.seed),
      };

    case 'TRIP_END':
      return initialState;

    case 'RADAR_NEW_BOARD':
      return { ...state, radar: generateBoard(action.id, action.seed) };

    case 'RADAR_CLAIM': {
      const board = state.radar;
      if (!board || board.claims[action.objectId] || !board.objectIds.includes(action.objectId)) return state;
      if (!state.players.some((p) => p.id === action.playerId)) return state;

      const points = pointsFor(board, action.objectId);
      let next = {
        ...board,
        claims: { ...board.claims, [action.objectId]: { playerId: action.playerId, points, at: action.at } },
      };
      const ledger = [
        ...state.ledger,
        {
          id: action.entryId,
          playerId: action.playerId,
          points,
          game: 'radar' as const,
          ref: claimRef(board.id, action.objectId),
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
            ref: bingoRef(board.id),
            label: 'Bingo radaru',
            at: action.at,
          });
        }
      }
      return { ...state, radar: next, ledger };
    }

    case 'RADAR_UNDO': {
      const board = state.radar;
      if (!board?.claims[action.objectId]) return state;
      const { [action.objectId]: _removed, ...claims } = board.claims;
      const drop = new Set([claimRef(board.id, action.objectId), bingoRef(board.id)]);
      return {
        ...state,
        radar: { ...board, claims, bingo: null },
        ledger: state.ledger.filter((e) => !drop.has(e.ref)),
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

export function totals(state: GameState): Record<string, number> {
  const out: Record<string, number> = Object.fromEntries(state.players.map((p) => [p.id, 0]));
  for (const e of state.ledger) out[e.playerId] = (out[e.playerId] ?? 0) + e.points;
  return out;
}
