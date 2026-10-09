# QA prototypu as-is

Stan na 9.10.2026, commit z etapem 7. Lista według PRD §10.

## Definicja gotowości (PRD §10)

| Punkt | Stan | Jak sprawdzone |
|---|---|---|
| Wszystkie ekrany M działają na 2 personach (Kuba, Zosia) i na nowym użytkowniku | ✅ | Przejście w przeglądarce (dev i build produkcyjny): onboarding, ścieżka, lekcja, koniec lekcji, skrzynka, reklama, liga, seria, zadania, profil, paywall, panel prowadzącego |
| 4 grywalne lekcje, każda z pulą 14–16 ćwiczeń | ✅ | `npm run validate` (po 15 ćwiczeń, wszystkie 4 typy) |
| Reguły gry z sekcji 5 działają (XP, serca, seria, liga) | ✅ | 49 testów (`npm test`) + przejście w przeglądarce |
| Panel prowadzącego: przełącznik person, data/godzina, reset, dziennik | ✅ | Kuba „Pojutrze” → `streak_broken`, serca 5; Zosia „Jutro” → zamrożenie; reset wszystkiego |
| Wszystkie wady z sekcji 3 są obecne i nienaprawione | ✅ | Tabela niżej |
| Wygląd zgodny z DESIGN.md | ✅ | Tokeny tylko z `:root`; dodane: `ice`, `ice-ink` (zamrożenie w kalendarzu) |
| Repozytorium z README, DESIGN.md, PRD.md, CLAUDE.md; stały link do wersji as-is | 🟡 | Dokumenty są. Stały link czeka na GitHub i deploy |
| Test: osoba spoza zespołu przechodzi onboarding i lekcję bez pomocy | ⏳ | Do zrobienia przez zespół |

Poza listą: **treść ćwiczeń czeka na ręczny przegląd** (`docs/tresc-cwiczen.md`).

## Wady as-is (PRD §3)

| Wada | Gdzie widać | Stan |
|---|---|---|
| Aplikacja pyta o cel i go ignoruje | Onboarding zapisuje cel (`onboarding_completed`), ścieżka zawsze od U1-L1 | ✅ obecna |
| Sztywny program bez związku ze szkołą | Jednostki „Podstawy”, „W kawiarni”, „W podróży”; walidator blokuje słowa szkolne | ✅ obecna |
| Monotonia: tylko 4 typy ćwiczeń | L3/L4 powtarzają zadania z L1/L2 | ✅ obecna |
| Nagroda za wysiłek, nie za umiejętność | Koniec lekcji (XP, seria, %), odznaki za serię i XP, profil bez umiejętności | ✅ obecna |
| Seria jako obowiązek | Modal po 18:00, nudge'e, kalendarz z pominiętymi dniami, zamrożenie za paywallem | ✅ obecna |
| Rodzic płaci, ale nic nie widzi | Plan rodzinny (`payer: parent`), brak widoku rodzica | ✅ obecna |

## Dostępność

**Kontrast (WCAG AA).** Policzony dla wszystkich par kolorów z tokenów:

- tekst: wszystkie pary ≥ 4,5:1 (najniższe: `lime-ink` na `lime-soft` 4,72; `ink-muted` na `locked` 4,86; biały na `lavender` 5,03);
- ikony: płomień, XP i puste serca miały 1,3–2,2:1 na papierze → dodany kontur tuszu (`.icon-ink`), zgodny ze stylem naklejek;
- reklama: dół gradientu przyciemniony (biały tekst 2,77 → ≥ 4,5:1).

**Klawiatura.**

- Ćwiczenia: wybór tłumaczenia 1–4 + Enter, tłumaczenie do wpisania Enter, kafelki i pary przez Tab + Enter/Spacja, arkusz wyniku Enter.
- Modale: fokus w oknie, Tab krąży po przyciskach okna, Esc zamyka, fokus wraca na poprzedni element.
- Widoczny fokus (`focus-visible`, kontur lavender) na wszystkich elementach interaktywnych.

**Ruch.** `prefers-reduced-motion`: bez konfetti, bez odliczania liczb (od razu wartość końcowa), animacje CSS skrócone do zera. Sprawdzone w kodzie, nie w emulacji.

**Inne.** Cele dotykowe ≥ 44 px, `lang="en"` na tekstach angielskich, etykiety ARIA na węzłach ścieżki i statystykach.

## Ekran

- Desktop: ramka 390×844 (niższa, gdy okno jest niższe), panel prowadzącego po prawej.
- Telefon (< 640 px): pełny ekran, bez przewijania w poziomie; przycisk DEV ukryty (panel tylko z klawiatury).

## Znane ograniczenia

- Boty w lidze mają stałe XP w tygodniu; ranking zmienia się tylko od XP użytkownika.
- Skrzynka w zadaniach dnia jest tylko oznaczeniem (bez dodatkowego XP).
- Stan jest w `localStorage` przeglądarki: każdy uczestnik ma własny.
