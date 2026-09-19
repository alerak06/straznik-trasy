/** Short attention tone for timers ending — audible over road noise, no asset needed. */
let ctx: AudioContext | null = null;

export function beep(times = 2) {
  try {
    ctx ??= new AudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < times; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      const t = now + i * 0.22;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    }
  } catch {
    /* audio blocked — the visual flash still signals the end */
  }
}
