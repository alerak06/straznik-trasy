import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect } from 'react';

/** Counts toward the new value with a short spring instead of jumping. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => Math.round(v).toString());

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { type: 'spring', duration: 0.6, bounce: 0 });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return <motion.span className={`tabular ${className ?? ''}`}>{text}</motion.span>;
}
