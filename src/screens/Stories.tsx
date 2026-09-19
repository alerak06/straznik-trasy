import { Ghost } from 'lucide-react';
import { ComingSoon } from './ComingSoon';

export function Stories() {
  return (
    <ComingSoon
      title="Czarne Historie"
      icon={Ghost}
      tint="var(--purple)"
      pitch="Mroczne zagadki. Mistrz Gry zna rozwiązanie, reszta zadaje pytania, na które odpowiada tylko „tak” albo „nie”."
      steps={[
        'Przesuwasz karty i wybierasz zagadkę',
        'Mistrz Gry czyta scenariusz na głos',
        'Rozwiązanie odsłania się tylko po przytrzymaniu — nikt nie podejrzy',
        'Kto rozwiąże, dostaje punkty',
      ]}
    />
  );
}
