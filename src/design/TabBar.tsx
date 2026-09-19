import { House, Mic, Radar, RectangleHorizontal, Ghost, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { haptics } from '../lib/haptics';

export interface TabDef {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const TABS: TabDef[] = [
  { path: '/', label: 'Start', icon: House },
  { path: '/tablice', label: 'Tablice', icon: RectangleHorizontal },
  { path: '/radar', label: 'Radar', icon: Radar },
  { path: '/historie', label: 'Historie', icon: Ghost },
  { path: '/wyzwania', label: 'Wyzwania', icon: Mic },
];

/**
 * Floating glass tab bar (iOS 26 style). The selection capsule is a shared
 * layout element, so it glides between tabs; tab switching itself is instant.
 */
export function TabBar({ active, onSelect }: { active: string; onSelect: (path: string) => void }) {
  return (
    <nav
      aria-label="Nawigacja"
      className="absolute inset-x-4 bottom-[max(var(--safe-bottom),12px)] z-30 h-[var(--tab-h)]"
    >
      <div className="material flex h-full items-stretch rounded-full border border-[var(--material-border)] p-1 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)]">
        {TABS.map((tab) => {
          const selected = tab.path === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={tab.label}
              onClick={() => {
                if (!selected) haptics.selection();
                onSelect(tab.path);
              }}
              className="group relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full"
            >
              {selected && (
                <motion.span
                  layoutId="tab-capsule"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.18 }}
                  className="absolute inset-0 rounded-full bg-fill-2"
                />
              )}
              <span
                className={`relative flex flex-col items-center gap-0.5 transition-[transform,color] duration-150 ease-[var(--ease-out)] group-active:scale-90 ${
                  selected ? 'text-accent' : 'text-label-2'
                }`}
              >
                <Icon size={22} strokeWidth={selected ? 2.2 : 1.8} aria-hidden />
                <span className="text-[10px] font-semibold leading-3 tracking-normal">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
