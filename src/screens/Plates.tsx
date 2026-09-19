import { RectangleHorizontal } from 'lucide-react';
import { ComingSoon } from './ComingSoon';

export function Plates() {
  return (
    <ComingSoon
      title="Sprawa Tablicy"
      icon={RectangleHorizontal}
      tint="var(--blue)"
      pitch="Widzisz tablicę „KRA 4T21”? Z liter KRA ułóżcie najzabawniejsze zdanie. Najlepsze wygrywa w głosowaniu."
      steps={[
        'Wpisujesz 3 litery z tablicy na dużej klawiaturze',
        'Każdy wymyśla rozwinięcie — na głos albo na swoim telefonie',
        'Głosowanie na najśmieszniejsze zdanie',
        'Zwycięzca zgarnia punkty do rankingu trasy',
      ]}
    />
  );
}
