import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { ROLE_LABEL } from '../game/players';
import type { Player } from '../game/types';
import { Avatar } from './Avatar';
import { Sheet } from './Sheet';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Visual header above the question (object, card, points…). */
  header?: ReactNode;
  question: string;
  players: Player[];
  onPick: (playerId: string | null) => void;
  /** Adds a "nobody" option (e.g. nobody solved the story). */
  nobodyLabel?: string;
}

/** Big, one-tap "who gets the points?" picker used by every game. */
export function PlayerPickerSheet({ open, onClose, header, question, players, onPick, nobodyLabel }: Props) {
  return (
    <Sheet open={open} onClose={onClose} label={question}>
      {header}
      <h3 className="pb-2 text-center text-footnote font-semibold uppercase tracking-wide text-label-2">{question}</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {players.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onPick(p.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.1, delay: 0.06 + i * 0.03 }}
            whileTap={{ scale: 0.96 }}
            className="squircle flex h-[68px] items-center gap-3 rounded-[20px] bg-surface-2 px-3 text-left"
            style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${p.color} 35%, transparent)` }}
          >
            <Avatar player={p} size={40} />
            <span className="min-w-0">
              <span className="block truncate text-headline font-semibold">{p.name}</span>
              <span className="block truncate text-caption text-label-2">{ROLE_LABEL[p.role]}</span>
            </span>
          </motion.button>
        ))}
      </div>
      {nobodyLabel && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onPick(null)}
          className="mt-2.5 flex h-12 w-full items-center justify-center rounded-full bg-fill-2 text-subhead font-semibold text-label-2"
        >
          {nobodyLabel}
        </motion.button>
      )}
    </Sheet>
  );
}
