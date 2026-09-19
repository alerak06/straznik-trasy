/**
 * Single swap point for haptic feedback.
 * Web: Vibration API (Android Chrome; iOS Safari ignores it silently).
 * Capacitor: replace the bodies with @capacitor/haptics calls — callers don't change.
 */
type Pattern = number | number[];

function vibrate(pattern: Pattern) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    /* unsupported — visual feedback carries the interaction */
  }
}

export const haptics = {
  /** Light tick: selection change, tab switch. */
  selection: () => vibrate(8),
  /** Medium impact: button press that commits something. */
  impact: () => vibrate(14),
  /** Success notification: a claim landed. */
  success: () => vibrate([12, 40, 18]),
  /** Warning: undo, destructive confirmation. */
  warning: () => vibrate([20, 60, 20]),
  /** Celebration: bingo. */
  celebrate: () => vibrate([16, 50, 16, 50, 30]),
};
