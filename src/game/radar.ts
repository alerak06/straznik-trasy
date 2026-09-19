import { mulberry32, shuffle } from '../lib/random';
import { BINGO_BONUS, GOLDEN_MULTIPLIER, RADAR_BY_ID, RADAR_OBJECTS, type Rarity } from './data/radarObjects';
import type { RadarBoard } from './types';

export const BOARD_SIZE = 5;
export const GOLDEN_INDEX = 4;

const byRarity = (r: Rarity) => RADAR_OBJECTS.filter((o) => o.rarity === r);

/** Deterministic board: 2 common, 1 medium, 1 rare + a golden rare/legendary one. */
export function generateBoard(id: string, seed: number): RadarBoard {
  const rand = mulberry32(seed);
  const pick = (r: Rarity, n: number) => shuffle(byRarity(r), rand).slice(0, n);
  const regular = shuffle([...pick('częsty', 2), ...pick('średni', 1), ...pick('rzadki', 1)], rand);
  const taken = new Set(regular.map((o) => o.id));
  const goldenPool = [...byRarity('rzadki'), ...byRarity('legendarny')].filter((o) => !taken.has(o.id));
  const golden = shuffle(goldenPool, rand)[0];
  return { id, seed, objectIds: [...regular.map((o) => o.id), golden.id], claims: {}, bingo: null };
}

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
