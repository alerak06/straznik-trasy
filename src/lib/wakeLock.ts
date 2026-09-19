/** Keep the screen on while a game is active (re-acquired when the tab becomes visible again). */
let sentinel: WakeLockSentinel | null = null;

async function acquire() {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      sentinel = await navigator.wakeLock.request('screen');
    }
  } catch {
    /* denied or unsupported — not critical */
  }
}

export function enableWakeLock() {
  void acquire();
  const onVisible = () => {
    if (document.visibilityState === 'visible' && (!sentinel || sentinel.released)) void acquire();
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    document.removeEventListener('visibilitychange', onVisible);
    void sentinel?.release();
    sentinel = null;
  };
}
