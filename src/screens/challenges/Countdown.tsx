import { Play, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { beep } from '../../lib/beep';
import { haptics } from '../../lib/haptics';

/**
 * Big countdown readable at a glance from the driver's seat. The ring drains
 * linearly (constant motion → linear easing); the last 5 seconds turn red.
 */
export function Countdown({ seconds }: { seconds: number }) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const done = useRef(false);

  const left = startedAt === null ? seconds : Math.max(0, seconds - Math.floor((now - startedAt) / 1000));
  const finished = startedAt !== null && left === 0;
  const urgent = startedAt !== null && left <= 5 && !finished;

  useEffect(() => {
    if (startedAt === null || finished) return;
    const t = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(t);
  }, [startedAt, finished]);

  useEffect(() => {
    if (finished && !done.current) {
      done.current = true;
      beep(3);
      haptics.warning();
    }
  }, [finished]);

  const start = () => {
    done.current = false;
    haptics.impact();
    setNow(Date.now());
    setStartedAt(Date.now());
  };

  const size = 150;
  const r = 66;
  const color = finished || urgent ? 'var(--red)' : 'var(--orange)';

  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--fill-2)" strokeWidth={12} />
          <motion.circle
            key={startedAt ?? 'idle'}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            initial={{ pathLength: 1 }}
            animate={{ pathLength: startedAt === null ? 1 : 0 }}
            transition={{ duration: startedAt === null ? 0 : seconds, ease: 'linear' }}
          />
        </svg>
        <motion.span
          className="tabular absolute inset-0 flex items-center justify-center text-[56px] font-black"
          style={{ color: urgent || finished ? 'var(--red)' : 'var(--label)' }}
          animate={finished ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, repeat: finished ? 2 : 0 }}
          aria-live="polite"
        >
          {left}
        </motion.span>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={start}
        className="flex h-16 flex-1 items-center justify-center gap-2 rounded-full bg-orange text-title-3 font-bold text-black"
      >
        {startedAt === null ? <Play size={22} fill="currentColor" /> : <RotateCcw size={22} />}
        {startedAt === null ? 'Start' : 'Od nowa'}
      </motion.button>
    </div>
  );
}
