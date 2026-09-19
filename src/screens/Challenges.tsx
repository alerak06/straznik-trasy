import { Mic } from 'lucide-react';
import { ComingSoon } from './ComingSoon';

export function Challenges() {
  return (
    <ComingSoon
      title="Licznik Wyzwań"
      icon={Mic}
      tint="var(--orange)"
      pitch="Tryb bez rąk: ogromne litery czytelne z fotela kierowcy, pytania i szybkie wyzwania na głos."
      steps={[
        'Zgadnij piosenkę w radiu przed refrenem',
        'Pytania z wiedzy o Polsce i o trasie',
        'Odliczanie widoczne kątem oka',
        'Pasażer zalicza punkty jednym stuknięciem',
      ]}
    />
  );
}
