import { Ghost, Lightbulb, Minus, Play, Plus, RotateCcw, Skull, Volume2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../design/Button';
import { PlayerPickerSheet } from '../../design/PlayerPickerSheet';
import { NavButton, Screen } from '../../design/Screen';
import { Sheet } from '../../design/Sheet';
import { DIFFICULTY_LABEL, STORIES, STORY_BY_ID, type Story } from '../../game/data/stories';
import { freshQueue, useMemory } from '../../game/memory';
import { storyPoints } from '../../game/scoring';
import { usePlayers, useTrip } from '../../game/selectors';
import { game, useGameStore } from '../../game/store';
import type { StoryPlay } from '../../game/types';
import { haptics } from '../../lib/haptics';
import { spring } from '../../lib/motion';
import { speak, stopSpeaking } from '../../lib/speech';
import { usePrefs } from '../../ui/prefs';
import { RECYCLED_TOAST, useUi } from '../../ui/uiStore';
import { MemoryChip } from '../memory/MemoryChip';
import { NeedsTrip } from '../NeedsTrip';
import { HoldToReveal } from './HoldToReveal';
import { SwipeDeck, type DeckHandle } from './SwipeDeck';

export function Stories() {
  const trip = useTrip();
  const play = useGameStore((s) => s.game.story);

  if (!trip) {
    return (
      <NeedsTrip
        title="Czarne Historie"
        icon={Ghost}
        gradient="linear-gradient(160deg, #cf7dff, #8e2fd0)"
        heading="Mroczne zagadki czekają"
        text="Mistrz Gry czyta krótką, dziwną historię. Reszta zadaje pytania, na które odpowiada tylko „tak” albo „nie”, aż ktoś odkryje prawdę."
      />
    );
  }

  return play ? <PlayView play={play} /> : <DeckView />;
}

// ── Deck ─────────────────────────────────────────────────────────────────

const FILTERS: { value: 0 | 1 | 2 | 3; label: string }[] = [
  { value: 0, label: 'Wszystkie' },
  { value: 1, label: 'Łatwe' },
  { value: 2, label: 'Średnie' },
  { value: 3, label: 'Trudne' },
];

function DeckView() {
  const difficulty = usePrefs((s) => s.storyDifficulty);
  const setPrefs = usePrefs((s) => s.set);
  const epoch = useMemory((s) => s.epoch);
  const deckRef = useRef<DeckHandle>(null);
  // Build the deck once per filter / memory reset — not on every card dealt.
  const initial = useMemo(() => {
    const pool = difficulty ? STORIES.filter((s) => s.difficulty === difficulty) : STORIES;
    return freshQueue('stories', pool);
  }, [difficulty, epoch]);
  const [dealt, setDealt] = useState(0);
  useEffect(() => setDealt(0), [initial]);
  const cards = initial.slice(dealt);
  const warned = useRef(false);

  // Once the next card is one we've already seen, say so (once per deck).
  const topSeen = cards[0] && cards[0].id in useMemory.getState().used.stories;
  useEffect(() => {
    if (topSeen && !warned.current) {
      warned.current = true;
      useUi.getState().showToast(RECYCLED_TOAST);
    }
  }, [topSeen]);

  const onSwipe = (story: Story, dir: 1 | -1) => {
    setDealt((d) => d + 1);
    if (dir === 1) game.startStory(story.id);
    else game.storySeen(story.id);
  };

  return (
    <Screen title="Czarne Historie" eyebrow="Talia zagadek">
      <MemoryChip game="stories" />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-[var(--gutter)] pb-4" role="tablist" aria-label="Trudność">
        {FILTERS.map((f) => {
          const active = f.value === difficulty;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                haptics.selection();
                setPrefs({ storyDifficulty: f.value });
              }}
              className="relative h-9 shrink-0 rounded-full px-4 text-subhead font-semibold"
            >
              {active && <motion.span layoutId="story-filter" transition={spring.smooth} className="absolute inset-0 rounded-full bg-purple" />}
              <span className={`relative ${active ? 'text-white' : 'text-label-2'}`}>{f.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-[var(--gutter)]">
        {cards.length > 0 ? (
          <>
            <SwipeDeck ref={deckRef} cards={cards} onSwipe={onSwipe} />
            <div className="mt-2 flex items-center justify-center gap-6">
              <DeckButton label="Pomiń" tone="red" onClick={() => deckRef.current?.fling(-1)}>
                <X size={30} strokeWidth={2.6} />
              </DeckButton>
              <DeckButton label="Gramy" tone="green" big onClick={() => deckRef.current?.fling(1)}>
                <Play size={34} strokeWidth={2.4} fill="currentColor" />
              </DeckButton>
            </div>
            <p className="pt-4 text-center text-footnote text-label-3">
              Przesuń w prawo, żeby zagrać, w lewo, żeby pominąć. Pominięte też trafiają do pamięci.
            </p>
          </>
        ) : (
          <EmptyDeck />
        )}
      </div>
    </Screen>
  );
}

function DeckButton({ label, tone, big, onClick, children }: { label: string; tone: 'red' | 'green'; big?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      transition={spring.snappy}
      onClick={onClick}
      className={`flex items-center justify-center rounded-full bg-surface shadow-card ${big ? 'size-20' : 'size-16'} ${
        tone === 'red' ? 'text-red' : 'text-green'
      }`}
    >
      {children}
    </motion.button>
  );
}

function EmptyDeck() {
  const reset = useMemory((s) => s.reset);
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <Ghost size={48} className="text-purple" />
      <h2 className="mt-4 text-title-2 font-bold">Koniec talii</h2>
      <p className="mt-2 text-subhead text-label-2">Przeszliście wszystkie historie z tej trudności. Zmieńcie filtr albo zacznijcie od nowa.</p>
      <Button className="mt-6" icon={<RotateCcw size={18} />} onClick={() => reset('stories')}>
        Wyzeruj pamięć historii
      </Button>
    </div>
  );
}

// ── Play ─────────────────────────────────────────────────────────────────

function PlayView({ play }: { play: StoryPlay }) {
  const story = STORY_BY_ID[play.storyId];
  const players = usePlayers();
  const speakPref = usePrefs((s) => s.speak);
  const [picking, setPicking] = useState(false);
  const [confirmHint, setConfirmHint] = useState(false);
  const elapsed = useElapsed(play.startedAt);
  const points = storyPoints(story.difficulty, play.hintShown);

  useEffect(() => {
    if (speakPref) speak(`${story.title}. ${story.story}`);
    return stopSpeaking;
  }, [story, speakPref]);

  return (
    <Screen
      title={story.title}
      eyebrow={`Czarna historia · ${DIFFICULTY_LABEL[story.difficulty]}`}
      trailing={
        <>
          <NavButton label="Przeczytaj na głos" onClick={() => speak(`${story.title}. ${story.story}`)}>
            <Volume2 size={18} />
          </NavButton>
          <NavButton label="Odłóż historię" onClick={() => game.abandonStory()}>
            <X size={18} strokeWidth={2.6} />
          </NavButton>
        </>
      }
    >
      <div className="flex flex-col gap-4 px-[var(--gutter)]">
        <motion.article
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={spring.smooth}
          className="squircle rounded-[var(--radius-lg)] bg-surface p-5 shadow-card"
        >
          <div className="mb-3 flex items-center gap-1 text-purple">
            {Array.from({ length: 3 }, (_, i) => (
              <Skull key={i} size={16} className={i < story.difficulty ? '' : 'opacity-20'} />
            ))}
            <span className="ml-auto tabular text-footnote text-label-2">{elapsed}</span>
          </div>
          <p className="text-[21px] leading-[30px]">{story.story}</p>
        </motion.article>

        <div className="squircle flex items-center gap-3 rounded-[var(--radius-md)] bg-surface p-3 pl-4 shadow-card">
          <div className="flex-1">
            <div className="text-footnote text-label-2">Pytania „tak / nie”</div>
            <motion.div key={play.questions} initial={{ scale: 0.85 }} animate={{ scale: 1 }} transition={spring.pop} className="tabular text-title-1 font-bold">
              {play.questions}
            </motion.div>
          </div>
          <motion.button
            type="button"
            aria-label="Odejmij pytanie"
            whileTap={{ scale: 0.9 }}
            onClick={() => game.storyQuestion(-1)}
            className="flex size-12 items-center justify-center rounded-full bg-fill-2 text-label-2"
          >
            <Minus size={20} />
          </motion.button>
          <motion.button
            type="button"
            aria-label="Dodaj pytanie"
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              haptics.selection();
              game.storyQuestion(1);
            }}
            className="flex h-14 items-center gap-2 rounded-full bg-purple px-5 text-headline font-semibold text-white"
          >
            <Plus size={20} strokeWidth={2.6} /> Pytanie
          </motion.button>
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          {play.hintShown ? (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.smooth}
              className="squircle flex gap-3 rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] p-4"
            >
              <Lightbulb size={20} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-body">{story.hint}</p>
            </motion.div>
          ) : (
            <motion.div key="hint-btn" exit={{ opacity: 0, transition: { duration: 0.12 } }}>
              <Button variant="tinted" block icon={<Lightbulb size={18} />} onClick={() => setConfirmHint(true)}>
                Podpowiedź (−1 pkt)
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <HoldToReveal label="Rozwiązanie" text={story.solution} revealed={play.revealed} />
        {!play.revealed && (
          <Button variant="plain" size="md" block onClick={() => game.storyReveal()}>
            Odsłoń rozwiązanie wszystkim
          </Button>
        )}

        <Button block onClick={() => setPicking(true)}>
          Ktoś rozwiązał! · {points} pkt
        </Button>
      </div>

      <Sheet open={confirmHint} onClose={() => setConfirmHint(false)} title="Dać podpowiedź?">
        <p className="pb-5 text-center text-subhead text-label-2">
          Za rozwiązanie będzie o jeden punkt mniej ({storyPoints(story.difficulty, true)} zamiast {storyPoints(story.difficulty, false)}).
        </p>
        <div className="flex flex-col gap-2">
          <Button
            block
            onClick={() => {
              haptics.impact();
              game.storyHint();
              setConfirmHint(false);
              if (speakPref) speak(story.hint);
            }}
          >
            Pokaż podpowiedź
          </Button>
          <Button variant="gray" block onClick={() => setConfirmHint(false)}>
            Jeszcze nie
          </Button>
        </div>
      </Sheet>

      <PlayerPickerSheet
        open={picking}
        onClose={() => setPicking(false)}
        question="Kto odkrył prawdę?"
        players={players}
        nobodyLabel="Nikt nie zgadł — odłóż historię"
        header={
          <div className="pb-4 text-center">
            <p className="text-title-3 font-bold">{story.title}</p>
            <p className="mt-1 text-subhead text-label-2">
              <span className="tabular font-semibold text-accent">+{points} pkt</span> · {play.questions} pytań
            </p>
          </div>
        }
        onPick={(playerId) => {
          setPicking(false);
          if (playerId) haptics.celebrate();
          window.setTimeout(() => game.storySolved(playerId), 160);
        }}
      />
    </Screen>
  );
}

function useElapsed(since: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor((now - since) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
