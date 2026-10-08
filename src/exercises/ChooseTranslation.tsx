import { useEffect, useState } from 'react'
import type { Exercise } from '../engine/schema'
import { CheckButton } from './CheckButton'
import { PromptBubble } from './PromptBubble'
import type { ExerciseProps } from './types'

type Ex = Extract<Exercise, { type: 'choose_translation' }>

// ChoiceOption (DESIGN.md §5): default, selected (lavender-soft + kontur lavender), correct, wrong. Pełna szerokość, 56px.
export function ChooseTranslation({ exercise, onAnswer }: ExerciseProps<Ex>) {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  const check = () => {
    if (selected === null || checked) return
    setChecked(true)
    onAnswer({ correct: selected === exercise.answer, answer: exercise.options[selected] })
  }

  // Klawiatura: 1–4 wybiera opcję, Enter sprawdza.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (checked) return
      const n = Number(e.key)
      if (n >= 1 && n <= exercise.options.length) setSelected(n - 1)
      if (e.key === 'Enter' && selected !== null) {
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
      <div role="radiogroup" aria-label="Odpowiedzi" className="space-y-3">
        {exercise.options.map((option, i) => {
          const isSel = selected === i
          const state = checked ? (i === exercise.answer ? 'correct' : isSel ? 'wrong' : 'idle') : isSel ? 'selected' : 'idle'
          const look = {
            idle: 'bg-surface border-ink',
            selected: 'bg-lavender-soft border-lavender',
            correct: 'bg-lime border-ink',
            wrong: 'bg-error-soft border-error-ink animate-shake',
          }[state]
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSel}
              disabled={checked}
              onClick={() => setSelected(i)}
              className={`press-sm flex min-h-[56px] w-full items-center gap-3 rounded-md border-2 px-4 text-left text-body
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender ${look}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 border-ink text-small font-bold">
                {i + 1}
              </span>
              <span lang="en">{option}</span>
            </button>
          )
        })}
      </div>
      <CheckButton disabled={selected === null} onClick={check} hidden={checked} />
    </>
  )
}
