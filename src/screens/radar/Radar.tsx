import { Radar as RadarIcon, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { AnimatedNumber } from '../../design/AnimatedNumber';
import { Avatar } from '../../design/Avatar';
import { Button } from '../../design/Button';
import { NavButton, Screen } from '../../design/Screen';
import { Sheet } from '../../design/Sheet';
import { BINGO_BONUS, RADAR_BY_ID } from '../../game/data/radarObjects';
import { BOARD_SIZE, GOLDEN_INDEX, isComplete, pointsFor } from '../../game/radar';
import { useLeaderboard, usePlayers, useRadar } from '../../game/selectors';
import { game } from '../../game/store';
import { haptics } from '../../lib/haptics';
import { spring } from '../../lib/motion';
import { RECYCLED_TOAST, useUi } from '../../ui/uiStore';
import { MemoryChip } from '../memory/MemoryChip';
import { BingoOverlay } from './BingoOverlay';
import { RadarCard } from './RadarCard';
import { WhoSpottedSheet } from './WhoSpottedSheet';

export function Radar() {
  const board = useRadar();
  const players = usePlayers();
  const [mountedAt] = useState(() => Date.now());
  const [picking, setPicking] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [bingoOpen, setBingoOpen] = useState(false);
  const [spin, setSpin] = useState(0);

  // Celebrate only a bingo that happens while watching — not one restored from storage.
  const bingoSeen = useRef<string | null>(board?.bingo ? board.id : null);
  useEffect(() => {
    if (board?.bingo && bingoSeen.current !== board.id) {
      bingoSeen.current = board.id;
      const t = window.setTimeout(() => {
        haptics.celebrate();
        setBingoOpen(true);
      }, 450);
      return () => window.clearTimeout(t);
    }
    if (!board?.bingo && bingoSeen.current === board?.id) bingoSeen.current = null;
  }, [board?.bingo, board?.id]);

  if (!board || players.length === 0) return <EmptyState />;

  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const claimedCount = Object.keys(board.claims).length;
  const complete = isComplete(board);

  const newBoard = () => {
    haptics.impact();
    setSpin((s) => s + 1);
    setConfirmNew(false);
    setBingoOpen(false);
    if (game.newRadarBoard()) useUi.getState().showToast(RECYCLED_TOAST);
  };
  const requestNewBoard = () => (claimedCount > 0 && !complete ? setConfirmNew(true) : newBoard());

  const pickingObj = picking ? RADAR_BY_ID[picking] : null;

  return (
    <Screen
      title="Radar"
      eyebrow="Radar Obiektów"
      trailing={
        <NavButton label="Nowa plansza" onClick={requestNewBoard}>
          <motion.span animate={{ rotate: spin * 360 }} transition={spring.smooth} className="flex">
            <RefreshCw size={18} strokeWidth={2.4} />
          </motion.span>
        </NavButton>
      }
    >
      <MemoryChip game="radar" />
      <Progress
        count={claimedCount}
        colors={board.objectIds.map((id) => (board.claims[id] ? byId[board.claims[id].playerId]?.color : undefined))}
      />
      <MiniScoreboard />

      <div className="grid grid-cols-2 gap-3 px-[var(--gutter)]">
        <AnimatePresence mode="popLayout" initial={false}>
          {board.objectIds.map((id, i) => {
            const obj = RADAR_BY_ID[id];
            if (!obj) return null;
            const claim = board.claims[id];
            const golden = i === GOLDEN_INDEX;
            return (
              <motion.div
                key={`${board.id}:${id}`}
                layout
                className={golden ? 'col-span-2' : ''}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.16 } }}
                transition={{ ...spring.smooth, delay: 0.04 * i }}
              >
                <RadarCard
                  object={obj}
                  points={pointsFor(board, id)}
                  golden={golden}
                  claim={claim}
                  claimer={claim ? byId[claim.playerId] : undefined}
                  freshAfter={mountedAt}
                  onRequestClaim={() => {
                    setPicking(id);
                    setSheetOpen(true);
                  }}
                  onUndo={() => game.undoRadar(id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <p className="px-10 pt-5 text-center text-footnote text-label-3">
        Stuknij kartę, gdy ktoś coś wypatrzy. Przytrzymaj zaznaczoną, aby cofnąć.
      </p>

      <WhoSpottedSheet
        open={sheetOpen}
        object={pickingObj}
        points={picking ? pointsFor(board, picking) : 0}
        golden={picking ? board.objectIds.indexOf(picking) === GOLDEN_INDEX : false}
        players={players}
        onClose={() => setSheetOpen(false)}
        onPick={(playerId) => {
          const objectId = picking;
          if (!sheetOpen) return;
          setSheetOpen(false);
          haptics.success();
          // Let the sheet start leaving so the card's claim animation is visible.
          if (objectId) window.setTimeout(() => game.claimRadar(objectId, playerId), 140);
        }}
      />

      <Sheet open={confirmNew} onClose={() => setConfirmNew(false)} title="Nowa plansza?">
        <p className="pb-5 text-center text-subhead text-label-2">
          Zdobyte punkty zostają. Niewypatrzone obiekty przepadną.
        </p>
        <div className="flex flex-col gap-2">
          <Button block onClick={newBoard}>
            Losuj nową planszę
          </Button>
          <Button variant="gray" block onClick={() => setConfirmNew(false)}>
            Gramy dalej
          </Button>
        </div>
      </Sheet>

      <BingoOverlay
        open={bingoOpen}
        winner={board.bingo ? byId[board.bingo.playerId] ?? null : null}
        bonus={board.bingo?.points ?? BINGO_BONUS}
        colors={players.map((p) => p.color)}
        onNewBoard={newBoard}
        onClose={() => setBingoOpen(false)}
      />
    </Screen>
  );
}

function Progress({ count, colors }: { count: number; colors: (string | undefined)[] }) {
  return (
    <section className="px-[var(--gutter)] pb-4">
      <div className="flex items-baseline gap-1.5">
        <span className="tabular text-title-1 font-bold">
          <AnimatedNumber value={count} />
          <span className="text-label-3">/{BOARD_SIZE}</span>
        </span>
        <span className="text-subhead text-label-2">{count === BOARD_SIZE ? 'komplet!' : 'wypatrzonych'}</span>
      </div>
      <div className="mt-2 flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={BOARD_SIZE} aria-valuenow={count}>
        {colors.map((c, i) => (
          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-fill-2">
            <motion.span
              className="block h-full origin-left rounded-full"
              style={{ background: c ?? 'transparent' }}
              initial={false}
              animate={{ scaleX: c ? 1 : 0 }}
              transition={spring.smooth}
            />
          </span>
        ))}
      </div>
    </section>
  );
}

function MiniScoreboard() {
  const board = useLeaderboard();
  return (
    <div className="no-scrollbar -mt-1 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-4">
      {board.map((p) => (
        <motion.div
          key={p.id}
          layout
          transition={spring.smooth}
          className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-surface pl-1 pr-3 shadow-card"
        >
          <Avatar player={p} size={32} />
          <span className="max-w-[88px] truncate text-footnote font-semibold">{p.name}</span>
          <AnimatedNumber value={p.score} className="text-footnote font-bold text-label-2" />
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState() {
  const openSetup = useUi((s) => s.openSetup);
  return (
    <Screen title="Radar" eyebrow="Radar Obiektów">
      <section className="flex flex-col items-center px-10 pt-10 text-center">
        <span
          aria-hidden
          className="squircle relative flex size-24 items-center justify-center rounded-[28px] text-white shadow-card"
          style={{ background: 'linear-gradient(160deg, #4be37a, #1fa84a)' }}
        >
          <RadarIcon size={48} strokeWidth={1.7} />
        </span>
        <h2 className="mt-6 text-title-2 font-bold">Radar czeka na trasę</h2>
        <p className="mt-2 text-subhead text-label-2">
          Pięć rzeczy do wypatrzenia za oknem — od krowy po legendarnego Malucha. Kto pierwszy zawoła, ten zgarnia punkty.
        </p>
        <Button className="mt-7 w-full" onClick={openSetup}>
          Nowa trasa
        </Button>
      </section>
    </Screen>
  );
}
