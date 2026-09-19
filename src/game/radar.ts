import { BINGO_BONUS, GOLDEN_MULTIPLIER, RADAR_BY_ID } from './data/radarObjects';
import type { RadarBoard } from './types';

export const BOARD_SIZE = 5;
export const GOLDEN_INDEX = 4;

export function pointsFor(board: RadarBoard, objectId: string) {
  const base = RADAR_BY_ID[objectId]?.points ?? 0;
  return board.objectIds.indexOf(objectId) === GOLDEN_INDEX ? base * GOLDEN_MULTIPLIER : base;
}

export function isComplete(board: RadarBoard) {
  return board.objectIds.every((id) => board.claims[id]);
}

/** Bingo goes to whoever spotted the most on this board; ties → more points, then the latest spotter. */
export function bingoWinner(board: RadarBoard) {
  const tally = new Map<string, { count: number; points: number; last: number }>();
  for (const c of Object.values(board.claims)) {
    const t = tally.get(c.playerId) ?? { count: 0, points: 0, last: 0 };
    tally.set(c.playerId, { count: t.count + 1, points: t.points + c.points, last: Math.max(t.last, c.at) });
  }
  const [winner] = [...tally.entries()].sort(
    ([, a], [, b]) => b.count - a.count || b.points - a.points || b.last - a.last,
  );
  return winner ? { playerId: winner[0], points: BINGO_BONUS } : null;
}

export const claimRef = (boardId: string, objectId: string) => `radar:${boardId}:${objectId}`;
export const bingoRef = (boardId: string) => `radar:${boardId}:bingo`;
