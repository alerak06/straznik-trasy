import { Eye, Mic, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { Avatar } from '../../design/Avatar';
import { Button } from '../../design/Button';
import { NavButton, Screen } from '../../design/Screen';
import { CHALLENGE_BY_ID, KIND_COUNTS, KIND_LABEL, type Challenge } from '../../game/data/challenges';
import { usePlayers, useTrip } from '../../game/selectors';
import { game, useGameStore, type ChallengeFilter } from '../../game/store';
import type { ChallengePlay } from '../../game/types';
import { haptics } from '../../lib/haptics';
import { spring } from '../../lib/motion';
import { canSpeak, speak, stopSpeaking } from '../../lib/speech';
import { usePrefs } from '../../ui/prefs';
import { RECYCLED_TOAST, useUi } from '../../ui/uiStore';
import { MemoryChip } from '../memory/MemoryChip';
import { NeedsTrip } from '../NeedsTrip';
import { Countdown } from './Countdown';

const FILTERS: { value: ChallengeFilter; label: string; count: number }[] = [
  { value: 'mix', label: 'Mieszane', count: Object.values(KIND_COUNTS).reduce((a, b) => a + b, 0) },
  { value: 'pytanie', label: 'Pytania', count: KIND_COUNTS.pytanie },
  { value: 'przyslowie', label: 'Przysłowia', count: KIND_COUNTS.przyslowie },
  { value: 'zagadka', label: 'Zagadki', count: KIND_COUNTS.zagadka },
  { value: 'wyzwanie', label: 'Wyzwania', count: KIND_COUNTS.wyzwanie },
];

const next = (filter: ChallengeFilter) => {
  if (game.nextChallenge(filter)) useUi.getState().showToast(RECYCLED_TOAST);
};

export function Challenges() {
  const trip = useTrip();
  const play = useGameStore((s) => s.game.challenge);
  const filter = usePrefs((s) => s.challengeFilter);
  const speakOn = usePrefs((s) => s.speak);
  const setPrefs = usePrefs((s) => s.set);

  if (!trip) {
    return (
      <NeedsTrip
        title="Licznik Wyzwań"
        icon={Mic}
        gradient="linear-gradient(160deg, #ffbf4d, #f08a00)"
        heading="Wyzwania czekają na trasę"
        text="Pytania, przysłowia, zagadki i szybkie wyzwania na głos. Ogromne litery i czytanie na głos — kierowca gra bez odrywania rąk od kierownicy."
      />
    );
  }

  return (
    <Screen
      title="Licznik Wyzwań"
      eyebrow="Tryb bez rąk"
      trailing={
        canSpeak() && (
          <NavButton
            label={speakOn ? 'Wyłącz czytanie na głos' : 'Włącz czytanie na głos'}
            onClick={() => {
              haptics.selection();
              if (speakOn) stopSpeaking();
              setPrefs({ speak: !speakOn });
            }}
          >
            {speakOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </NavButton>
        )
      }
    >
      <MemoryChip game="challenges" />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-[var(--gutter)] pb-4" role="tablist" aria-label="Rodzaj">
        {FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                haptics.selection();
                setPrefs({ challengeFilter: f.value });
              }}
              className="relative h-9 shrink-0 rounded-full px-4 text-subhead font-semibold"
            >
              {active && <motion.span layoutId="challenge-filter" transition={spring.smooth} className="absolute inset-0 rounded-full bg-orange" />}
              <span className={`relative ${active ? 'text-black' : 'text-label-2'}`}>
                {f.label} <span className="tabular opacity-60">{f.count}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-[var(--gutter)]">
        <AnimatePresence mode="popLayout" initial={false}>
          {play && CHALLENGE_BY_ID[play.itemId] ? (
            <ChallengeCard key={play.itemId + play.startedAt} play={play} item={CHALLENGE_BY_ID[play.itemId]} filter={filter} />
          ) : (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
              transition={spring.smooth}
              className="squircle flex flex-col items-center rounded-[var(--radius-lg)] bg-surface px-6 py-10 text-center shadow-card"
            >
              <p className="text-[34px] font-black leading-tight">Gotowi?</p>
              <p className="mt-2 text-body text-label-2">Pasażer losuje, wszyscy odpowiadają na głos.</p>
              <Button className="mt-6 w-full" onClick={() => next(filter)}>
                Losuj pierwsze
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}

function ChallengeCard({ play, item, filter }: { play: ChallengePlay; item: Challenge; filter: ChallengeFilter }) {
  const players = usePlayers();
  const speakOn = usePrefs((s) => s.speak);
  const hasAnswer = Boolean(item.answer);
  const long = item.text.length > 80;

  useEffect(() => {
    if (!speakOn) return;
    speak(item.kind === 'przyslowie' ? `Dokończ przysłowie: ${item.text}` : item.text);
  }, [item, speakOn]);

  useEffect(() => {
    if (speakOn && play.revealed && item.answer) speak(item.kind === 'przyslowie' ? `${item.text} ${item.answer}` : item.answer);
  }, [play.revealed, item, speakOn]);

  const score = (playerId: string | null) => {
    if (playerId) haptics.success();
    else haptics.selection();
    game.scoreChallenge(playerId);
    next(filter);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -40, filter: 'blur(4px)', transition: { duration: 0.18 } }}
      transition={spring.smooth}
      className="flex flex-col gap-4"
    >
      <article className="squircle rounded-[var(--radius-lg)] bg-surface p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[color-mix(in_srgb,var(--orange)_18%,transparent)] px-2.5 py-1 text-caption font-bold uppercase tracking-wide text-orange">
            {KIND_LABEL[item.kind]}
          </span>
          <span className="truncate text-caption font-semibold uppercase tracking-wide text-label-2">{item.category}</span>
          <span className="tabular ml-auto rounded-full bg-fill-2 px-2 py-0.5 text-footnote font-bold">+{item.points}</span>
        </div>
        <p className={`mt-4 font-extrabold text-balance ${long ? 'text-[27px] leading-[34px]' : 'text-[34px] leading-[41px]'}`}>
          {item.text}
        </p>

        {item.seconds && (
          <div className="mt-5">
            <Countdown seconds={item.seconds} />
          </div>
        )}

        {hasAnswer && (
          <div className="mt-5">
            <AnimatePresence mode="popLayout" initial={false}>
              {play.revealed ? (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={spring.smooth}
                  className="rounded-[18px] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] p-4"
                >
                  <div className="text-caption font-semibold uppercase tracking-wide text-label-2">Odpowiedź</div>
                  <div className="mt-1 text-[26px] font-bold leading-[32px] text-accent">{item.answer}</div>
                </motion.div>
              ) : (
                <motion.div key="reveal" exit={{ opacity: 0, transition: { duration: 0.1 } }}>
                  <Button
                    variant="tinted"
                    block
                    icon={<Eye size={20} />}
                    className="!h-16 !text-title-3"
                    onClick={() => {
                      haptics.impact();
                      game.revealChallenge();
                    }}
                  >
                    Pokaż odpowiedź
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </article>

      <div>
        <h3 className="pb-2 text-center text-footnote font-semibold uppercase tracking-wide text-label-2">Kto zdobył punkt?</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {players.map((p) => (
            <motion.button
              key={p.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              transition={spring.snappy}
              onClick={() => score(p.id)}
              className="squircle flex h-[72px] items-center gap-3 rounded-[22px] bg-surface px-3 text-left shadow-card"
              style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${p.color} 40%, transparent)` }}
            >
              <Avatar player={p} size={44} />
              <span className="truncate text-title-3 font-bold">{p.name}</span>
            </motion.button>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <Button variant="gray" onClick={() => score(null)}>
            Nikt
          </Button>
          <Button
            variant="gray"
            icon={<SkipForward size={18} />}
            onClick={() => {
              haptics.selection();
              next(filter);
            }}
          >
            Pomiń
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
