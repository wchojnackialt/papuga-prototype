# PRD — Papuga (prototyp as-is)

## 1. Cel

Klikalny prototyp **obecnej** wersji aplikacji Papuga, na którym uczestnicy Supercharge 3:

1. w tygodniu 1 robią audyt i znajdują problemy produktu;
2. od tygodnia 3 dokładają nowe koncepty do tego samego kodu;
3. w tygodniu 6 pokazują porównanie przed/po na tych samych personach.

**To nie jest produkcja.** Brak backendu, logowania i płatności. Prototyp ma być wiarygodny w oglądaniu i łatwy do rozbudowy z pomocą AI.

**Termin:** gotowy do 16.10.2026 (program startuje 20.10.2026).

## 2. Użytkownicy prototypu

| Kto | Czego potrzebuje |
|---|---|
| Prowadzący | Pokazać stany aplikacji (persony) w kilka sekund (przełącznik person), pokazać zdarzenia (dziennik) |
| Uczestnicy | Przeklikać aplikację jak prawdziwy użytkownik; sforkować repozytorium i dodać własny koncept bez przepisywania całości |

## 3. Zasada as-is

Prototyp odwzorowuje produkt z jego wadami. Te wady są **celowe** i nie wolno ich naprawiać przy budowie:

| Wada | Gdzie widać |
|---|---|
| Aplikacja pyta o cel nauki i go ignoruje | Onboarding → ta sama ścieżka dla każdego |
| Sztywny program bez związku ze szkołą | Ścieżka kursu, tematy jednostek |
| Monotonia: tylko 4 typy ćwiczeń | Lekcja |
| Nagroda za wysiłek, nie za umiejętność | Koniec lekcji, liga, profil |
| Seria jako obowiązek | Modal i nudge'y o serii, kalendarz serii |
| Rodzic płaci, ale nic nie widzi | Paywall (plan rodzinny), brak widoku rodzica |

## 4. Ekrany i wymagania

Priorytety: **M** = musi być na 20.10, **S** = powinno, **C** = jeśli starczy czasu.

### 4.1 Onboarding (M)

- Kroki: wybór języka (aktywny tylko angielski, reszta „wkrótce”) → „Po co się uczysz?” (Szkoła / Sprawdzian lub egzamin / Praca / Podróże / Dla siebie) → wiek (przedziały: do 12, 13–15, 16–19, 20+) → cel dzienny (5 / 10 / 15 / 20 min) → „Zaczynamy!”.
- Odpowiedzi zapisują się w stanie użytkownika i trafiają do dziennika zdarzeń (`onboarding_completed`), ale **nie zmieniają** ścieżki kursu.
- Akceptacja: po onboardingu użytkownik trafia na ścieżkę z Jednostką 1, Lekcja 1 jako bieżąca.

### 4.2 Ścieżka kursu (M)

- Górny pasek: kurs, seria, XP, serca. Banner bieżącej jednostki. Węzły lekcji zygzakiem w stanach: ukończona, bieżąca (z dymkiem START), zablokowana, skrzynka.
- 3 jednostki po 5 węzłów (4 lekcje + skrzynka). Grywalne lekcje (z własną treścią): U1-L1, U1-L2, U2-L1, U2-L2. Lekcje L3 i L4 w U1 i U2 nie mają własnej treści: gdy staną się bieżące, losują zadania z puli L1 i L2 tej samej jednostki (powtarzalność treści jest zgodna z wadą „monotonia”). Ukończone węzły po kliknięciu pozwalają powtórzyć lekcję. U3 pozostaje zablokowana.
- Skrzynka: gdy jest bieżąca, kliknięcie otwiera krótki ekran nagrody (+XP, maskotka), po którym węzeł przechodzi w stan ukończony, a bieżącym staje się następny węzeł.
- Kliknięcie zablokowanego węzła: dymek „Ukończ poprzednie lekcje, żeby odblokować”.
- Akceptacja: bieżąca lekcja otwiera ekran lekcji; po ukończeniu następny węzeł staje się bieżący.

### 4.3 Lekcja (M)

- 10 zadań losowanych z puli lekcji, w 4 typach (patrz 6.2). Pasek postępu, przycisk zamknięcia (z potwierdzeniem „Stracisz postęp w tej lekcji”).
- „Sprawdź” → arkusz z wynikiem. Błąd: −1 serce (w planie darmowym), poprawna odpowiedź widoczna w arkuszu, zadanie wraca na koniec kolejki.
- 0 serc w planie darmowym → modal „Skończyły Ci się serca” z wyborem: Papuga Plus (paywall) / „Poczekaj 4 godziny” (zamyka lekcję).
- Akceptacja: lekcję można przejść bez błędów i z błędami; serca maleją tylko w planie darmowym.

### 4.4 Koniec lekcji (M)

- Maskotka, „Lekcja ukończona!”, trzy karty: +XP, dni serii, % poprawnych. Animacja odliczania.
- Nudge pod kartami (jeden, losowany): ryzyko serii, odległość do awansu w lidze, zadanie dnia.
- Plan darmowy: po „Dalej” pełnoekranowa reklama z przyciskiem zamknięcia po 5 s.
- Akceptacja: XP i seria aktualizują się w górnym pasku po powrocie na ścieżkę.

### 4.5 Liga (M)

- Ranking tygodniowy 30 osób (fikcyjne imiona i avatary), moja pozycja wyróżniona, strefa awansu (top 7) i spadku (ostatnie 5), licznik „do końca tygodnia: X dni” liczony z symulowanego zegara (tydzień pon–niedz.; np. 20.10.2026, wtorek → 5 dni).
- XP z lekcji przesuwa mnie w rankingu.

### 4.6 Seria (M)

- Kalendarz miesiąca: dni aktywne, zamrożone, pominięte. Rekord serii.
- „Zamrożenie serii”: dostępne tylko w Papuga Plus (w darmowym kliknięcie otwiera paywall).
- Zerwanie serii liczone przy otwarciu aplikacji (`app_opened`) z `lastActiveDate` i symulowanego zegara: jeśli od ostatniej aktywności minął co najmniej jeden pełny dzień bez lekcji i bez zamrożenia, seria spada do 0 i zapisuje się `streak_broken` (z `current` sprzed zerwania).
- Modal „Twoja seria jest zagrożona!” przy otwarciu aplikacji, jeśli dziś nie ma jeszcze lekcji, a symulowana godzina to po 18:00 (S).

### 4.7 Zadania dnia (S)

- 3 zadania: „Zdobądź 30 XP”, „Ukończ 2 lekcje”, „Zrób lekcję bez błędów”. Paski postępu, nagroda: skrzynka.

### 4.8 Profil (M)

- Imię, avatar, data dołączenia, łączne XP, najdłuższa seria, liga, odznaki (6, część zablokowanych).
- **Sekcja-slot** pod statystykami, w as-is pusta. Od tygodnia 3 trafi tu widok „umiem…”.
- Brak jakiejkolwiek informacji o umiejętnościach (celowo).

### 4.9 Paywall Papuga Plus (M)

- Wyzwalacze: brak serc, zamrożenie serii, baner na profilu.
- Korzyści: bez reklam, nielimitowane serca, zamrożenie serii, „powtórka błędów”.
- Plany: miesięczny 29,99 zł, roczny 199 zł (badge „Najpopularniejszy”, „16,58 zł/mies.”), rodzinny 299 zł/rok do 6 kont.
- „Wypróbuj 7 dni za darmo” zmienia plan w stanie na Plus (bez płatności) i zapisuje zdarzenie.

### 4.10 Panel prowadzącego (M)

- Ukryty, otwierany skrótem (`Shift + D`) lub ikoną w rogu poza ramką telefonu.
- Przełącznik person (6.1), ustawienie symulowanej daty i godziny (domyślnie 20.10.2026, 10:00, dzień startu programu), reset stanu, podgląd dziennika zdarzeń na żywo (ostatnie 50, z możliwością eksportu do JSON).

## 5. Reguły gry

| Reguła | Wartość |
|---|---|
| XP za lekcję | 10 + 5 bez błędów |
| Serca (plan darmowy) | 5; −1 za błąd; odnowienie: „po 4 h” (symulowane w panelu) |
| Seria | +1, gdy w danym dniu ukończono ≥ 1 lekcję; zerwana, gdy dzień minie bez lekcji i bez zamrożenia |
| Zamrożenie serii | Tylko Plus; 1 na tydzień |
| Liga | 30 osób, tydzień pon–niedz., awans top 7, spadek ostatnie 5 |
| Cel dzienny | Zapisany, wyświetlany jako pasek postępu w Zadaniach; nie wpływa na nic innego |

## 6. Dane

Cała treść i stan to JSON. Komponenty nie zawierają treści na sztywno.

### 6.1 Persony demo

| Persona                     | Segment  | Plan                        | Stan                                                                      |
| --------------------------- | -------- | --------------------------- | ------------------------------------------------------------------------- |
| **Kuba**, 13 lat, 7 klasa   | Uczeń SP | Darmowy                     | Seria 3 dni, 2 serca, cel: „Sprawdzian”                                   |
| **Zosia**, 17 lat, 2 liceum | Liceum   | Rodzinny (płaci mama)       | Seria 412 dni, liga Diament, 12 480 XP, cel: „Szkoła”, matura za pół roku |

Plus „Nowy użytkownik” (start od onboardingu).

**Odłożone:** persona dorosłego (Tomek, 34 lata, plan roczny z odnowieniem za 9 dni, seria zerwana wczoraj po 96 dniach, cel: „Praca”; `lastActiveDate: 2026-10-18`). Nie wchodzi do wersji na 20.10; dodanie = nowy plik w `personas/`.

### 6.2 Typy ćwiczeń (as-is)

Wspólne pola: `id`, `type`, `prompt`, `skillTags` (tagi umiejętności; w as-is zapisane w danych, ale **nieużywane** w interfejsie, przydadzą się w tygodniu 3), `source` (`"course"`; od tygodnia 3 również `"user_material"`).

```json
[
  { "id": "u2-l1-e01", "type": "choose_translation", "source": "course", "skillTags": ["ordering-food"],
    "prompt": "Poproszę kawę z mlekiem.",
    "options": ["A coffee with milk, please.", "A milk with coffee, please.", "Coffee is milk, please.", "Please the coffee milk."],
    "answer": 0 },
  { "id": "u2-l1-e02", "type": "arrange_tiles", "source": "course", "skillTags": ["asking-directions"],
    "prompt": "Gdzie jest toaleta?",
    "tiles": ["Where", "is", "the", "toilet", "?", "are", "a"],
    "answer": ["Where", "is", "the", "toilet", "?"] },
  { "id": "u2-l1-e03", "type": "match_pairs", "source": "course", "skillTags": ["food-vocabulary"],
    "prompt": "Dopasuj pary",
    "pairs": [["kawa", "coffee"], ["herbata", "tea"], ["mleko", "milk"], ["cukier", "sugar"], ["ciasto", "cake"]] },
  { "id": "u2-l1-e04", "type": "type_translation", "source": "course", "skillTags": ["present-simple"],
    "prompt": "Papuga pije kawę.",
    "accepted": ["The parrot drinks coffee.", "The parrot is drinking coffee."] }
]
```

Sprawdzanie `type_translation`: bez rozróżniania wielkości liter, interpunkcji i podwójnych spacji.

### 6.3 Struktura kursu

`course.json` → `units[]` (`id`, `title`, `lessons[]`) → `lessons[]` (`id`, `title`, `exercisePool[]` z id ćwiczeń). Ćwiczenia w `exercises.json`.

| Jednostka | Temat | Lekcje grywalne |
|---|---|---|
| U1 | Podstawy (powitania, przedstawianie się) | L1, L2 |
| U2 | W kawiarni | L1, L2 |
| U3 | W podróży | — (zablokowane) |

L3 i L4 w U1 i U2 mają w `course.json` `exercisePool` złożony z id ćwiczeń L1 i L2 swojej jednostki (bez nowej treści).

Każda grywalna lekcja: pula 14–16 ćwiczeń, wszystkie 4 typy. Zdania poprawne, ale oderwane od szkoły i od celu ucznia („The parrot drinks coffee”). **Żadnej treści związanej ze szkolnym programem**, sprawdzianami czy maturą.

### 6.4 Stan użytkownika

```json
{
  "persona": "zosia",
  "profile": { "name": "Zosia", "ageBand": "16-19", "goal": "school", "dailyGoalMin": 10, "joinedAt": "2025-08-14" },
  "plan": "family",
  "subscription": { "renewsAt": "2027-02-01", "payer": "parent" },
  "streak": { "current": 412, "longest": 412, "lastActiveDate": "2026-10-19", "freezesLeft": 1 },
  "xp": { "total": 12480, "thisWeek": 340 },
  "hearts": null,
  "league": { "tier": "diamond", "rank": 4 },
  "progress": { "completedLessons": ["u1-l1", "u1-l2", "u2-l1"], "currentLesson": "u2-l2" },
  "quests": { "date": "2026-10-20", "items": [] },
  "badges": ["streak-365", "league-gold"]
}
```

`hearts: null` = bez limitu (Plus). Stan w `localStorage`, klucz `papuga:state:<persona>`.

### 6.5 Dziennik zdarzeń

Każde zdarzenie: `{ "ts", "persona", "name", "props" }`, zapis do `localStorage` i do panelu prowadzącego.

| Zdarzenie | Props |
|---|---|
| `app_opened` | — |
| `onboarding_completed` | `goal`, `ageBand`, `dailyGoalMin` |
| `lesson_started` | `lessonId` |
| `exercise_answered` | `exerciseId`, `type`, `correct` |
| `lesson_completed` | `lessonId`, `xp`, `mistakes`, `durationSec` |
| `heart_lost` / `hearts_depleted` | `heartsLeft` |
| `paywall_shown` | `trigger` (`hearts`, `streak_freeze`, `profile_banner`) |
| `trial_started` | `plan` |
| `streak_extended` / `streak_broken` | `current` |
| `streak_reminder_shown` | `hour` |
| `league_viewed` | `rank` |
| `ad_shown` / `ad_closed` | `afterSec` |

## 7. Punkty rozbudowy

| Punkt | Jak zbudowany | Do czego posłuży |
|---|---|---|
| **Rejestr typów ćwiczeń** | `exerciseRegistry: Record<type, Component>`; komponent dostaje `exercise` i `onAnswer({correct, answer})` | Nowe typy: fiszki, luki, „wytłumacz własnymi słowami”, scenka |
| **Źródło ćwiczeń** | Lekcja pobiera ćwiczenia przez `getExercises(lessonId)`; pole `source` | „Nauka z własnego materiału”: AI generuje ćwiczenia w tym samym schemacie |
| **Piąta zakładka** | Konfiguracja nawigacji w `nav.config.ts` | „Moje materiały” albo „Rozmowy” |
| **Slot w profilu** | `<ProfileSlot />` renderuje komponent z konfiguracji | Widok „umiem…” |
| **Dziennik zdarzeń** | `track(name, props)` | Pokazanie wpływu zmian na metryki |
| **Persony** | `personas/*.json` | Ten sam koncept pokazany na różnych użytkownikach |

## 8. Wymagania niefunkcjonalne

- **Stack:** Vite + React + TypeScript + Tailwind (domyślny w Lovable, działa w Claude Code). Ikony: Phosphor. Bez backendu, bez kluczy API w as-is.
- **Ekran:** ramka telefonu 390×844 na desktopie; na telefonie pełny ekran.
- **Język interfejsu:** polski.
- **Dostępność:** kontrast ≥ 4,5:1 (zgodnie z Design.md), obsługa klawiatury w ćwiczeniach, `prefers-reduced-motion`.
- **Repozytorium:** `README.md` (uruchomienie), `DESIGN.md`, `PRD.md`, `CLAUDE.md` (kontekst case'u i zasady dla AI, w tym „nie naprawiaj wad as-is”).
- **Publikacja:** stały link do wersji as-is (Lovable / Vercel / Netlify), żeby po rozbudowach zawsze można było wrócić do stanu wyjściowego.

## 9. Poza zakresem

Logowanie, płatności, backend, audio i mówienie, rozmowy wideo, powiadomienia push (tylko symulowane modale), kursy inne niż angielski, widok rodzica, AI w jakiejkolwiek funkcji (AI-coach zarządu powstaje najwcześniej w tygodniu 4).

## 10. Definicja gotowości

- [ ] Wszystkie ekrany M działają na 2 personach (Kuba, Zosia) i na nowym użytkowniku
- [ ] 4 grywalne lekcje, każda z pulą 14–16 ćwiczeń
- [ ] Reguły gry z sekcji 5 działają (XP, serca, seria, liga)
- [ ] Panel prowadzącego: przełącznik person, data/godzina, reset, dziennik zdarzeń
- [ ] Wszystkie wady z sekcji 3 są obecne i nienaprawione
- [ ] Wygląd zgodny z DESIGN.md
- [ ] Repozytorium z README, DESIGN.md, PRD.md, CLAUDE.md; stały link do wersji as-is
- [ ] Test: osoba spoza zespołu przechodzi onboarding i lekcję bez pomocy
