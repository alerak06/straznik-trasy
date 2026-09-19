# Strażnik Trasy

Gry w podróży dla całego auta — mobile-first PWA z natywnym, iOS-owym wyglądem, przygotowana pod późniejsze opakowanie w Capacitor.

**Tryby gry**
- **Jeden telefon** (gotowe) — pasażer jest Mistrzem Gry i zaznacza punkty za wszystkich, kierowca gra na głos.
- **Kilka telefonów** (faza 2) — pokój z kodem, synchronizacja przez Hatchable realtime.

**Gry**: Radar Obiektów (gotowy prototyp), Sprawa Tablicy, Czarne Historie, Licznik Wyzwań (w budowie).

## Stack
Vite · React 19 · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) · Zustand · React Router (HashRouter) · vite-plugin-pwa

## Rozwój
```bash
npm install
npm run dev        # serwer deweloperski
npm run build      # typecheck + build do dist/
npm run preview    # podgląd builda na :4173
```

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
