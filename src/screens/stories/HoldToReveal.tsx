import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { haptics } from '../../lib/haptics';

/**
 * Secret text that only sharpens while pressed — the Game Master peeks with the
 * phone tilted away, release hides it again instantly. `revealed` shows it to all.
 */
export function HoldToReveal({ label, text, revealed }: { label: string; text: string; revealed: boolean }) {
  const [held, setHeld] = useState(false);
  const visible = held || revealed;
  const down = () => {
    if (revealed) return;
    haptics.selection();
    setHeld(true);
  };
  const up = () => setHeld(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={revealed ? label : `${label}. Przytrzymaj, aby podejrzeć.`}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      onKeyDown={(e) => e.key === ' ' && down()}
      onKeyUp={up}
      onContextMenu={(e) => e.preventDefault()}
      className="squircle relative touch-none select-none overflow-hidden rounded-[var(--radius-md)] bg-surface-2 p-4"
    >
      <div className="mb-2 flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-purple">
        {visible ? <Eye size={14} /> : <EyeOff size={14} />}
        {label}
      </div>
      <p
        className="text-body"
        style={{
          filter: visible ? 'blur(0px)' : 'blur(9px)',
          opacity: visible ? 1 : 0.55,
          // Deliberate reveal, instant hide.
          transition: visible ? 'filter 180ms cubic-bezier(0.23,1,0.32,1), opacity 180ms' : 'filter 80ms linear, opacity 80ms linear',
        }}
        aria-hidden={!visible}
      >
        {text}
      </p>
      {!visible && (
        <span className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-footnote font-semibold text-label">
          Przytrzymaj — tylko Mistrz Gry
        </span>
      )}
    </div>
  );
}
