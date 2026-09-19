import type { Player } from '../game/types';

/** Emoji avatar on the player's color. Size in px. */
export function Avatar({ player, size = 36 }: { player: Pick<Player, 'emoji' | 'color'>; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.56,
        background: `color-mix(in srgb, ${player.color} 26%, transparent)`,
        boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${player.color} 70%, transparent)`,
      }}
    >
      {player.emoji}
    </span>
  );
}
