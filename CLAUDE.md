# Papuga — prototyp as-is

Klikalny prototyp **obecnej** wersji Papugi, polskiej aplikacji do nauki języków opartej na grywalizacji (seria, XP, ligi, serca). Służy do case study Supercharge 3: w tygodniu 1 uczestnicy robią audyt produktu, od tygodnia 3 dokładają nowe koncepty do tego kodu, w tygodniu 6 pokazują porównanie przed/po. Marka, firma, osoby i liczby są fikcyjne.

- Wymagania: [PRD.md](PRD.md). Wygląd: [DESIGN.md](DESIGN.md). Oba są źródłem prawdy; przy konflikcie pytaj.
- To nie jest produkcja: bez backendu, logowania, płatności i kluczy API.

## Najważniejsza zasada: nie naprawiaj wad as-is

Prototyp celowo odwzorowuje wady produktu (PRD §3). Nie łagodź ich, nie dopisuj „czego się nauczyłeś”, nie personalizuj ścieżki według celu z onboardingu, nie dodawaj treści szkolnej, widoku rodzica ani informacji o umiejętnościach. Grywalizacja ma być głośna i dopracowana. Jeśli zmiana usuwałaby którąś z wad, zatrzymaj się i zapytaj.

## Stack i komendy

Vite + React + TypeScript + Tailwind 3 + Phosphor Icons (Bold) + Zustand + Zod + Vitest.

- `npm run dev` — serwer deweloperski
- `npm run build` — typecheck + build
- `npm test` — testy (Vitest)
- `npm run lint` — oxlint
- `npm run validate` — kontrola treści ćwiczeń; `npm run content:review` — arkusz przeglądu treści

Panel prowadzącego: `Shift + D` (`src/dev/DevPanel.tsx`). Zmiana symulowanego czasu = otwarcie aplikacji o tej porze.

## Zasady w kodzie

- **Tokeny:** kolory, promienie i cienie tylko z `src/index.css` (`:root`) przez klasy Tailwinda (`bg-coral`, `rounded-md`, `shadow-st-lg`). Bez wartości hex w komponentach (wyjątek: kolory lig w `tailwind.config.js`).
- **Naklejka:** element interaktywny = `sticker` (kontur 2px ink) + `press-lg|md|sm` (twardy cień, wciśnięcie przesuwa element). Bez rozmytych cieni i szarych obramowań.
- **Treść w danych:** teksty ćwiczeń, kurs, persony i liga w `src/data/*.json`. Komponenty nie zawierają treści na sztywno.
- **Czas:** każda logika daty i godziny bierze czas z `engine/clock` (symulowany zegar z panelu prowadzącego), nigdy z `Date.now()` ani `new Date()`.
- **Reguły gry:** czyste funkcje w `engine/rules.ts` z testami. Ekrany tylko je wywołują.
- **Zdarzenia:** każda akcja z PRD §6.5 przez `track(name, props)`.
- **UI po polsku**, na „ty”; liczby z separatorem tysięcy spacją (`formatNumber`).
- **Dostępność:** cele dotykowe ≥ 44px, kontrast ≥ 4,5:1, obsługa klawiatury w ćwiczeniach, `prefers-reduced-motion`.

## Punkty rozbudowy (PRD §7)

| Punkt | Plik |
|---|---|
| Nowa zakładka | `src/config/nav.config.ts` |
| Nowy typ ćwiczenia | `src/exercises/registry.ts` |
| Źródło ćwiczeń | `src/engine/getExercises.ts` (pole `source`) |
| Slot w profilu | `src/config/profileSlot.config.ts` |
| Persony | `src/data/personas/*.json` |

## Struktura

```
src/
  app/         PhoneFrame, TopBar, BottomNav, routing
  components/  komponenty z DESIGN.md §5
  config/      nawigacja, slot profilu
  data/        course.json, exercises.json, league.json, personas/
  engine/      clock, store, rules, track, getExercises, format
  exercises/   rejestr i komponenty typów ćwiczeń
  screens/     ekrany z PRD §4
  dev/         panel prowadzącego (Shift + D)
```
