import type { Transition } from 'motion/react';

/** Shared springs — Apple-style (duration + bounce) so they are easy to reason about. */
export const spring = {
  /** Press feedback, small state flips. */
  snappy: { type: 'spring', duration: 0.3, bounce: 0.15 } satisfies Transition,
  /** Default for layout moves and cards. */
  smooth: { type: 'spring', duration: 0.45, bounce: 0.12 } satisfies Transition,
  /** Sheets and large surfaces (iOS drawer feel). */
  sheet: { type: 'spring', duration: 0.5, bounce: 0.08 } satisfies Transition,
  /** Playful pops: checkmarks, badges. */
  pop: { type: 'spring', duration: 0.42, bounce: 0.38 } satisfies Transition,
};

export const easeOut = [0.23, 1, 0.32, 1] as const;
