import { motion } from 'motion/react';

/**
 * Polish EU-style registration plate. Only the district part is shown (the
 * letters the players decode); empty slots show a caret while typing.
 */
export function Plate({ letters, size = 'lg', typing = false }: { letters: string; size?: 'lg' | 'sm'; typing?: boolean }) {
  const lg = size === 'lg';
  const slots = [0, 1, 2];
  return (
    <div
      aria-label={`Tablica ${letters.split('').join(' ') || 'pusta'}`}
      className={`relative mx-auto flex items-stretch overflow-hidden bg-white text-black shadow-[0_8px_24px_-10px_rgb(0_0_0/0.6)] ${
        lg ? 'h-[92px] w-[300px] rounded-[12px] border-[3px]' : 'h-[46px] w-[150px] rounded-[7px] border-2'
      } border-black`}
    >
      <div className={`flex flex-col items-center justify-between bg-[#003399] text-white ${lg ? 'w-[44px] py-2' : 'w-[22px] py-1'}`}>
        <EuStars size={lg ? 26 : 13} />
        <span className={`font-bold leading-none ${lg ? 'text-[17px]' : 'text-[9px]'}`}>PL</span>
      </div>
      <div className={`flex flex-1 items-center justify-center ${lg ? 'gap-2' : 'gap-1'}`}>
        {slots.map((i) => {
          const ch = letters[i];
          const caret = typing && i === letters.length;
          return (
            <span
              key={i}
              className={`relative flex items-center justify-center font-bold ${lg ? 'h-[64px] w-[50px] text-[60px]' : 'h-[32px] w-[25px] text-[30px]'}`}
              style={{ fontFamily: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue", Arial, sans-serif', fontStretch: 'condensed' }}
            >
              {ch ? (
                <motion.span
                  key={ch + i}
                  initial={{ y: 8, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0.25 }}
                >
                  {ch}
                </motion.span>
              ) : (
                <span className={`absolute bottom-2 h-[3px] w-full rounded-full ${caret ? 'bg-black/60' : 'bg-black/15'}`} />
              )}
              {caret && <span className="caret absolute h-[56%] w-[3px] rounded-full bg-[#0a84ff]" />}
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes caret-blink { 0%, 45% { opacity: 1 } 50%, 100% { opacity: 0 } }
        .caret { animation: caret-blink 1s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) { .caret { animation: none; } }
      `}</style>
    </div>
  );
}

function EuStars({ size }: { size: number }) {
  const r = size * 0.36;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={size / 2 + Math.cos(a) * r} cy={size / 2 + Math.sin(a) * r} r={size * 0.045} fill="#ffcc00" />;
      })}
    </svg>
  );
}
