import { Brain, ChevronRight } from 'lucide-react';
import { ProgressRing } from '../../design/ProgressRing';
import { GAME_META } from '../../game/content';
import { useMemoryStats } from '../../game/selectors';
import type { GameId } from '../../game/types';
import { haptics } from '../../lib/haptics';
import { useUi } from '../../ui/uiStore';

/** Compact "how much of this game is used" row for the top of each game screen. */
export function MemoryChip({ game }: { game: GameId }) {
  const stats = useMemoryStats(game);
  const open = useUi((s) => s.openMemory);
  return (
    <div className="px-[var(--gutter)] pb-4">
      <button
        type="button"
        onClick={() => {
          haptics.selection();
          open(game);
        }}
        className="pressable flex h-11 w-full items-center gap-2.5 rounded-full bg-surface pl-1.5 pr-3 text-left shadow-card"
      >
        <ProgressRing value={stats.pct} size={32} stroke={3.5} color={GAME_META[game].tint}>
          <Brain size={14} className="text-label-2" aria-hidden />
        </ProgressRing>
        <span className="min-w-0 flex-1 truncate text-footnote">
          <span className="tabular font-semibold">{stats.pctLabel}% wykorzystane</span>
          <span className="text-label-2"> · w tej trasie {stats.inTrip}</span>
        </span>
        <ChevronRight size={16} className="text-label-3" aria-hidden />
      </button>
    </div>
  );
}
