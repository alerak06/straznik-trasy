import { Minus, Plus } from 'lucide-react';
import { SteeringWheel } from '../design/icons';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Avatar } from '../design/Avatar';
import { Button } from '../design/Button';
import { Sheet } from '../design/Sheet';
import { PLAYER_COLORS, PLAYER_EMOJI } from '../game/players';
import { game } from '../game/store';
import type { Player } from '../game/types';
import { haptics } from '../lib/haptics';
import { uid } from '../lib/random';
import { spring } from '../lib/motion';
import { useUi } from '../ui/uiStore';

const MAX_PLAYERS = 8;

function makeRow(index: number, role: Player['role']): Player {
  return {
    id: uid(),
    name: '',
    emoji: PLAYER_EMOJI[index % PLAYER_EMOJI.length],
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    role,
  };
}

const placeholder = (p: Player, i: number) =>
  p.role === 'master' ? 'Ty' : p.role === 'driver' ? 'Kierowca' : `Gracz ${i + 1}`;

export function TripSetup() {
  const open = useUi((s) => s.setupOpen);
  const close = useUi((s) => s.closeSetup);
  const [rows, setRows] = useState<Player[]>(() => [makeRow(0, 'master'), makeRow(1, 'driver')]);

  const update = (id: string, patch: Partial<Player>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const cycleEmoji = (p: Player) => {
    haptics.selection();
    const used = new Set(rows.map((r) => r.emoji));
    const start = PLAYER_EMOJI.indexOf(p.emoji);
    for (let k = 1; k <= PLAYER_EMOJI.length; k++) {
      const next = PLAYER_EMOJI[(start + k) % PLAYER_EMOJI.length];
      if (!used.has(next)) return update(p.id, { emoji: next });
    }
  };

  const toggleDriver = (p: Player) => {
    haptics.selection();
    setRows((rs) =>
      rs.map((r) =>
        r.role === 'master' ? r : { ...r, role: r.id === p.id && p.role !== 'driver' ? 'driver' : 'passenger' },
      ),
    );
  };

  const addRow = () => {
    haptics.selection();
    setRows((rs) => {
      const usedColors = new Set(rs.map((r) => r.color));
      const usedEmoji = new Set(rs.map((r) => r.emoji));
      const row = makeRow(rs.length, 'passenger');
      row.color = PLAYER_COLORS.find((c) => !usedColors.has(c)) ?? row.color;
      row.emoji = PLAYER_EMOJI.find((e) => !usedEmoji.has(e)) ?? row.emoji;
      return [...rs, row];
    });
  };

  const start = () => {
    haptics.impact();
    game.startTrip(rows.map((r, i) => ({ ...r, name: r.name.trim() || placeholder(r, i) })));
    close();
    setRows([makeRow(0, 'master'), makeRow(1, 'driver')]);
  };

  return (
    <Sheet open={open} onClose={close} title="Nowa trasa">
      <p className="px-2 pb-5 text-center text-subhead text-label-2">
        Ten telefon prowadzi grę. Dodaj wszystkich w aucie — kierowca gra na głos, a Ty zaznaczasz za niego.
      </p>

      <div className="squircle overflow-hidden rounded-[var(--radius-md)] bg-surface-2">
        <AnimatePresence initial={false}>
          {rows.map((p, i) => (
            <motion.div
              key={p.id}
              layout="position"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
              transition={spring.smooth}
              className="relative"
            >
              <div className="flex min-h-[60px] items-center gap-3 px-3 py-2">
                <button
                  type="button"
                  onClick={() => cycleEmoji(p)}
                  aria-label={`Zmień awatar gracza ${i + 1}`}
                  className="pressable rounded-full"
                >
                  <Avatar player={p} size={40} />
                </button>
                <input
                  value={p.name}
                  onChange={(e) => update(p.id, { name: e.target.value })}
                  placeholder={placeholder(p, i)}
                  maxLength={16}
                  enterKeyHint="done"
                  autoCapitalize="words"
                  aria-label={`Imię gracza ${i + 1}`}
                  className="min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-label-3"
                />
                {p.role === 'master' ? (
                  <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] px-2.5 py-1 text-caption font-semibold text-accent">
                    Mistrz Gry
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleDriver(p)}
                      aria-pressed={p.role === 'driver'}
                      className={`pressable flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-caption font-semibold transition-colors duration-200 ${
                        p.role === 'driver' ? 'bg-blue text-white' : 'bg-fill-2 text-label-2'
                      }`}
                    >
                      <SteeringWheel size={14} />
                      Kierowca
                    </button>
                    {rows.length > 2 && (
                      <button
                        type="button"
                        aria-label={`Usuń gracza ${i + 1}`}
                        onClick={() => {
                          haptics.selection();
                          setRows((rs) => rs.filter((r) => r.id !== p.id));
                        }}
                        className="pressable -mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-red"
                      >
                        <span className="flex size-[22px] items-center justify-center rounded-full bg-red text-white">
                          <Minus size={14} strokeWidth={3} />
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
              {i < rows.length - 1 && (
                <span aria-hidden className="absolute bottom-0 left-[64px] right-0 h-px scale-y-50 bg-separator" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {rows.length < MAX_PLAYERS && (
        <button
          type="button"
          onClick={addRow}
          className="pressable mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-full text-subhead font-semibold text-accent"
        >
          <Plus size={18} strokeWidth={2.4} />
          Dodaj gracza
        </button>
      )}

      <div className="pt-4">
        <Button block onClick={start}>
          Ruszamy!
        </Button>
      </div>
    </Sheet>
  );
}
