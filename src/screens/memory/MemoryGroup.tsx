import { useState } from 'react';
import { Group, Row } from '../../design/Group';
import { ProgressRing } from '../../design/ProgressRing';
import { Sheet } from '../../design/Sheet';
import { Button } from '../../design/Button';
import { GAME_META, GAME_ORDER } from '../../game/content';
import { useMemory } from '../../game/memory';
import { useMemoryStats } from '../../game/selectors';
import type { GameId } from '../../game/types';
import { haptics } from '../../lib/haptics';
import { useUi } from '../../ui/uiStore';

/** Home overview: progress through every game's pool + reset-all. */
export function MemoryGroup() {
  const [confirm, setConfirm] = useState(false);
  const reset = useMemory((s) => s.reset);
  return (
    <>
      <Group
        header="Pamięć gier"
        footer={
          <span>
            Wykorzystane treści nie wracają, dopóki cała pula się nie skończy.{' '}
            <button type="button" onClick={() => setConfirm(true)} className="font-semibold text-red">
              Wyzeruj wszystko
            </button>
          </span>
        }
      >
        {GAME_ORDER.map((g, i) => (
          <MemoryRow key={g} game={g} last={i === GAME_ORDER.length - 1} />
        ))}
      </Group>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Wyzerować pamięć wszystkich gier?">
        <p className="pb-5 text-center text-subhead text-label-2">
          Wszystkie obiekty, tematy, historie i pytania znów będą „nowe”. Wyniki trasy zostają.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            variant="destructive"
            block
            onClick={() => {
              haptics.warning();
              reset('all');
              setConfirm(false);
              useUi.getState().showToast('Pamięć wszystkich gier wyzerowana.');
            }}
          >
            Wyzeruj wszystko
          </Button>
          <Button variant="gray" block onClick={() => setConfirm(false)}>
            Anuluj
          </Button>
        </div>
      </Sheet>
    </>
  );
}

function MemoryRow({ game, last }: { game: GameId; last: boolean }) {
  const stats = useMemoryStats(game);
  const meta = GAME_META[game];
  const open = useUi((s) => s.openMemory);
  return (
    <button
      type="button"
      onClick={() => {
        haptics.selection();
        open(game);
      }}
      className="block w-full text-left transition-colors duration-150 active:bg-fill-2"
    >
      <Row last={last}>
        <ProgressRing value={stats.pct} size={30} stroke={3.5} color={meta.tint} />
        <div className="min-w-0 flex-1">
          <div className="text-body">{meta.title}</div>
          <div className="truncate text-footnote text-label-2">
            {stats.used} z {stats.total} {meta.unit} · w tej trasie {stats.inTrip}
          </div>
        </div>
        <span className="tabular text-subhead font-semibold text-label-2">{stats.pctLabel}%</span>
      </Row>
    </button>
  );
}
