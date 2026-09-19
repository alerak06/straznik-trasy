import { Skull } from 'lucide-react';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import { forwardRef, useImperativeHandle } from 'react';
import { DIFFICULTY_LABEL, type Story } from '../../game/data/stories';
import { haptics } from '../../lib/haptics';

export interface DeckHandle {
  fling: (dir: 1 | -1) => void;
}

/**
 * Tinder-style stack. Only the top card is interactive; the next two sit
 * underneath, slightly smaller, and grow into place as the top card leaves.
 */
export const SwipeDeck = forwardRef<DeckHandle, { cards: Story[]; onSwipe: (story: Story, dir: 1 | -1) => void }>(
  function SwipeDeck({ cards, onSwipe }, ref) {
    const visible = cards.slice(0, 3);
    const x = useMotionValue(0);

    const fling = (dir: 1 | -1) => {
      const top = visible[0];
      if (!top) return;
      haptics.impact();
      void animate(x, dir * 520, { type: 'spring', duration: 0.35, bounce: 0 }).then(() => {
        onSwipe(top, dir);
        x.jump(0);
      });
    };

    useImperativeHandle(ref, () => ({ fling }));

    return (
      <div className="relative h-[372px]">
        {visible
          .map((card, i) => (
            <DeckCard key={card.id} card={card} depth={i} x={i === 0 ? x : undefined} onRelease={fling} />
          ))
          .reverse()}
      </div>
    );
  },
);

function DeckCard({
  card,
  depth,
  x,
  onRelease,
}: {
  card: Story;
  depth: number;
  x?: ReturnType<typeof useMotionValue<number>>;
  onRelease: (dir: 1 | -1) => void;
}) {
  const local = useMotionValue(0);
  const mx = x ?? local;
  const rotate = useTransform(mx, [-300, 0, 300], [-14, 0, 14]);
  const playOpacity = useTransform(mx, [30, 120], [0, 1]);
  const skipOpacity = useTransform(mx, [-120, -30], [1, 0]);
  const top = depth === 0;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dx = info.offset.x;
    const v = info.velocity.x;
    if (dx > 110 || v > 600) onRelease(1);
    else if (dx < -110 || v < -600) onRelease(-1);
    else void animate(mx, 0, { type: 'spring', duration: 0.4, bounce: 0.25 });
  };

  return (
    <motion.article
      className={`squircle absolute inset-x-0 top-0 flex h-[344px] flex-col overflow-hidden rounded-[30px] bg-surface p-6 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.8)] ${
        top ? 'cursor-grab touch-none active:cursor-grabbing' : 'pointer-events-none'
      }`}
      style={{ x: top ? mx : 0, rotate: top ? rotate : 0, zIndex: 10 - depth, transformOrigin: '50% 120%' }}
      initial={false}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14, opacity: depth > 1 ? 0.6 : 1 }}
      transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
      drag={top ? 'x' : false}
      dragMomentum={false}
      onDragEnd={top ? onDragEnd : undefined}
      aria-hidden={!top}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_100%_0%,color-mix(in_srgb,var(--purple)_22%,transparent),transparent_60%)]"
      />
      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-1 text-purple" aria-label={`Trudność: ${DIFFICULTY_LABEL[card.difficulty]}`}>
          {Array.from({ length: 3 }, (_, i) => (
            <Skull key={i} size={18} strokeWidth={2.2} className={i < card.difficulty ? '' : 'opacity-20'} />
          ))}
        </span>
        <span className="text-caption font-semibold uppercase tracking-wide text-label-2">{DIFFICULTY_LABEL[card.difficulty]}</span>
      </div>
      <h2 className="relative mt-4 text-title-1 font-bold">{card.title}</h2>
      <p className="relative mt-3 flex-1 overflow-hidden text-[18px] leading-[26px] text-label">{card.story}</p>

      {top && (
        <>
          <motion.span
            style={{ opacity: playOpacity }}
            className="absolute left-6 top-6 -rotate-12 rounded-[10px] border-[3px] border-green px-3 py-1 text-title-2 font-black uppercase text-green"
          >
            Gramy
          </motion.span>
          <motion.span
            style={{ opacity: skipOpacity }}
            className="absolute right-6 top-6 rotate-12 rounded-[10px] border-[3px] border-red px-3 py-1 text-title-2 font-black uppercase text-red"
          >
            Pomiń
          </motion.span>
        </>
      )}
    </motion.article>
  );
}
