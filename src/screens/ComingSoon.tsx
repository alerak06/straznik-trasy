import type { LucideIcon } from 'lucide-react';
import { Group, Row } from '../design/Group';
import { Screen } from '../design/Screen';

interface ComingSoonProps {
  title: string;
  icon: LucideIcon;
  tint: string;
  pitch: string;
  steps: string[];
}

/** Consistent placeholder for games that are designed but not built yet. */
export function ComingSoon({ title, icon: Icon, tint, pitch, steps }: ComingSoonProps) {
  return (
    <Screen title={title}>
      <section className="flex flex-col items-center px-10 pb-8 pt-6 text-center">
        <span
          aria-hidden
          className="squircle flex size-20 items-center justify-center rounded-[22px] text-white shadow-card"
          style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${tint} 100%, white 18%), ${tint})` }}
        >
          <Icon size={40} strokeWidth={1.8} />
        </span>
        <span className="mt-5 rounded-full bg-fill-2 px-2.5 py-1 text-caption font-semibold text-label-2">W budowie</span>
        <p className="mt-3 text-body text-label-2">{pitch}</p>
      </section>
      <Group header="Jak to będzie działać">
        {steps.map((s, i) => (
          <Row key={s} last={i === steps.length - 1}>
            <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-fill-2 text-footnote font-semibold text-label-2">
              {i + 1}
            </span>
            <span className="text-subhead">{s}</span>
          </Row>
        ))}
      </Group>
    </Screen>
  );
}
