import { useEffect, useState } from 'react'
import type { Exercise } from '../engine/schema'
import { CheckButton } from './CheckButton'
import { PromptBubble } from './PromptBubble'
import type { ExerciseProps } from './types'

type Ex = Extract<Exercise, { type: 'arrange_tiles' }>

const shuffle = <T,>(list: T[]) => {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// WordTile (DESIGN.md §5): w banku, w odpowiedzi, użyty (pusty kontur). DM Sans 16, r-sm, shadow-sm.
function Tile({ word, onClick, disabled }: { word: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      lang="en"
      className="press-sm sticker min-h-[44px] rounded-sm bg-surface px-3 text-body
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender"
    >
      {word}
    </button>
  )
}

export function ArrangeTiles({ exercise, onAnswer }: ExerciseProps<Ex>) {
  // Kafelki identyfikujemy po indeksie, bo słowa mogą się powtarzać.
  const [bank] = useState(() => shuffle(exercise.tiles.map((word, id) => ({ id, word }))))
  const [picked, setPicked] = useState<number[]>([])
  const [checked, setChecked] = useState(false)

  const words = picked.map((id) => exercise.tiles[id])
  const check = () => {
    if (!picked.length || checked) return
    setChecked(true)
    onAnswer({ correct: words.join(' ') === exercise.answer.join(' '), answer: words })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && picked.length && !checked && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault()
        check()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <>
      <PromptBubble text={exercise.prompt} />
      <div
        aria-label="Twoja odpowiedź"
        className="mb-8 flex min-h-[112px] flex-wrap content-start gap-2 border-b-2 border-ink/20 bg-[linear-gradient(transparent_54px,rgba(43,34,48,.2)_54px,rgba(43,34,48,.2)_56px,transparent_56px)] pb-2"
      >
        {picked.map((id) => (
          <Tile key={id} word={exercise.tiles[id]} disabled={checked} onClick={() => setPicked(picked.filter((p) => p !== id))} />
        ))}
      </div>
      <div aria-label="Kafelki" className="flex flex-wrap justify-center gap-2">
        {bank.map(({ id, word }) =>
          picked.includes(id) ? (
            <span key={id} aria-hidden className="min-h-[44px] rounded-sm border-2 border-dashed border-ink/30 bg-locked px-3 text-body text-transparent">
              {word}
            </span>
          ) : (
            <Tile key={id} word={word} disabled={checked} onClick={() => setPicked([...picked, id])} />
          ),
        )}
      </div>
      <CheckButton disabled={!picked.length} onClick={check} hidden={checked} />
    </>
  )
}
