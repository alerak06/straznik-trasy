import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';
import { Avatar } from '../../design/Avatar';
import { Button } from '../../design/Button';
import { Portal } from '../../design/Portal';
import type { Player } from '../../game/types';
import { spring } from '../../lib/motion';

interface Props {
  open: boolean;
  winner: Player | null;
  bonus: number;
  colors: string[];
  onNewBoard: () => void;
  onClose: () => void;
}

const LETTERS = 'BINGO!'.split('');

export function BingoOverlay({ open, winner, bonus, colors, onNewBoard, onClose }: Props) {
  const reduce = useReducedMotion();
  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 340,
        peak: -140 - Math.random() * 180,
        fall: 180 + Math.random() * 220,
        rotate: (Math.random() - 0.5) * 720,
        delay: Math.random() * 0.12,
        w: 6 + Math.random() * 6,
        h: 10 + Math.random() * 8,
        color: [...colors, '#FFC21A'][i % (colors.length + 1)],
      })),
    // New burst per opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  return (
    <Portal>
      <AnimatePresence>
        {open && winner && (
          <motion.div
            key="bingo"
            className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/55 px-8 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Bingo"
          >
            {!reduce && (
              <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
                {confetti.map((c) => (
                  <motion.span
                    key={c.id}
                    className="absolute rounded-[2px]"
                    style={{ width: c.w, height: c.h, background: c.color }}
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    animate={{ x: c.x, y: [0, c.peak, c.peak + c.fall], rotate: c.rotate, opacity: [1, 1, 0] }}
                    transition={{ duration: 1.7, delay: c.delay, ease: [0.23, 1, 0.32, 1], times: [0, 0.35, 1] }}
                  />
                ))}
              </div>
            )}

            <motion.div
              className="squircle relative w-full max-w-[320px] rounded-[32px] bg-surface p-6 text-center shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]"
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, transition: { duration: 0.18 } }}
              transition={spring.pop}
            >
              <div className="flex justify-center gap-0.5 text-[44px] font-black leading-none tracking-tight text-accent" aria-hidden>
                {LETTERS.map((l, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 18, opacity: 0, rotate: -8 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    transition={{ ...spring.pop, delay: 0.08 + i * 0.05 }}
                  >
                    {l}
                  </motion.span>
                ))}
              </div>
              <p className="mt-2 text-subhead text-label-2">Cała plansza wypatrzona!</p>

              <div className="mt-5 flex flex-col items-center">
                <Avatar player={winner} size={64} />
                <div className="mt-2 text-headline font-semibold">{winner.name}</div>
                <div className="text-footnote text-label-2">najlepsze oko na tej planszy</div>
                <div className="tabular mt-2 rounded-full bg-[color-mix(in_srgb,var(--green)_18%,transparent)] px-3 py-1 text-subhead font-bold text-green">
                  +{bonus} pkt bonusu
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Button block onClick={onNewBoard}>
                  Nowa plansza
                </Button>
                <Button variant="plain" size="md" block onClick={onClose}>
                  Zamknij
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
