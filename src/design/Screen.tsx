import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';

interface ScreenProps {
  title: string;
  /** Small caption above the large title (e.g. trip status). */
  eyebrow?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}

/**
 * iOS large-title screen. The large title scrolls with content; once it passes
 * under the bar, the inline title and the translucent material fade in.
 */
export function Screen({ title, eyebrow, trailing, children }: ScreenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: ref });
  const barOpacity = useTransform(scrollY, [8, 40], [0, 1]);
  const inlineTitleOpacity = useTransform(scrollY, [36, 52], [0, 1]);
  const inlineTitleY = useTransform(scrollY, [36, 52], [6, 0]);
  const largeTitleScale = useTransform(scrollY, [-120, 0], [1.1, 1], { clamp: true });

  return (
    <section className="absolute inset-0">
      <header className="absolute inset-x-0 top-0 z-20 pt-[var(--safe-top)]">
        <motion.div
          aria-hidden
          style={{ opacity: barOpacity }}
          className="material absolute inset-0 border-b border-[var(--material-border)]"
        />
        <div className="relative flex h-[var(--nav-h)] items-center justify-end px-4">
          <motion.span
            style={{ opacity: inlineTitleOpacity, y: inlineTitleY }}
            className="pointer-events-none absolute inset-x-16 truncate text-center text-headline font-semibold"
          >
            {title}
          </motion.span>
          <div className="relative flex items-center gap-1">{trailing}</div>
        </div>
      </header>

      <div
        ref={ref}
        className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-y-contain pt-[calc(var(--safe-top)+var(--nav-h))] pb-[calc(var(--tab-h)+max(var(--safe-bottom),12px)+40px)]"
      >
        <div className="px-[var(--gutter)] pb-3">
          {eyebrow && <div className="mb-0.5 text-footnote font-semibold uppercase tracking-wide text-label-2">{eyebrow}</div>}
          <motion.h1
            style={{ scale: largeTitleScale }}
            className="origin-left text-large-title font-bold tracking-[0.004em]"
          >
            {title}
          </motion.h1>
        </div>
        {children}
      </div>
    </section>
  );
}

/** Round glass button for nav bar actions (44pt hit target). */
export function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', duration: 0.25, bounce: 0.2 }}
      className="flex size-11 items-center justify-center rounded-full"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-fill-2 text-accent">{children}</span>
    </motion.button>
  );
}
