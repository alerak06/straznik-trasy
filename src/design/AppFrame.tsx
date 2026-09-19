import type { ReactNode } from 'react';

/**
 * Phone: full-bleed. ≥640px: a centered device-sized frame over a softly blurred
 * backdrop, so the app keeps its mobile layout on desktop.
 * Everything overlay-like portals into #overlay-root inside the frame.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-dvh w-full overflow-hidden sm:flex sm:items-center sm:justify-center sm:bg-[#07070a]">
      <Backdrop />
      <div
        id="app-frame"
        className="relative isolate h-full w-full overflow-hidden bg-bg sm:h-[min(852px,calc(100dvh-48px))] sm:w-[393px] sm:rounded-[55px] sm:shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_0_0_9px_#111,0_0_0_10px_rgb(255_255_255/0.12),0_40px_120px_-20px_rgb(0_0_0/0.9)]"
      >
        {children}
        <div id="overlay-root" className="pointer-events-none absolute inset-0 z-50" />
      </div>
    </div>
  );
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
      <div className="absolute -left-[10%] top-[8%] size-[46vmax] rounded-full bg-[#ffb300] opacity-[0.16] blur-[120px]" />
      <div className="absolute -right-[12%] bottom-[-6%] size-[52vmax] rounded-full bg-[#0a84ff] opacity-[0.14] blur-[140px]" />
      <div className="absolute left-[40%] top-[55%] size-[30vmax] rounded-full bg-[#bf5af2] opacity-[0.08] blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(0_0_0/0.55))]" />
    </div>
  );
}
