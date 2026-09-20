# Strażnik Trasy

Gry w podróży dla całego auta — mobile-first PWA z natywnym, iOS-owym wyglądem, przygotowana pod późniejsze opakowanie w Capacitor.

**Tryby gry**
- **Jeden telefon** (gotowe) — pasażer jest Mistrzem Gry i zaznacza punkty za wszystkich, kierowca gra na głos.
- **Kilka telefonów** (faza 2) — pokój z kodem, synchronizacja przez Hatchable realtime.

**Gry** (wszystkie grywalne):
- **Radar Obiektów** — 260 obiektów (plansza 5 + złoty ×2, bingo). 37 plansz bez powtórki.
- **Sprawa Tablicy** — 322 tematy; tablica PL, duża klawiatura, propozycje, głosowanie.
- **Czarne Historie** — 198 zagadek; talia do przesuwania, podpowiedź, rozwiązanie po przytrzymaniu.
- **Licznik Wyzwań** — 1143 pozycje (627 pytań, 148 przysłów, 107 zagadek, 261 wyzwań); czytanie na głos, odliczanie.

Razem 1923 pozycje treści.

**Pamięć gier** — każde urządzenie pamięta, co już było (`src/game/memory.ts`). Losowanie bierze tylko
nieużyte treści, a po wyczerpaniu puli wraca do najdawniej użytych. Na Starcie i w każdej grze widać
% wykorzystania i ile w tej trasie; pamięć można wyzerować per gra albo całą.

## Stack
Vite · React 19 · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) · Zustand · React Router (HashRouter) · vite-plugin-pwa

## Rozwój
```bash
npm install
npm run dev        # serwer deweloperski
npm run build      # typecheck + build do dist/
npm run preview    # podgląd builda na :4173
```

## Treści
Pliki w `src/game/data/`. **Dopisuj tylko na końcu list** — id wynikają z pozycji, a pamięć gier jest
po nich indeksowana (wstawienie w środek „odświeżyłoby” część treści u użytkowników).

## Architektura
- `src/game/reducer.ts` — czysty, deterministyczny reducer akcji (id, czas, seed przychodzą w akcji). W trybie pokoju ten sam reducer pobiegnie na serwerze.
- `src/game/transport.ts` — `LocalTransport` (teraz) / `RoomTransport` (faza 2).
- `src/game/store.ts` — stan w Zustand + `persist`; action creators w `game.*`.
- Punkty to rejestr wpisów (`ledger`) — sumy liczone, cofnięcie usuwa wpis.
- `src/design/` — prymitywy UI (Screen z dużym tytułem, szklany TabBar, Sheet z gestem, Button…).
- `src/lib/haptics.ts` — jedno miejsce do podmiany na `@capacitor/haptics`.

## Deploy (Hatchable)
Hatchable nie ma kroku build, więc budujemy lokalnie i commitujemy `dist/`. Potem
`node scripts/hatchable-files.mjs` wypisuje surowe URL-e plików do `import_file_from_url` (dist/* → public/*) i deploy.
