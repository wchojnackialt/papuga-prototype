import { useEffect, useRef, useState } from 'react'
import type { Exercise } from '../engine/schema'
import type { ExerciseProps } from './types'

type Ex = Extract<Exercise, { type: 'match_pairs' }>
type Side = 'pl' | 'en'
type Card = { side: Side; pair: number; text: string }

// MatchCard (DESIGN.md §5): default, selected, matched (wyszarzony), wrong (drganie 200 ms). Dwie kolumny.
// Ćwiczenie kończy się po dopasowaniu wszystkich par; pomyłki tylko drgają (nie zabierają serca).
export function MatchPairs({ exercise, onAnswer }: ExerciseProps<Ex>) {
  const [columns] = useState(() => {
    const pl = exercise.pairs.map(([text], pair) => ({ side: 'pl' as const, pair, text }))
    const en = exercise.pairs.map(([, text], pair) => ({ side: 'en' as const, pair, text })).sort(() => Math.random() - 0.5)
    return { pl, en }
  })
  const [selected, setSelected] = useState<Card | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [wrong, setWrong] = useState<Card[]>([])
  const attempts = useRef(0)
  const done = matched.length === exercise.pairs.length

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => onAnswer({ correct: true, answer: { attempts: attempts.current } }), 250)
    return () => clearTimeout(t)
  }, [done, onAnswer])

  const pick = (card: Card) => {
    if (matched.includes(card.pair) || done) return
    if (!selected || selected.side === card.side) return setSelected(card)
    attempts.current += 1
    if (selected.pair === card.pair) {
      setMatched([...matched, card.pair])
    } else {
      setWrong([selected, card])
      setTimeout(() => setWrong([]), 220)
    }
    setSelected(null)
  }

  const renderCard = (card: Card) => {
    const isMatched = matched.includes(card.pair)
    const isSel = selected?.side === card.side && selected.pair === card.pair
    const isWrong = wrong.some((w) => w.side === card.side && w.pair === card.pair)
    const look = isMatched
      ? 'bg-locked text-ink-muted border-ink/30 shadow-none'
      : isWrong
        ? 'bg-error-soft border-error-ink animate-shake press-sm'
        : isSel
          ? 'bg-lavender-soft border-lavender press-sm'
          : 'bg-surface border-ink press-sm'
    return (
      <button
        key={`${card.side}-${card.pair}`}
        type="button"
        disabled={isMatched}
        aria-pressed={isSel}
        lang={card.side}
        onClick={() => pick(card)}
        className={`min-h-[56px] w-full rounded-md border-2 px-3 text-body
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender ${look}`}
      >
        {card.text}
      </button>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-3">{columns.pl.map(renderCard)}</div>
      <div className="space-y-3">{columns.en.map(renderCard)}</div>
    </div>
  )
}
