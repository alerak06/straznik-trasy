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

// ── Radar ────────────────────────────────────────────────────────────────

export interface RadarClaim {
  playerId: string;
  points: number;
  at: number;
}

export interface RadarBoard {
  id: string;
  /** 5 object ids; index 4 is the golden (double points) one. */
  objectIds: string[];
  claims: Record<string, RadarClaim>;
  bingo: { playerId: string; points: number } | null;
}

// ── Sprawa Tablicy ───────────────────────────────────────────────────────

export interface PlatesRound {
  id: string;
  letters: string;
  themeId: string;
  /** playerId → proposed expansion (may be empty when said out loud only). */
  proposals: Record<string, string>;
  votes: Record<string, number>;
  phase: 'propose' | 'vote';
}

export interface PlatesResult {
  id: string;
  letters: string;
  themeId: string;
  winnerIds: string[];
  text: string;
  at: number;
}

// ── Czarne Historie ──────────────────────────────────────────────────────

export interface StoryPlay {
  storyId: string;
  startedAt: number;
  questions: number;
  hintShown: boolean;
  revealed: boolean;
}

// ── Licznik Wyzwań ───────────────────────────────────────────────────────

export interface ChallengePlay {
  itemId: string;
  startedAt: number;
  revealed: boolean;
}

// ── State ────────────────────────────────────────────────────────────────

export type TripMode = 'local' | 'room';

export interface Trip {
  id: string;
  startedAt: number;
  mode: TripMode;
  roomCode: string | null;
}

export interface GameState {
  version: 2;
  trip: Trip | null;
  players: Player[];
  ledger: ScoreEntry[];
  radar: RadarBoard | null;
  plates: { round: PlatesRound | null; history: PlatesResult[] };
  story: StoryPlay | null;
  challenge: ChallengePlay | null;
}

/**
 * Content (board objects, themes, stories, questions) is always chosen by the
 * dispatching device and travels inside the action — the reducer never draws.
 */
export type Action =
  | { type: 'TRIP_START'; trip: Trip; players: Player[]; board: { id: string; objectIds: string[] } }
  | { type: 'TRIP_END' }
  | { type: 'RADAR_NEW_BOARD'; id: string; objectIds: string[] }
  | { type: 'RADAR_CLAIM'; objectId: string; playerId: string; entryId: string; at: number }
  | { type: 'RADAR_UNDO'; objectId: string }
  | { type: 'PLATES_START'; id: string; letters: string; themeId: string }
  | { type: 'PLATES_SET_THEME'; themeId: string }
  | { type: 'PLATES_PROPOSE'; playerId: string; text: string | null }
  | { type: 'PLATES_TO_VOTE' }
  | { type: 'PLATES_BACK_TO_PROPOSE' }
  | { type: 'PLATES_VOTE'; playerId: string; delta: 1 | -1 }
  | { type: 'PLATES_FINISH'; at: number }
  | { type: 'PLATES_CANCEL' }
  | { type: 'STORY_START'; storyId: string; at: number }
  | { type: 'STORY_QUESTION'; delta: 1 | -1 }
  | { type: 'STORY_HINT' }
  | { type: 'STORY_REVEAL' }
  | { type: 'STORY_SOLVED'; playerId: string | null; entryId: string; at: number }
  | { type: 'STORY_ABANDON' }
  | { type: 'CHALLENGE_SHOW'; itemId: string; at: number }
  | { type: 'CHALLENGE_REVEAL' }
  | { type: 'CHALLENGE_SCORE'; playerId: string | null; entryId: string; at: number }
  | { type: 'SCORE_ADJUST'; entryId: string; playerId: string; points: number; game: GameId; label: string; at: number };
