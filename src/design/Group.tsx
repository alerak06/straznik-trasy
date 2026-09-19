import type { ReactNode } from 'react';

/** iOS inset-grouped list section. */
export function Group({ header, footer, children }: { header?: ReactNode; footer?: ReactNode; children: ReactNode }) {
  return (
    <section className="px-[var(--gutter)] pb-6">
      {header && <h2 className="px-4 pb-1.5 text-footnote uppercase tracking-wide text-label-2">{header}</h2>}
      <div className="squircle overflow-hidden rounded-[var(--radius-md)] bg-surface shadow-card">{children}</div>
      {footer && <p className="px-4 pt-1.5 text-footnote text-label-2">{footer}</p>}
    </section>
  );
}

/** Row with a hairline separator inset past the leading icon. */
export function Row({ children, last }: { children: ReactNode; last?: boolean }) {
  return (
    <div className="relative flex min-h-11 items-center gap-3 px-4 py-2.5">
      {children}
      {!last && <span aria-hidden className="absolute bottom-0 left-[60px] right-0 h-px scale-y-50 bg-separator" />}
    </div>
  );
}
