import type { Action } from './types';

/**
 * How actions reach the shared game state.
 * - LocalTransport: one phone, the passenger runs the game → apply immediately.
 * - RoomTransport (phase 2): POST /api/rooms/:code/actions; the server runs the same
 *   reducer and publishes on the `room:<CODE>` realtime channel; every phone applies
 *   the confirmed action it receives.
 */
export interface GameTransport {
  readonly kind: 'local' | 'room';
  dispatch(action: Action): void;
  dispose?(): void;
}

export function createLocalTransport(apply: (action: Action) => void): GameTransport {
  return { kind: 'local', dispatch: apply };
}
