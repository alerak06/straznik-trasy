/** Point rules shared by the reducer and the UI (so badges always match the ledger). */
export const PLATES_WIN = 3;
export const PLATES_TIE = 2;
export const platesPoints = (winners: number) => (winners <= 1 ? PLATES_WIN : PLATES_TIE);

const STORY_BASE = { 1: 2, 2: 3, 3: 4 } as const;
export const storyPoints = (difficulty: 1 | 2 | 3, hintShown: boolean) =>
  Math.max(1, STORY_BASE[difficulty] - (hintShown ? 1 : 0));
