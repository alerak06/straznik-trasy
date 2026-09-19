import { Delete } from 'lucide-react';
import { haptics } from '../../lib/haptics';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

/**
 * Oversized native-style keyboard. Pressing shows the iOS key bubble (pure CSS
 * :active, so it costs nothing and never lags behind the finger).
 */
export function PlateKeyboard({ onKey, onDelete, disabled }: { onKey: (ch: string) => void; onDelete: () => void; disabled: boolean }) {
  return (
    <div className="select-none rounded-[26px] bg-surface p-2 pt-3 shadow-card" role="group" aria-label="Klawiatura liter">
      {ROWS.map((row, r) => (
        <div key={row} className="mb-2 flex justify-center gap-[5px] last:mb-0">
          {row.split('').map((ch) => (
            <Key key={ch} label={ch} disabled={disabled} onPress={() => onKey(ch)} />
          ))}
          {r === ROWS.length - 1 && (
            <button
              type="button"
              aria-label="Usuń literę"
              onClick={() => {
                haptics.selection();
                onDelete();
              }}
              className="flex h-[50px] w-[52px] items-center justify-center rounded-[10px] bg-surface-3 text-label shadow-[0_1px_0_rgb(0_0_0/0.35)] active:bg-fill"
            >
              <Delete size={22} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function Key({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        haptics.selection();
        onPress();
      }}
      className="group relative flex h-[50px] min-w-0 flex-1 basis-0 items-center justify-center rounded-[10px] bg-surface-2 text-[22px] font-medium text-label shadow-[0_1px_0_rgb(0_0_0/0.35)] disabled:opacity-40"
      style={{ maxWidth: 34 }}
    >
      {label}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-[calc(100%-6px)] left-1/2 z-10 flex h-[58px] w-[48px] -translate-x-1/2 items-center justify-center rounded-[12px] bg-surface-3 text-[34px] font-medium opacity-0 shadow-[0_6px_18px_rgb(0_0_0/0.45)] group-active:opacity-100 group-disabled:hidden"
      >
        {label}
      </span>
    </button>
  );
}
