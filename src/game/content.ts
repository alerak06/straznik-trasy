import { Ghost, Mic, Radar, RectangleHorizontal, type LucideIcon } from 'lucide-react';
import { CHALLENGES } from './data/challenges';
import { PLATE_THEMES } from './data/plateThemes';
import { RADAR_OBJECTS } from './data/radarObjects';
import { STORIES } from './data/stories';
import type { GameId } from './types';

export interface GameMeta {
  id: GameId;
  title: string;
  path: string;
  icon: LucideIcon;
  tint: string;
  /** What one unit of content is called, in plural genitive: "56 z 150 obiektów". */
  unit: string;
  ids: ReadonlySet<string>;
}

const ids = (items: readonly { id: string }[]) => new Set(items.map((i) => i.id));

export const GAME_META: Record<GameId, GameMeta> = {
  radar: { id: 'radar', title: 'Radar Obiektów', path: '/radar', icon: Radar, tint: 'var(--green)', unit: 'obiektów', ids: ids(RADAR_OBJECTS) },
  plates: { id: 'plates', title: 'Sprawa Tablicy', path: '/tablice', icon: RectangleHorizontal, tint: 'var(--blue)', unit: 'tematów', ids: ids(PLATE_THEMES) },
  stories: { id: 'stories', title: 'Czarne Historie', path: '/historie', icon: Ghost, tint: 'var(--purple)', unit: 'historii', ids: ids(STORIES) },
  challenges: { id: 'challenges', title: 'Licznik Wyzwań', path: '/wyzwania', icon: Mic, tint: 'var(--orange)', unit: 'pytań i wyzwań', ids: ids(CHALLENGES) },
};

export const GAME_ORDER: GameId[] = ['radar', 'plates', 'stories', 'challenges'];
