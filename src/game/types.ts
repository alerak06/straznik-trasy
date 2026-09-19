export type Role = 'master' | 'driver' | 'passenger';

export interface Player {
  id: string;
  name: string;
  color: string;
  emoji: string;
  role: Role;
}

export type GameId = 'radar' | 'plates' | 'stories' | 'challenges';

/** Every point ever awarded is a ledger entry — totals are derived, undo removes entries. */
export interface ScoreEntry {
  id: string;
  playerId: string;
  points: number;
  game: GameId;
  /** What produced it, e.g. `radar:<boardId>:<objectId>` — used to undo. */
  ref: string;
  label: string;
  at: number;
}

export interface RadarClaim {
  playerId: string;
  points: number;
  at: number;
}

export interface RadarBoard {
  id: string;
  seed: number;
  /** 5 object ids; index 4 is the golden (double points) one. */
  objectIds: string[];
  claims: Record<string, RadarClaim>;
  bingo: { playerId: string; points: number } | null;
}

export type TripMode = 'local' | 'room';

export interface Trip {
  id: string;
  startedAt: number;
  mode: TripMode;
  roomCode: string | null;
}

export interface GameState {
  version: 1;
  trip: Trip | null;
  players: Player[];
  ledger: ScoreEntry[];
  radar: RadarBoard | null;
}

export type Action =
  | { type: 'TRIP_START'; trip: Trip; players: Player[]; board: { id: string; seed: number } }
  | { type: 'TRIP_END' }
  | { type: 'RADAR_NEW_BOARD'; id: string; seed: number }
  | { type: 'RADAR_CLAIM'; objectId: string; playerId: string; entryId: string; at: number }
  | { type: 'RADAR_UNDO'; objectId: string }
  | { type: 'SCORE_ADJUST'; entryId: string; playerId: string; points: number; game: GameId; label: string; at: number };
