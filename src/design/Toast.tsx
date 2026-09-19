import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { useUi } from '../ui/uiStore';
import { Portal } from './Portal';

/** One toast at a time, dropping in under the status bar; swipe up or wait to dismiss. */
export function Toaster() {
  const toast = useUi((s) => s.toast);
  const hide = useUi((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(hide, 4200);
    return () => window.clearTimeout(t);
  }, [toast, hide]);

  return (
    <Portal>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            className="material pointer-events-auto absolute inset-x-4 top-[calc(var(--safe-top)+8px)] z-10 rounded-[22px] border border-[var(--material-border)] px-4 py-3 text-center text-subhead font-medium shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)]"
            initial={{ y: -24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.6, bottom: 0.1 }}
            onDragEnd={(_, info) => (info.offset.y < -20 || info.velocity.y < -300) && hide()}
            onClick={hide}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
