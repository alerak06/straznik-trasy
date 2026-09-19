import { Star } from 'lucide-react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../design/Avatar';
import { RARITY_LABEL, type RadarObject } from '../../game/data/radarObjects';
import type { Player, RadarClaim } from '../../game/types';
import { haptics } from '../../lib/haptics';
import { spring } from '../../lib/motion';
import { Checkmark } from './Checkmark';

const HOLD_MS = 650;

interface RadarCardProps {
  object: RadarObject;
  points: number;
  golden: boolean;
  claim?: RadarClaim;
  claimer?: Player;
  /** Claims made after this timestamp animate in; older ones render settled. */
  freshAfter: number;
  onRequestClaim: () => void;
  onUndo: () => void;
}

export function RadarCard({ object, points, golden, claim, claimer, freshAfter, onRequestClaim, onUndo }: RadarCardProps) {
  const [scope, animate] = useAnimate<HTMLButtonElement>();
  const claimed = Boolean(claim && claimer);
  const fresh = Boolean(claim && claim.at > freshAfter);
  const prevClaimed = useRef(claimed);
  const [holding, setHolding] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const holdTimer = useRef<number>(0);
  const suppressClick = useRef(false);

  // Physical "thunk" when a claim lands.
  useEffect(() => {
    if (claimed && !prevClaimed.current && fresh && scope.current) {
      void animate(scope.current, { scale: [0.94, 1] }, spring.pop);
    }
    prevClaimed.current = claimed;
  }, [claimed, fresh, animate, scope]);

  useEffect(() => {
    if (!showHint) return;
    const t = window.setTimeout(() => setShowHint(false), 1600);
    return () => window.clearTimeout(t);
  }, [showHint]);

  const startHold = () => {
    if (!claimed) return;
    setHolding(true);
    holdTimer.current = window.setTimeout(() => {
      suppressClick.current = true;
      setHolding(false);
      haptics.warning();
      onUndo();
    }, HOLD_MS);
  };
  const endHold = () => {
    window.clearTimeout(holdTimer.current);
    setHolding(false);
  };

  const onClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (claimed) {
      haptics.selection();
      setShowHint(true);
    } else {
      haptics.selection();
      onRequestClaim();
    }
  };

  const tint = claimer?.color ?? 'transparent';

  return (
    <motion.button
      ref={scope}
      type="button"
      onClick={onClick}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      onPointerCancel={endHold}
      onContextMenu={(e) => e.preventDefault()}
      whileTap={{ scale: 0.97 }}
      transition={spring.snappy}
      aria-label={
        claimed
          ? `${object.name}, wypatrzone przez ${claimer!.name}. Przytrzymaj, aby cofnąć.`
          : `${object.name}, ${points} pkt. Stuknij, gdy ktoś wypatrzy.`
      }
      className={`squircle relative flex w-full overflow-hidden rounded-[var(--radius-md)] bg-surface text-left shadow-card ${
        golden ? 'min-h-[128px] flex-row items-center gap-4 p-4' : 'min-h-[184px] flex-col p-3.5'
      }`}
    >
      {/* golden glow */}
      {golden && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_60%)]"
        />
      )}
      {/* claimed tint — opacity only, so it composites cheaply */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: `color-mix(in srgb, ${tint} 16%, transparent)`,
          boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${tint} 60%, transparent)`,
        }}
        initial={false}
        animate={{ opacity: claimed ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      />
      {golden && !claimed && (
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--accent)_45%,transparent)]" />
      )}

      <span
        aria-hidden
        className={`relative flex shrink-0 items-center justify-center rounded-[18px] bg-fill-2 ${golden ? 'size-[72px] text-[42px]' : 'size-14 text-[32px]'}`}
      >
        {object.emoji}
      </span>

      <span className={`relative flex min-w-0 flex-1 flex-col ${golden ? '' : 'mt-3'}`}>
        {golden && (
          <span className="mb-0.5 flex items-center gap-1 text-caption font-semibold uppercase tracking-wide text-accent">
            <Star size={12} fill="currentColor" strokeWidth={0} /> Złoty obiekt · ×2
          </span>
        )}
        <span className="line-clamp-2 text-headline font-semibold">{object.name}</span>
        <span className="mt-0.5 line-clamp-2 text-footnote text-label-2">{object.hint}</span>

        {!golden && <span className="flex-1" />}

        <span className="relative mt-2 flex h-7 items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {showHint ? (
              <motion.span
                key="hint"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="text-caption font-semibold text-label-2"
              >
                Przytrzymaj, aby cofnąć
              </motion.span>
            ) : claimed ? (
              <motion.span
                key="claimer"
                initial={fresh ? { opacity: 0, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={spring.smooth}
                className="flex min-w-0 items-center gap-1.5"
              >
                <Avatar player={claimer!} size={24} />
                <span className="truncate text-footnote font-semibold">{claimer!.name}</span>
              </motion.span>
            ) : (
              <motion.span
                key="rarity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-caption font-semibold uppercase tracking-wide text-label-3"
              >
                {RARITY_LABEL[object.rarity]}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </span>

      {/* top-right: points badge ↔ checkmark */}
      <span className={`absolute ${golden ? 'right-4 top-4' : 'right-3 top-3'} flex size-[34px] items-center justify-center`}>
        <HoldRing holding={holding} color={tint} />
        <AnimatePresence mode="popLayout" initial={false}>
          {claimed ? (
            <Checkmark key="check" color={claimer!.color} animateIn={fresh} />
          ) : (
            <motion.span
              key="pts"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={spring.snappy}
              className={`tabular rounded-full px-2 py-0.5 text-footnote font-bold ${
                golden ? 'bg-accent text-accent-ink' : 'bg-fill-2 text-label'
              }`}
            >
              +{points}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* floating +N */}
      <AnimatePresence>
        {claimed && fresh && (
          <motion.span
            key={claim!.at}
            aria-hidden
            className="tabular pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 text-title-1 font-black"
            style={{ color: claimer!.color, textShadow: '0 2px 12px rgb(0 0 0 / 0.5)' }}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: -56, scale: 1.05 }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1], times: [0, 0.15, 0.6, 1] }}
          >
            +{claim!.points}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/** Undo progress ring: fills slowly while held (deliberate), snaps back fast on release. */
function HoldRing({ holding, color }: { holding: boolean; color: string }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 36 36" className="pointer-events-none absolute inset-0 -rotate-90" aria-hidden>
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        style={{
          strokeDashoffset: holding ? 0 : c,
          opacity: holding ? 1 : 0,
          transition: holding
            ? `stroke-dashoffset ${HOLD_MS}ms linear, opacity 80ms linear`
            : 'stroke-dashoffset 200ms cubic-bezier(0.23,1,0.32,1), opacity 200ms cubic-bezier(0.23,1,0.32,1)',
        }}
      />
    </svg>
  );
}
