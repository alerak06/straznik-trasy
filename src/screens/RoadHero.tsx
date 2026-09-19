/**
 * Dusk road illustration. The centre line drifts toward the viewer (CSS, off the
 * main thread); reduced-motion users get a still frame.
 */
export function RoadHero() {
  return (
    <div className="relative h-[176px] overflow-hidden" aria-hidden>
      <style>{`
        @keyframes road-dash { to { stroke-dashoffset: -64; } }
        .road-line { animation: road-dash 1.1s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .road-line { animation: none; } }
      `}</style>
      <svg viewBox="0 0 360 176" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b1f3b" />
            <stop offset="0.62" stopColor="#6b3a5e" />
            <stop offset="1" stopColor="#f2994a" />
          </linearGradient>
          <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2a2e" />
            <stop offset="1" stopColor="#141416" />
          </linearGradient>
          <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffd98a" />
            <stop offset="1" stopColor="#ffb300" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="360" height="176" fill="url(#sky)" />
        <circle cx="250" cy="96" r="54" fill="url(#sun)" opacity="0.8" />
        <circle cx="250" cy="96" r="17" fill="#ffe2a3" />
        <path d="M0 104 C60 84 110 92 160 100 S260 86 360 98 V176 H0Z" fill="#3b2447" opacity="0.9" />
        <path d="M0 118 C80 104 140 112 200 114 S300 104 360 112 V176 H0Z" fill="#241a33" />
        <path d="M168 112 L192 112 L312 176 L48 176 Z" fill="url(#road)" />
        <path d="M168 112 L48 176" stroke="#ffc21a" strokeOpacity="0.5" strokeWidth="1.5" />
        <path d="M192 112 L312 176" stroke="#ffc21a" strokeOpacity="0.5" strokeWidth="1.5" />
        <path className="road-line" d="M180 112 L180 176" stroke="#ffc21a" strokeWidth="3" strokeDasharray="14 18" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-surface" />
    </div>
  );
}
