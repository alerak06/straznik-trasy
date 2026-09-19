import { AnimatePresence, motion, useDragControls, useIsPresent, type PanInfo } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { spring } from '../lib/motion';
import { Portal } from './Portal';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Label for screen readers when there's no visible title. */
  label?: string;
}

/**
 * Floating bottom sheet. Drag the grabber/header down to dismiss — a quick flick
 * is enough (velocity), a slow drag must pass ~1/4 of the sheet. Enter uses a
 * spring; exit is shorter so dismissal feels immediate.
 */
export function Sheet({ open, onClose, title, children, label }: SheetProps) {
  const controls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 500) onClose();
  };

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              className="pointer-events-auto absolute inset-0 bg-black/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label={typeof title === 'string' ? title : label}
              className="squircle pointer-events-auto absolute inset-x-2 bottom-2 flex max-h-[calc(100%-var(--safe-top)-24px)] flex-col overflow-hidden rounded-[36px] bg-surface shadow-[0_-10px_60px_-10px_rgb(0_0_0/0.6)]"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%', transition: { duration: 0.26, ease: [0.32, 0.72, 0, 1] } }}
              transition={spring.sheet}
              drag="y"
              dragControls={controls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.8 }}
              onDragEnd={onDragEnd}
            >
              <div
                className="shrink-0 cursor-grab touch-none px-6 pb-2 pt-2 active:cursor-grabbing"
                onPointerDown={(e) => controls.start(e)}
              >
                <div className="mx-auto mb-3 h-[5px] w-9 rounded-full bg-label-3" />
                {title && <h2 className="text-center text-headline font-semibold">{title}</h2>}
              </div>
              <SheetBody>{children}</SheetBody>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}

/** Stops taps on a sheet that is already animating out (no double submits). */
function SheetBody({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return (
    <div
      inert={!present}
      className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(var(--safe-bottom),20px)]"
    >
      {children}
    </div>
  );
}
