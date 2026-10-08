# Papuga — prototyp as-is

Klikalny prototyp obecnej wersji aplikacji Papuga (fikcyjna marka) do case study Supercharge 3.

## Uruchomienie

Wymaga Node 20+.

```bash
npm install
npm run dev
```

Aplikacja otwiera się pod adresem z terminala (domyślnie http://localhost:5173). Na desktopie widać ramkę telefonu 390×844, na telefonie pełny ekran.

## Dokumenty

- [PRD.md](PRD.md) — co prototyp robi i jakie wady celowo zachowuje
- [DESIGN.md](DESIGN.md) — styl „Naklejka”, tokeny i komponenty
- [CLAUDE.md](CLAUDE.md) — kontekst i zasady dla AI przy rozbudowie

## Komendy

| Komenda | Co robi |
|---|---|
| `npm run dev` | Serwer deweloperski |
| `npm run build` | Typecheck i build do `dist/` |
| `npm test` | Testy reguł gry |
| `npm run lint` | Lint |
