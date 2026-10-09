# Papuga — prototyp as-is

Klikalny prototyp obecnej wersji aplikacji Papuga (fikcyjna marka) do case study Supercharge 3.

**Wersja online:** https://papuga-prototype.vercel.app (Vercel, wdraża się automatycznie z gałęzi `main`).

## Uruchomienie

Wymaga Node 20+.

```bash
npm install
npm run dev
```

Aplikacja otwiera się pod adresem z terminala (domyślnie http://localhost:5173). Na desktopie widać ramkę telefonu 390×844, na telefonie pełny ekran.

## Panel prowadzącego

`Shift + D` albo przycisk **DEV** w prawym dolnym rogu (poza ramką telefonu):

- przełącznik person: Kuba (plan darmowy), Zosia (plan rodzinny), nowy użytkownik (od onboardingu);
- symulowany czas: domyślnie wtorek 20.10.2026, 10:00; zmiana czasu działa jak otwarcie aplikacji o tej porze (zerwanie serii, odnowienie serc, nowy tydzień ligi);
- odnowienie serc, reset persony, reset wszystkiego;
- dziennik zdarzeń na żywo (ostatnie 50) z eksportem do JSON.

Stan każdej persony jest w `localStorage` przeglądarki (`papuga:state:<persona>`).

## Dokumenty

- [PRD.md](PRD.md) — co prototyp robi i jakie wady celowo zachowuje
- [DESIGN.md](DESIGN.md) — styl „Naklejka”, tokeny i komponenty
- [CLAUDE.md](CLAUDE.md) — kontekst i zasady dla AI przy rozbudowie

## Komendy

| Komenda | Co robi |
|---|---|
| `npm run dev` | Serwer deweloperski |
| `npm run build` | Typecheck i build do `dist/` |
| `npm test` | Testy reguł gry i treści |
| `npm run validate` | Kontrola treści ćwiczeń |
| `npm run content:review` | Arkusz przeglądu treści (`docs/tresc-cwiczen.md`) |
| `npm run lint` | Lint |
