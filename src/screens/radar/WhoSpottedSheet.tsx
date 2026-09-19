import { motion } from 'motion/react';
import { Avatar } from '../../design/Avatar';
import { Sheet } from '../../design/Sheet';
import type { RadarObject } from '../../game/data/radarObjects';
import { ROLE_LABEL } from '../../game/players';
import type { Player } from '../../game/types';

interface Props {
  open: boolean;
  object: RadarObject | null;
  points: number;
  golden: boolean;
  players: Player[];
  onPick: (playerId: string) => void;
  onClose: () => void;
}

export function WhoSpottedSheet({ open, object, points, golden, players, onPick, onClose }: Props) {
  return (
    <Sheet open={open} onClose={onClose} label="Kto wypatrzył?">
      {object && (
        <>
          <div className="flex flex-col items-center pb-5 text-center">
            <span aria-hidden className="flex size-20 items-center justify-center rounded-[24px] bg-fill-2 text-[46px]">
              {object.emoji}
            </span>
            <h2 className="mt-3 text-title-2 font-bold">{object.name}</h2>
            <p className="mt-0.5 text-subhead text-label-2">
              <span className="tabular font-semibold text-accent">+{points} pkt</span>
              {golden && ' · złoty obiekt ×2'}
            </p>
          </div>
          <h3 className="pb-2 text-center text-footnote font-semibold uppercase tracking-wide text-label-2">Kto wypatrzył?</h3>
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
        </>
      )}
    </Sheet>
  );
}
