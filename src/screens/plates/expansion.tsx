/** Folds Polish diacritics so „Łódź” counts for L and „Źrebię” for Z. */
export function foldLetter(ch: string) {
  const lower = ch.toLowerCase() === 'ł' ? 'l' : ch;
  return lower
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();
}

const words = (text: string) => text.trim().split(/\s+/).filter((w) => /\p{L}/u.test(w));

/** True when the expansion has exactly one word per plate letter, in order. */
export function matchesPlate(text: string, letters: string) {
  const ws = words(text);
  if (ws.length !== letters.length) return false;
  return ws.every((w, i) => {
    const first = w.match(/\p{L}/u)?.[0] ?? '';
    return foldLetter(first) === letters[i];
  });
}

export const patternFor = (letters: string) => letters.split('').map((l) => `${l}…`).join(' ');

/** Renders an expansion with each word's initial set in the accent colour. */
export function Expansion({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.trim().split(/(\s+)/);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (/^\s+$/.test(part) || !part) return part;
        const idx = part.search(/\p{L}/u);
        if (idx < 0) return <span key={i}>{part}</span>;
        return (
          <span key={i}>
            {part.slice(0, idx)}
            <span className="font-black text-accent">{part[idx]}</span>
            {part.slice(idx + 1)}
          </span>
        );
      })}
    </span>
  );
}
