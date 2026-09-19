import { motion } from 'motion/react';
import { spring } from '../../lib/motion';

/**
 * Claim badge: the disc pops in, then the tick draws itself.
 * `animateIn=false` renders the settled state (e.g. after a reload).
 */
export function Checkmark({ color, animateIn, size = 30 }: { color: string; animateIn: boolean; size?: number }) {
  return (
    <motion.span
      className="flex items-center justify-center rounded-full text-white"
      style={{ width: size, height: size, background: color, boxShadow: `0 4px 14px -4px ${color}` }}
      initial={animateIn ? { scale: 0.6, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={spring.pop}
    >
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" aria-hidden>
        <motion.path
          d="M5.5 12.5l4.2 4.2L18.5 7.8"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animateIn ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0, delay: 0.1 }}
        />
      </svg>
    </motion.span>
  );
}
