// Generuje docs/tresc-cwiczen.md: czytelny arkusz do ręcznego przeglądu treści ćwiczeń.
// Źródłem prawdy zostaje src/data/*.json — po poprawkach w JSON uruchom `npm run content:review` ponownie.
import { readFileSync, writeFileSync } from 'node:fs'

const read = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url), 'utf8'))
const course = read('course.json')
const exercises = new Map(read('exercises.json').map((e) => [e.id, e]))

const typeLabel = {
  choose_translation: 'Wybierz tłumaczenie',
  arrange_tiles: 'Ułóż z kafelków',
  match_pairs: 'Dopasuj pary',
  type_translation: 'Wpisz tłumaczenie',
}
const esc = (s) => String(s).replace(/\|/g, '\\|')

function row(e) {
  switch (e.type) {
    case 'choose_translation':
      return [e.prompt, `**${e.options[e.answer]}**`, e.options.filter((_, i) => i !== e.answer).join(' / ')]
    case 'arrange_tiles': {
      const left = [...e.tiles]
      e.answer.forEach((w) => left.splice(left.indexOf(w), 1))
      return [e.prompt, `**${e.answer.join(' ')}**`, left.join(' · ')]
    }
    case 'match_pairs':
      return ['—', e.pairs.map(([pl, en]) => `${pl} = ${en}`).join('; '), '']
    case 'type_translation':
      return [e.prompt, `**${e.accepted[0]}**`, e.accepted.slice(1).join(' / ')]
  }
}

const out = [
  '# Treść ćwiczeń — arkusz przeglądu',
  '',
  'Wygenerowane z `src/data/exercises.json` i `src/data/course.json` (`npm run content:review`). Poprawki wpisuj w JSON, nie tutaj.',
  '',
  'Na co patrzeć: poprawność angielskiego, jednoznaczność (czy dystraktor nie jest też poprawny), brakujące warianty odpowiedzi w „Wpisz tłumaczenie”. Treść jest **celowo** oderwana od szkoły i celu ucznia (wada as-is).',
  '',
]

for (const unit of course.units.filter((u) => !u.locked)) {
  for (const lesson of unit.lessons.slice(0, 2)) {
    out.push(`## ${unit.id.toUpperCase()} ${unit.title} · ${lesson.id.split('-')[1].toUpperCase()} ${lesson.title} (${lesson.exercisePool.length})`, '')
    out.push('| ✓ | Id | Typ | Polecenie (PL) | Odpowiedź | Dystraktory / inne akceptowane | Uwagi |', '|---|---|---|---|---|---|---|')
    for (const id of lesson.exercisePool) {
      const e = exercises.get(id)
      out.push(`| ☐ | ${e.id.split('-').pop()} | ${typeLabel[e.type]} | ${row(e).map(esc).join(' | ')} |  |`)
    }
    out.push('')
  }
}
out.push('L3 i L4 każdej jednostki losują z puli L1 + L2 (PRD §6.3), więc nie mają własnej treści.', '')

writeFileSync(new URL('../docs/tresc-cwiczen.md', import.meta.url), out.join('\n'))
console.log('docs/tresc-cwiczen.md')
