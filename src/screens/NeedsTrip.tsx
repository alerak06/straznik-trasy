import type { LucideIcon } from 'lucide-react';
import { Button } from '../design/Button';
import { Screen } from '../design/Screen';
import { useUi } from '../ui/uiStore';

/** Shared empty state for games opened before a trip exists. */
export function NeedsTrip({ title, icon: Icon, gradient, heading, text }: { title: string; icon: LucideIcon; gradient: string; heading: string; text: string }) {
  const openSetup = useUi((s) => s.openSetup);
  return (
    <Screen title={title}>
      <section className="flex flex-col items-center px-10 pt-8 text-center">
        <span
          aria-hidden
          className="squircle flex size-24 items-center justify-center rounded-[28px] text-white shadow-card"
          style={{ background: gradient }}
        >
          <Icon size={48} strokeWidth={1.7} />
        </span>
        <h2 className="mt-6 text-title-2 font-bold">{heading}</h2>
        <p className="mt-2 text-subhead text-label-2">{text}</p>
        <Button className="mt-7 w-full" onClick={openSetup}>
          Nowa trasa
        </Button>
      </section>
    </Screen>
  );
}
