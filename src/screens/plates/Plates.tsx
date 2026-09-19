import { Check, Dices, MapPin, Mic, Minus, Plus, RectangleHorizontal, Shuffle, TriangleAlert, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar } from '../../design/Avatar';
import { Button } from '../../design/Button';
import { Group, Row } from '../../design/Group';
import { NavButton, Screen } from '../../design/Screen';
import { Sheet } from '../../design/Sheet';
import { PLATE_REGION, PLATE_THEME_BY_ID, RANDOM_LETTERS } from '../../game/data/plateThemes';
import { useMemory } from '../../game/memory';
import { PLATES_TIE, PLATES_WIN } from '../../game/scoring';
import { usePlayers, useTrip } from '../../game/selectors';
import { game, plateKey, useGameStore } from '../../game/store';
import type { PlatesRound, Player } from '../../game/types';
import { haptics } from '../../lib/haptics';
import { spring } from '../../lib/motion';
import { RECYCLED_TOAST, useUi } from '../../ui/uiStore';
import { MemoryChip } from '../memory/MemoryChip';
import { NeedsTrip } from '../NeedsTrip';
import { Expansion, matchesPlate, patternFor } from './expansion';
import { Plate } from './Plate';
import { PlateKeyboard } from './PlateKeyboard';

interface Result {
  letters: string;
  winners: Player[];
  text: string;
  points: number;
}

export function Plates() {
  const trip = useTrip();
  const round = useGameStore((s) => s.game.plates.round);
  const [result, setResult] = useState<Result | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!trip) {
    return (
      <NeedsTrip
        title="Sprawa Tablicy"
        icon={RectangleHorizontal}
        gradient="linear-gradient(160deg, #3d9bff, #0a64d6)"
        heading="Tablice czekają na trasę"
        text="Widzicie tablicę „KRA”? Rozwińcie ją w najzabawniejsze zdanie — Kaczka Rozwozi Arbuzy. Najlepsze wygrywa w głosowaniu."
      />
    );
  }

  const phaseKey = round ? `${round.id}:${round.phase}` : 'entry';

  return (
    <Screen
      title="Sprawa Tablicy"
      eyebrow="Rozwiń skrót z tablicy"
      trailing={
        round && (
          <NavButton label="Przerwij rundę" onClick={() => setConfirmCancel(true)}>
            <X size={18} strokeWidth={2.6} />
          </NavButton>
        )
      }
    >
      <MemoryChip game="plates" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={phaseKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.14 } }}
          transition={spring.smooth}
        >
          {!round ? (
            <Entry />
          ) : round.phase === 'propose' ? (
            <Propose round={round} />
          ) : (
            <Vote round={round} onFinished={setResult} />
          )}
        </motion.div>
      </AnimatePresence>

      <ResultSheet result={result} onClose={() => setResult(null)} />

      <Sheet open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Przerwać rundę?">
        <p className="pb-5 text-center text-subhead text-label-2">Nikt nie dostanie punktów za tę tablicę.</p>
        <div className="flex flex-col gap-2">
          <Button
            variant="destructive"
            block
            onClick={() => {
              haptics.warning();
              game.cancelPlates();
              setConfirmCancel(false);
            }}
          >
            Przerwij
          </Button>
          <Button variant="gray" block onClick={() => setConfirmCancel(false)}>
            Gramy dalej
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}

// ── 1. Letters ───────────────────────────────────────────────────────────

function Entry() {
  const [letters, setLetters] = useState('');
  const used = useMemory((s) => s.used.plates);
  const ref = useRef<HTMLDivElement>(null);
  const seen = letters.length === 3 && plateKey(letters) in used;
  const region = letters ? PLATE_REGION[letters[0]] : undefined;

  const type = (ch: string) => setLetters((l) => (l.length < 3 ? l + ch : l));
  const del = () => setLetters((l) => l.slice(0, -1));
  const start = () => {
    if (letters.length !== 3) return;
    haptics.impact();
    if (game.startPlates(letters)) useUi.getState().showToast(RECYCLED_TOAST);
  };
  const random = () => {
    haptics.selection();
    for (let tries = 0; tries < 40; tries++) {
      const next = Array.from({ length: 3 }, () => RANDOM_LETTERS[Math.floor(Math.random() * RANDOM_LETTERS.length)]).join('');
      if (!(plateKey(next) in used) || tries === 39) {
        setLetters(next);
        return;
      }
    }
  };

  // Hardware keyboard (desktop, or a paired keyboard) — only while this tab is visible.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!ref.current?.offsetParent || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (/^[a-z]$/i.test(e.key)) type(e.key.toUpperCase());
      else if (e.key === 'Backspace') del();
      else if (e.key === 'Enter') start();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div ref={ref} className="px-[var(--gutter)]">
      <div className="pt-2">
        <Plate letters={letters} typing />
      </div>

      <div className="flex h-12 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {seen ? (
            <motion.p
              key="seen"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-footnote font-semibold text-orange"
            >
              <TriangleAlert size={15} /> Ta tablica już była — możecie grać, ale ktoś pamięta!
            </motion.p>
          ) : region ? (
            <motion.p
              key={region}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-footnote text-label-2"
            >
              <MapPin size={15} /> {letters[0]} to {region}
            </motion.p>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-footnote text-label-2">
              Wpisz trzy litery z tablicy auta przed Wami.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <PlateKeyboard onKey={type} onDelete={del} disabled={letters.length >= 3} />

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-2.5">
        <Button variant="gray" icon={<Dices size={18} />} onClick={random}>
          Losuj
        </Button>
        <Button disabled={letters.length !== 3} onClick={start}>
          Rozwiń!
        </Button>
      </div>

      <History />
    </div>
  );
}

// ── 2. Proposals ─────────────────────────────────────────────────────────

function Propose({ round }: { round: PlatesRound }) {
  const players = usePlayers();
  const theme = PLATE_THEME_BY_ID[round.themeId];
  const count = Object.keys(round.proposals).length;

  return (
    <div>
      <section className="px-[var(--gutter)] pb-5">
        <div className="squircle relative overflow-hidden rounded-[var(--radius-lg)] bg-surface p-5 shadow-card">
          <div className="flex items-start gap-4">
            <Plate letters={round.letters} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-caption font-semibold uppercase tracking-wide text-label-2">Rozwiń jako</div>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h2
                  key={round.themeId}
                  initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
                  transition={spring.smooth}
                  className="mt-0.5 text-title-3 font-bold"
                >
                  {theme?.text}
                </motion.h2>
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="tabular text-footnote text-label-2">Wzór: {patternFor(round.letters)}</span>
            <Button
              variant="tinted"
              size="md"
              icon={<Shuffle size={16} />}
              onClick={() => {
                haptics.selection();
                if (game.newPlatesTheme()) useUi.getState().showToast(RECYCLED_TOAST);
              }}
            >
              Inny temat
            </Button>
          </div>
        </div>
      </section>

      <Group header="Kto ma pomysł?" footer="Wpiszcie rozwinięcia albo zaznaczcie mikrofon, jeśli ktoś powiedział je na głos.">
        {players.map((p, i) => (
          <ProposalRow key={p.id} player={p} round={round} last={i === players.length - 1} />
        ))}
      </Group>

      <section className="px-[var(--gutter)]">
        <Button
          block
          disabled={count === 0}
          onClick={() => {
            haptics.impact();
            game.platesToVote();
          }}
        >
          Głosowanie {count > 0 && `(${count})`}
        </Button>
      </section>
    </div>
  );
}

function ProposalRow({ player, round, last }: { player: Player; round: PlatesRound; last: boolean }) {
  const text = round.proposals[player.id];
  const active = text !== undefined;
  const valid = active && text !== '' && matchesPlate(text, round.letters);
  const spoken = active && text === '';

  return (
    <Row last={last}>
      <Avatar player={player} size={32} />
      <div className="min-w-0 flex-1">
        <div className="text-footnote font-semibold text-label-2">{player.name}</div>
        <input
          value={text ?? ''}
          onChange={(e) => game.proposePlates(player.id, e.target.value === '' ? null : e.target.value)}
          placeholder={spoken ? 'Powiedziane na głos' : patternFor(round.letters)}
          autoCapitalize="words"
          enterKeyHint="done"
          aria-label={`Rozwinięcie: ${player.name}`}
          className="w-full bg-transparent text-body outline-none placeholder:text-label-3"
        />
      </div>
      <AnimatePresence initial={false}>
        {valid && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={spring.pop}
            className="flex size-6 items-center justify-center rounded-full bg-green text-white"
            aria-label="Pasuje do tablicy"
          >
            <Check size={15} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
      {!(active && text !== '') && (
        <button
          type="button"
          aria-pressed={spoken}
          aria-label={spoken ? 'Cofnij: powiedziane na głos' : 'Powiedział na głos'}
          onClick={() => {
            haptics.selection();
            game.proposePlates(player.id, spoken ? null : '');
          }}
          className={`pressable flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
            spoken ? 'bg-accent text-accent-ink' : 'bg-fill-2 text-label-2'
          }`}
        >
          <Mic size={17} />
        </button>
      )}
    </Row>
  );
}

// ── 3. Vote ──────────────────────────────────────────────────────────────

function Vote({ round, onFinished }: { round: PlatesRound; onFinished: (r: Result) => void }) {
  const players = usePlayers();
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const entries = Object.entries(round.proposals).filter(([id]) => byId[id]);
  const total = Object.values(round.votes).reduce((a, b) => a + b, 0);
  const left = players.length - total;
  const top = Math.max(0, ...Object.values(round.votes));

  const finish = () => {
    const winners = top > 0 ? entries.filter(([id]) => round.votes[id] === top).map(([id]) => byId[id]) : [];
    haptics.celebrate();
    onFinished({
      letters: round.letters,
      winners,
      text: winners.map((w) => round.proposals[w.id]).find(Boolean) ?? '',
      points: winners.length > 1 ? PLATES_TIE : PLATES_WIN,
    });
    game.finishPlates();
  };

  return (
    <div className="px-[var(--gutter)]">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <Plate letters={round.letters} size="sm" />
          <p className="text-subhead text-label-2">Jeden głos na osobę</p>
        </div>
        <span className="tabular shrink-0 whitespace-nowrap rounded-full bg-fill-2 px-2.5 py-1 text-footnote font-semibold">
          {left} {left === 1 ? 'głos' : left >= 2 && left <= 4 ? 'głosy' : 'głosów'}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {entries.map(([id, text]) => {
          const p = byId[id];
          const votes = round.votes[id] ?? 0;
          const leading = votes > 0 && votes === top;
          return (
            <motion.div
              key={id}
              layout
              transition={spring.smooth}
              className="squircle relative overflow-hidden rounded-[var(--radius-md)] bg-surface p-4 shadow-card"
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{ boxShadow: `inset 0 0 0 2px ${p.color}`, background: `color-mix(in srgb, ${p.color} 10%, transparent)` }}
                initial={false}
                animate={{ opacity: leading ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
              <div className="relative flex items-center gap-2">
                <Avatar player={p} size={26} />
                <span className="text-footnote font-semibold">{p.name}</span>
              </div>
              <p className="relative mt-2 text-title-3 font-semibold">
                {text ? <Expansion text={text} /> : <span className="italic text-label-2">powiedziane na głos</span>}
              </p>
              <div className="relative mt-3 flex items-center justify-end gap-3">
                <StepButton label="Odejmij głos" disabled={votes === 0} onClick={() => game.votePlates(id, -1)}>
                  <Minus size={18} strokeWidth={2.6} />
                </StepButton>
                <motion.span
                  key={votes}
                  initial={{ scale: 0.7, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={spring.pop}
                  className="tabular w-8 text-center text-title-2 font-bold"
                >
                  {votes}
                </motion.span>
                <StepButton label="Dodaj głos" disabled={left === 0} onClick={() => game.votePlates(id, 1)}>
                  <Plus size={18} strokeWidth={2.6} />
                </StepButton>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <Button block disabled={total === 0} onClick={finish}>
          Ogłoś zwycięzcę
        </Button>
        <Button variant="plain" size="md" block onClick={() => game.platesBackToPropose()}>
          Wróć do propozycji
        </Button>
      </div>
    </div>
  );
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={spring.snappy}
      onClick={() => {
        haptics.selection();
        onClick();
      }}
      className="flex size-11 items-center justify-center rounded-full bg-fill-2 text-accent disabled:opacity-35"
    >
      {children}
    </motion.button>
  );
}

// ── Result + archive ─────────────────────────────────────────────────────

function ResultSheet({ result, onClose }: { result: Result | null; onClose: () => void }) {
  const [shown, setShown] = useState<Result | null>(null);
  useEffect(() => {
    if (result) setShown(result);
  }, [result]);
  const r = shown;
  return (
    <Sheet open={result !== null} onClose={onClose} label="Wynik rundy">
      {r && (
        <div className="flex flex-col items-center pb-2 text-center">
          <Plate letters={r.letters} size="sm" />
          <h2 className="mt-4 text-title-1 font-bold">
            {r.winners.length === 0 ? 'Brak zwycięzcy' : r.winners.length > 1 ? 'Remis!' : `Wygrywa ${r.winners[0].name}!`}
          </h2>
          {r.text && <Expansion text={r.text} className="mt-2 block text-title-3 font-semibold" />}
          {r.winners.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {r.winners.map((w, i) => (
                <motion.span
                  key={w.id}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...spring.pop, delay: 0.1 + i * 0.06 }}
                  className="flex items-center gap-2 rounded-full bg-surface-2 py-1 pl-1 pr-3"
                >
                  <Avatar player={w} size={30} />
                  <span className="text-subhead font-semibold">{w.name}</span>
                  <span className="tabular text-subhead font-bold text-green">+{r.points}</span>
                </motion.span>
              ))}
            </div>
          )}
          <Button block className="mt-6" onClick={onClose}>
            Następna tablica
          </Button>
        </div>
      )}
    </Sheet>
  );
}

function History() {
  const history = useGameStore((s) => s.game.plates.history);
  const players = usePlayers();
  if (history.length === 0) return null;
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  return (
    <div className="-mx-[var(--gutter)] pt-7">
      <Group header="Archiwum tablic">
        {history.slice(0, 10).map((h, i) => (
          <Row key={h.id} last={i === Math.min(history.length, 10) - 1}>
            <span className="tabular flex h-[30px] w-[48px] shrink-0 items-center justify-center rounded-[6px] border-2 border-black bg-white text-footnote font-black text-black">
              {h.letters}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-subhead">{h.text ? <Expansion text={h.text} /> : PLATE_THEME_BY_ID[h.themeId]?.text}</div>
              <div className="truncate text-footnote text-label-2">
                {h.winnerIds.length ? h.winnerIds.map((id) => byId[id]?.name).filter(Boolean).join(', ') : 'bez zwycięzcy'}
              </div>
            </div>
          </Row>
        ))}
      </Group>
    </div>
  );
}
