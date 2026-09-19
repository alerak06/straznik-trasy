import { Check, ChevronRight, Crown, Ghost, Maximize, Mic, Radar, RectangleHorizontal, Share, Smartphone, Users, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatedNumber } from '../design/AnimatedNumber';
import { Avatar } from '../design/Avatar';
import { Button } from '../design/Button';
import { Group, Row } from '../design/Group';
import { Screen } from '../design/Screen';
import { Sheet } from '../design/Sheet';
import { ROLE_LABEL } from '../game/players';
import { useLeaderboard, usePlayers, useTrip } from '../game/selectors';
import { game, useGameStore } from '../game/store';
import { haptics } from '../lib/haptics';
import { spring } from '../lib/motion';
import { useUi } from '../ui/uiStore';
import { RoadHero } from './RoadHero';

interface GameLink {
  path: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tint: string;
  ready: boolean;
}

const GAMES: GameLink[] = [
  { path: '/radar', title: 'Radar Obiektów', subtitle: 'Wypatrz 5 rzeczy za oknem', icon: Radar, tint: 'var(--green)', ready: true },
  { path: '/tablice', title: 'Sprawa Tablicy', subtitle: 'Rozwiń skrót z rejestracji', icon: RectangleHorizontal, tint: 'var(--blue)', ready: false },
  { path: '/historie', title: 'Czarne Historie', subtitle: 'Zagadki dla Mistrza Gry', icon: Ghost, tint: 'var(--purple)', ready: false },
  { path: '/wyzwania', title: 'Licznik Wyzwań', subtitle: 'Bez rąk — dla kierowcy też', icon: Mic, tint: 'var(--orange)', ready: false },
];

export function Home() {
  const trip = useTrip();
  const minutes = useMinutesSince(trip?.startedAt);
  return (
    <Screen title="Strażnik Trasy" eyebrow={trip ? `W trasie · ${formatDuration(minutes)}` : 'Gry w podróży'}>
      {trip ? <ActiveTrip /> : <Welcome />}
      <GamesList />
      {trip && <EndTrip />}
      <InstallHint />
    </Screen>
  );
}

function Welcome() {
  const openSetup = useUi((s) => s.openSetup);
  return (
    <>
      <section className="px-[var(--gutter)] pb-6">
        <div className="squircle overflow-hidden rounded-[var(--radius-lg)] bg-surface shadow-card">
          <RoadHero />
          <div className="px-5 pb-5 pt-4">
            <h2 className="text-title-2 font-bold">Gotowi do drogi?</h2>
            <p className="mt-1 text-subhead text-label-2">
              Cztery gry na całą trasę. Wystarczy jeden telefon — pasażer prowadzi, kierowca patrzy na drogę i gra na głos.
            </p>
            <Button block className="mt-5" onClick={openSetup}>
              Nowa trasa
            </Button>
          </div>
        </div>
      </section>

      <Group header="Tryb gry">
        <Row>
          <IconTile icon={Smartphone} tint="var(--accent)" />
          <div className="min-w-0 flex-1">
            <div className="text-body">Jeden telefon</div>
            <div className="text-footnote text-label-2">Pasażer jest Mistrzem Gry</div>
          </div>
          <Check size={20} className="text-accent" strokeWidth={2.6} aria-label="Wybrany" />
        </Row>
        <Row last>
          <IconTile icon={Users} tint="var(--label-3)" />
          <div className="min-w-0 flex-1 opacity-60">
            <div className="text-body">Kilka telefonów</div>
            <div className="text-footnote text-label-2">Pokój z kodem, każdy na swoim</div>
          </div>
          <span className="rounded-full bg-fill-2 px-2 py-0.5 text-caption font-semibold text-label-2">Wkrótce</span>
        </Row>
      </Group>
    </>
  );
}

function ActiveTrip() {
  const board = useLeaderboard();
  const ledger = useGameStore((s) => s.game.ledger);
  const players = usePlayers();
  const recent = ledger.slice(-5).reverse();
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const leaderScore = board[0]?.score ?? 0;

  return (
    <>
      <Group header="Ranking">
        <ol>
          {board.map((p, i) => (
            <motion.li key={p.id} layout transition={spring.smooth} className="relative bg-surface">
              <div className="flex min-h-[64px] items-center gap-3 px-4 py-2">
                <span className="tabular w-5 text-center text-subhead font-semibold text-label-3">{i + 1}</span>
                <Avatar player={p} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate text-headline font-semibold">
                    {p.name}
                    <AnimatePresence>
                      {i === 0 && leaderScore > 0 && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={spring.pop}
                          className="text-accent"
                        >
                          <Crown size={16} strokeWidth={2.4} aria-label="Prowadzi" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="text-footnote text-label-2">{ROLE_LABEL[p.role]}</div>
                </div>
                <div className="text-right">
                  <AnimatedNumber value={p.score} className="text-title-2 font-bold" />
                  <div className="text-caption-2 uppercase tracking-wide text-label-3">pkt</div>
                </div>
              </div>
              {i < board.length - 1 && (
                <span aria-hidden className="absolute bottom-0 left-[88px] right-0 h-px scale-y-50 bg-separator" />
              )}
            </motion.li>
          ))}
        </ol>
      </Group>

      {recent.length > 0 && (
        <Group header="Ostatnio">
          {recent.map((e, i) => {
            const p = byId[e.playerId];
            return (
              <Row key={e.id} last={i === recent.length - 1}>
                {p && <Avatar player={p} size={32} />}
                <div className="min-w-0 flex-1 truncate text-subhead">
                  <span className="font-semibold">{p?.name}</span> <span className="text-label-2">· {e.label}</span>
                </div>
                <span className="tabular text-subhead font-semibold text-green">+{e.points}</span>
              </Row>
            );
          })}
        </Group>
      )}
    </>
  );
}

function EndTrip() {
  const [confirmEnd, setConfirmEnd] = useState(false);
  return (
    <>
      <section className="px-[var(--gutter)] pb-6">
        <Button variant="destructive" size="md" block onClick={() => setConfirmEnd(true)}>
          Zakończ trasę
        </Button>
      </section>

      <Sheet open={confirmEnd} onClose={() => setConfirmEnd(false)} title="Zakończyć trasę?">
        <p className="pb-5 text-center text-subhead text-label-2">
          Wyniki i gracze zostaną wyczyszczeni. Tego nie da się cofnąć.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            variant="destructive"
            block
            onClick={() => {
              haptics.warning();
              game.endTrip();
              setConfirmEnd(false);
            }}
          >
            Zakończ i wyczyść
          </Button>
          <Button variant="gray" block onClick={() => setConfirmEnd(false)}>
            Jedziemy dalej
          </Button>
        </div>
      </Sheet>
    </>
  );
}

function GamesList() {
  const navigate = useNavigate();
  return (
    <Group header="Gry">
      {GAMES.map((g, i) => (
        <button
          key={g.path}
          type="button"
          onClick={() => navigate(g.path)}
          className="block w-full text-left transition-colors duration-150 active:bg-fill-2"
        >
          <Row last={i === GAMES.length - 1}>
            <IconTile icon={g.icon} tint={g.tint} />
            <div className="min-w-0 flex-1">
              <div className="text-body">{g.title}</div>
              <div className="truncate text-footnote text-label-2">{g.subtitle}</div>
            </div>
            {!g.ready && <span className="text-footnote text-label-3">Wkrótce</span>}
            <ChevronRight size={18} className="text-label-3" aria-hidden />
          </Row>
        </button>
      ))}
    </Group>
  );
}

function IconTile({ icon: Icon, tint }: { icon: LucideIcon; tint: string }) {
  return (
    <span
      aria-hidden
      className="squircle flex size-[30px] shrink-0 items-center justify-center rounded-[8px] text-white"
      style={{ background: tint }}
    >
      <Icon size={18} strokeWidth={2.2} />
    </span>
  );
}

/** Standalone/full-screen help: iOS gets the Add-to-Home-Screen hint, others a fullscreen toggle. */
function InstallHint() {
  const standalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true);
  if (standalone) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    return (
      <p className="flex items-center justify-center gap-1 px-8 pb-4 text-center text-footnote text-label-2">
        Pełny ekran: stuknij <Share size={14} aria-label="Udostępnij" /> i „Do ekranu początkowego”.
      </p>
    );
  }
  if (!document.fullscreenEnabled) return null;
  return (
    <section className="px-[var(--gutter)] pb-4">
      <Button
        variant="gray"
        size="md"
        block
        icon={<Maximize size={16} />}
        onClick={() => void document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {})}
      >
        Pełny ekran
      </Button>
    </section>
  );
}

function useMinutesSince(start?: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!start) return;
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [start]);
  return start ? Math.max(0, Math.floor((now - start) / 60_000)) : 0;
}

function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}
