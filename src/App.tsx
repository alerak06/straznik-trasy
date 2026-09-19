import { MotionConfig } from 'motion/react';
import { useEffect, useState, type ComponentType } from 'react';
import { HashRouter, useLocation, useNavigate } from 'react-router';
import { AppFrame } from './design/AppFrame';
import { TabBar, TABS } from './design/TabBar';
import { useTrip } from './game/selectors';
import { enableWakeLock } from './lib/wakeLock';
import { Challenges } from './screens/Challenges';
import { Home } from './screens/Home';
import { Plates } from './screens/Plates';
import { Radar } from './screens/radar/Radar';
import { Stories } from './screens/Stories';
import { TripSetup } from './screens/TripSetup';

const SCREENS: Record<string, ComponentType> = {
  '/': Home,
  '/tablice': Plates,
  '/radar': Radar,
  '/historie': Stories,
  '/wyzwania': Challenges,
};

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <AppFrame>
          <Shell />
        </AppFrame>
      </HashRouter>
    </MotionConfig>
  );
}

/**
 * Tabs behave like a native UITabBarController: each tab mounts on first visit and
 * stays mounted (scroll position and state survive), switching is instant.
 */
function Shell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = TABS.some((t) => t.path === pathname) ? pathname : '/';
  const [visited, setVisited] = useState<string[]>([active]);
  const trip = useTrip();

  useEffect(() => {
    if (pathname !== active) navigate(active, { replace: true });
    setVisited((v) => (v.includes(active) ? v : [...v, active]));
  }, [active, pathname, navigate]);

  useEffect(() => (trip ? enableWakeLock() : undefined), [trip]);

  return (
    <>
      {TABS.filter((t) => visited.includes(t.path)).map((t) => {
        const Screen = SCREENS[t.path];
        return (
          <div key={t.path} className="absolute inset-0" hidden={t.path !== active}>
            <Screen />
          </div>
        );
      })}
      <TabBar active={active} onSelect={(p) => navigate(p)} />
      <TripSetup />
    </>
  );
}
