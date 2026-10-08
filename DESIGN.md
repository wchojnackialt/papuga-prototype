# DESIGN.md — Papuga

## 1. Kontekst marki

Papuga to polska aplikacja do nauki języków, działająca od 2018 r. W 2025 r. przeszła rebranding na styl „naklejek w zeszycie”, żeby lepiej trafić do uczniów, którzy stanowią 55% użytkowników. Wygląda na dopracowany, pewny siebie produkt masowy, a nie na eksperyment.

Ta wersja to **stan as-is**. Grywalizacja (seria, XP, ligi, serca) ma być wszędzie widoczna i ładnie zrobiona. **Nie łagodź jej i nie naprawiaj wad produktu przez design.** Uczestnicy mają je znaleźć sami podczas audytu.

## 2. Zasady

1. **Naklejka na papierze.** Elementy interaktywne to „naklejki”: wypełnione kolorem, z konturem 2px w kolorze tuszu i twardym, przesuniętym cieniem. Tło to kremowy papier.
2. **Tusz zamiast szarości.** Kontury, tekst i cienie mają jeden kolor `ink`. Bez rozmytych cieni i bez szarych obramowań.
3. **Kolor = znaczenie.** Koral to akcja główna i postęp w kursie, lawenda to przejście dalej, limonka to sukces i ukończone, żółć to XP i nagrody.
4. **Nagradzaj głośno.** Każda ukończona lekcja to animacja, liczby i maskotka. To celowe (stan as-is).
5. **Kciuk i jedna ręka.** Ekran 390×844, główne akcje w dolnej części ekranu, cele dotykowe ≥ 44px.

## 3. Tokeny

### Kolory

| Token | Wartość | Użycie |
|---|---|---|
| `paper` | `#FFF6EC` | Tło aplikacji |
| `surface` | `#FFFFFF` | Karty, kafelki, pola |
| `ink` | `#2B2230` | Tekst, kontury, twarde cienie |
| `ink-muted` | `#6B5F70` | Tekst pomocniczy |
| `coral` | `#FF7A59` | Akcja główna, bieżąca lekcja, banner jednostki (tekst na nim: `ink`) |
| `coral-soft` | `#FFE3D9` | Tła komunikatów i nudge'y |
| `lavender` | `#6A58E8` | Przycisk „Dalej” / „Sprawdź” (tekst: biały) |
| `lavender-soft` | `#ECE9FF` | Zaznaczona odpowiedź, aktywna zakładka |
| `lime` | `#B8E986` | Ukończone lekcje, poprawna odpowiedź (tekst: `ink`) |
| `lime-ink` | `#3F7A12` | Tekst sukcesu |
| `lime-soft` | `#E9F8D8` | Tło arkusza „Dobrze!” |
| `sun` | `#FFD23F` | XP, nagrody, skrzynki (tekst: `ink`) |
| `flame` | `#FF8A1F` | Seria (ikona i liczba) |
| `heart` | `#E5484D` | Serca / limit błędów (tylko ikona, nie tekst) |
| `error-ink` | `#B3261E` | Tekst błędu |
| `error-soft` | `#FFE1DE` | Tło arkusza „Niepoprawnie” |
| `locked` | `#EFE6DA` | Zablokowane lekcje (kontur przerywany) |

Ligi: Brąz `#D9A273`, Srebro `#C9CED6`, Złoto `#FFD23F`, Szafir `#5AA9FF`, Diament `#B9F2FF`.

Kontrast: `lavender` jest przyciemniony względem moodboardu (`#7C6CF2` → `#6A58E8`), żeby biały tekst miał ≥ 4,5:1. Na kolorach `coral`, `lime` i `sun` tekst jest zawsze w kolorze `ink`.

### Typografia

| Rola | Krój | Rozmiar / interlinia | Waga |
|---|---|---|---|
| Display (ekran nagrody) | Young Serif | 32 / 38 | 400 |
| H1 | Young Serif | 24 / 30 | 400 |
| H2 (banner jednostki, tytuł ćwiczenia) | Young Serif | 20 / 26 | 400 |
| Body | DM Sans | 16 / 24 | 400 |
| Body bold / przyciski | DM Sans | 16 / 20 | 700 |
| Small | DM Sans | 14 / 20 | 400 |
| Etykieta (CAPS) | DM Sans | 11 / 14, spacja 0,06em | 700 |
| Liczby statystyk | Young Serif | 20 / 24 | 400 |

Teksty ćwiczeń (zdania do tłumaczenia, kafelki) zawsze w DM Sans, nie w szeryfie.

### Odstępy, promienie, kontury, cienie

- **Siatka 4px.** Skala: 4, 8, 12, 16, 20, 24, 32, 40. Margines ekranu 16px.
- **Promienie:** `r-sm` 10px (chipy, kafelki słów), `r-md` 14px (przyciski, karty), `r-lg` 20px (arkusze, modale), `r-node` 16px (węzły ścieżki, kwadrat z zaokrągleniem, nie koło).
- **Kontur:** zawsze `2px solid ink`. Zablokowane: `2px dashed ink`.
- **Cienie (twarde, bez rozmycia):** `shadow-lg` 4px 4px 0 ink (przyciski główne, banner), `shadow-md` 3px 3px 0 ink (węzły, karty), `shadow-sm` 2px 2px 0 ink (chipy, aktywna zakładka).
- **Stan wciśnięcia:** element przesuwa się o wartość cienia (`translate(4px,4px)`), a cień znika. To główny „feel” marki.

### Ruch

- Szybkie: 120 ms (wciśnięcie), standard: 200 ms (zmiana stanu), ekran: 280 ms (przejście). Easing `cubic-bezier(.2,.8,.2,1)`.
- Nagroda: liczby XP i serii „odliczają” w górę (600 ms), maskotka podskakuje, konfetti z naklejek (gwiazdki, serca) ok. 1,2 s.
- Respektuj `prefers-reduced-motion`: bez konfetti i podskoków, tylko zmiana stanu.

### Ikony i maskotka

- Ikony: [Phosphor Icons](https://phosphoricons.com/) w wariancie **Bold**, kolor `ink`; seria, XP i serca w kolorach z tabeli.
- Maskotka **Pola** (papuga): na etapie as-is zaślepka (emoji 🦜 albo prosta ilustracja SVG z konturem 2px). Stany: neutralna, cieszy się, smutna (po błędzie), „przypomina o serii”.

## 4. Układ

- Ramka telefonu 390×844, wyśrodkowana na desktopie, tło strony za ramką: `#2B2230`.
- **Górny pasek** (56px): flaga kursu · seria · XP · serca. Kontur dolny 2px `ink`.
- **Dolny pasek** (64px): Ścieżka · Liga · Zadania · Profil. **Miejsce na piątą zakładkę** jest zarezerwowane między Zadaniami a Profilem (w as-is pusta przestrzeń nie jest widoczna, układ jest gotowy na 5 elementów).
- Ekran lekcji przejmuje cały ekran: bez dolnego paska, z paskiem postępu i przyciskiem zamknięcia u góry.

## 5. Komponenty

| Komponent | Warianty / stany | Uwagi |
|---|---|---|
| `Button` | primary (`lavender`), action (`coral`), ghost (`surface`), disabled (`locked`, bez cienia) | Pełna szerokość w dolnej części ekranu; wciśnięcie = przesunięcie |
| `StatChip` | streak, xp, hearts, gems-off | Ikona + liczba; po kliknięciu otwiera szczegóły |
| `UnitBanner` | domyślny | `coral`, H2, etykieta „Jednostka X · Lekcja Y”, `shadow-lg` |
| `PathNode` | done (`lime`, gwiazdka), current (`coral`, ▶ + dymek START), locked (`locked`, przerywany), chest (`sun`, prezent) | Ułożone zygzakiem; 64px |
| `ExerciseShell` | — | Pasek postępu, ikona zamknięcia, serca, tytuł polecenia (H2), obszar odpowiedzi, przycisk „Sprawdź” |
| `ChoiceOption` | default, selected (`lavender-soft` + kontur `lavender`), correct, wrong | Pełna szerokość, 56px |
| `WordTile` | w banku, w odpowiedzi, użyty (pusty kontur) | DM Sans 16, `r-sm`, `shadow-sm` |
| `MatchCard` | default, selected, matched (wyszarzony), wrong (drganie 200 ms) | Dwie kolumny |
| `TextAnswer` | default, focus (kontur `lavender`), correct, wrong | Pole wieloliniowe |
| `FeedbackSheet` | correct (`lime-soft`, „Świetnie!”), wrong (`error-soft`, „Poprawna odpowiedź: …”) | Wjeżdża od dołu z przyciskiem „Dalej” |
| `RewardScreen` | — | Maskotka, Display, 3 karty statystyk (XP / seria / % poprawnych), nudge, CTA |
| `Nudge` | streak, league, plus | `coral-soft`, kontur, pogrubiony tekst |
| `Modal` | streak-risk, hearts-empty, paywall | `r-lg`, `shadow-lg`, przyciemnione tło `rgba(43,34,48,.6)` |
| `PlanCard` | monthly, annual (badge „Najpopularniejszy”), family | Paywall; wybrany plan = kontur 3px `lavender` |
| `LeagueRow` | default, me (`lavender-soft`), strefa awansu (zielona linia), strefa spadku (czerwona linia) | Avatar, imię, XP |
| `CalendarDay` | active (płomień), frozen (płatek śniegu), missed, today | Kalendarz serii |
| `DevPanel` | zamknięty / otwarty | Tylko dla prowadzącego: przełącznik person, data, dziennik zdarzeń; styl techniczny (monospace), poza światem marki |

## 6. Ton i mikroteksty

- Po polsku, na „ty”, krótko i z energią: „Świetnie!”, „Jeszcze jedna lekcja!”, „Twoja seria jest zagrożona 🔥”.
- Celowo (as-is): komunikaty o serii i lidze są natarczywe, a o umiejętnościach nie ma ani słowa. Nie dopisuj „czego się nauczyłeś”.
- Liczby zawsze z separatorem tysięcy spacją: „12 480 XP”.

## 7. Implementacja

Stack: React + TypeScript + Tailwind (zgodny z Lovable i Claude Code). Tokeny jako zmienne CSS, Tailwind tylko je mapuje.

```css
:root {
  --paper:#FFF6EC; --surface:#FFFFFF; --ink:#2B2230; --ink-muted:#6B5F70;
  --coral:#FF7A59; --coral-soft:#FFE3D9; --lavender:#6A58E8; --lavender-soft:#ECE9FF;
  --lime:#B8E986; --lime-ink:#3F7A12; --lime-soft:#E9F8D8; --sun:#FFD23F; --flame:#FF8A1F;
  --heart:#E5484D; --error-ink:#B3261E; --error-soft:#FFE1DE; --locked:#EFE6DA;
  --r-sm:10px; --r-md:14px; --r-lg:20px; --r-node:16px;
  --shadow-sm:2px 2px 0 var(--ink); --shadow-md:3px 3px 0 var(--ink); --shadow-lg:4px 4px 0 var(--ink);
  --font-head:'Young Serif', serif; --font-body:'DM Sans', sans-serif;
}
```

```js
// tailwind.config — theme.extend
colors: { paper:'var(--paper)', surface:'var(--surface)', ink:'var(--ink)', coral:'var(--coral)',
  lavender:'var(--lavender)', lime:'var(--lime)', sun:'var(--sun)', flame:'var(--flame)', heart:'var(--heart)', locked:'var(--locked)' },
borderRadius: { sm:'var(--r-sm)', md:'var(--r-md)', lg:'var(--r-lg)', node:'var(--r-node)' },
boxShadow: { 'st-sm':'var(--shadow-sm)', 'st-md':'var(--shadow-md)', 'st-lg':'var(--shadow-lg)' },
fontFamily: { head:['Young Serif','serif'], body:['DM Sans','sans-serif'] },
```

## 8. Ewolucja (dla nowych funkcji od tygodnia 3)

Nowe koncepty (np. „Moje materiały”, scenki, profil „umiem…”) mogą przesuwać styl w stronę **„czystej kartki z zeszytu”**: te same tokeny, ale mniej koloru, linia papieru w kratkę, cienie `shadow-sm` zamiast `shadow-lg`, brak konfetti. Dzięki temu nowa część aplikacji różni się od starej, a całość dalej wygląda jak jedna marka. To wskazówka, nie decyzja: kierunek wybierają zespoły uczestników.
