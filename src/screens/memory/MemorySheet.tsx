import { Brain, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AnimatedNumber } from '../../design/AnimatedNumber';
import { Button } from '../../design/Button';
import { ProgressRing } from '../../design/ProgressRing';
import { Sheet } from '../../design/Sheet';
import { GAME_META } from '../../game/content';
import { useMemory } from '../../game/memory';
import { useMemoryStats } from '../../game/selectors';
import type { GameId } from '../../game/types';
import { haptics } from '../../lib/haptics';
import { useUi } from '../../ui/uiStore';

/** Global sheet: how much of one game's pool is used, and the reset. */
export function MemorySheet() {
  const game = useUi((s) => s.memoryGame);
  const close = useUi((s) => s.closeMemory);
  const [last, setLast] = useState<GameId>('radar');
  useEffect(() => {
    if (game) setLast(game);
  }, [game]);

  return (
    <Sheet open={game !== null} onClose={close} title={GAME_META[last].title}>
      <MemoryDetail game={last} onReset={close} />
    </Sheet>
  );
}

function MemoryDetail({ game, onReset }: { game: GameId; onReset: () => void }) {
  const stats = useMemoryStats(game);
  const reset = useMemory((s) => s.reset);
  const meta = GAME_META[game];
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 3000);
    return () => window.clearTimeout(t);
  }, [armed]);

  return (
    <div className="flex flex-col items-center pb-2 text-center">
      <ProgressRing value={stats.pct} size={132} stroke={10} color={meta.tint}>
        <span className="flex flex-col items-center">
          <span className="tabular text-[34px] font-bold leading-none">
            {stats.pctLabel === '<1' ? '<1' : <AnimatedNumber value={stats.pct} />}%
          </span>
          <span className="mt-1 text-caption font-semibold uppercase tracking-wide text-label-2">wykorzystane</span>
        </span>
      </ProgressRing>

      <div className="mt-5 grid w-full grid-cols-3 gap-2">
        <Stat label="użyte" value={stats.used} />
        <Stat label="przed Wami" value={stats.left} />
        <Stat label="w tej trasie" value={stats.inTrip} />
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-[16px] bg-fill-2 px-3.5 py-3 text-left text-footnote text-label-2">
        <Brain size={18} className="mt-px shrink-0 text-label-2" aria-hidden />
        <span>
          Pamięć gry sprawia, że nic się nie powtarza — także na kolejnych trasach. W puli jest {stats.total} {meta.unit}.
          Gdy się skończy, wrócą te użyte najdawniej.
        </span>
      </p>

      <div className="mt-5 w-full">
        <Button
          variant="destructive"
          block
          disabled={stats.used === 0}
          icon={<RotateCcw size={18} />}
          onClick={() => {
            if (!armed) {
              haptics.warning();
              setArmed(true);
              return;
            }
            haptics.impact();
            reset(game);
            setArmed(false);
            onReset();
            useUi.getState().showToast(`Pamięć gry „${meta.title}” wyzerowana.`);
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={armed ? 'armed' : 'idle'}
              initial={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
              transition={{ duration: 0.18 }}
            >
              {armed ? 'Na pewno? Stuknij jeszcze raz' : 'Wyzeruj pamięć tej gry'}
            </motion.span>
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] bg-surface-2 px-2 py-3">
      <AnimatedNumber value={value} className="block text-title-3 font-bold" />
      <span className="text-caption text-label-2">{label}</span>
    </div>
  );
}
