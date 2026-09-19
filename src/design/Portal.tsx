import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Renders into the in-frame overlay layer so sheets stay inside the phone frame on desktop. */
export function Portal({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.getElementById('overlay-root')), []);
  return el ? createPortal(children, el) : null;
}
