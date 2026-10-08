import { useState } from 'react'
import { useFocusOnMount } from '../components/hooks'
import { isAcceptedTranslation } from '../engine/rules'
import type { Exercise } from '../engine/schema'
import { CheckButton } from './CheckButton'
import { PromptBubble } from './PromptBubble'
import type { ExerciseProps } from './types'

type Ex = Extract<Exercise, { type: 'type_translation' }>

// TextAnswer (DESIGN.md §5): default, focus (kontur lavender), correct, wrong. Pole wieloliniowe.
export function TypeTranslation({ exercise, onAnswer }: ExerciseProps<Ex>) {
  const focusRef = useFocusOnMount<HTMLTextAreaElement>()
  const [text, setText] = useState('')
  const [result, setResult] = useState<boolean | null>(null)

  const check = () => {
    if (!text.trim() || result !== null) return
    const correct = isAcceptedTranslation(text, exercise.accepted)
    setResult(correct)
    onAnswer({ correct, answer: text })
  }

  const look = result === null ? 'border-ink focus:border-lavender' : result ? 'border-ink bg-lime-soft' : 'border-error-ink bg-error-soft'

  return (
    <>
      <PromptBubble text={exercise.prompt} />
      <label htmlFor={`answer-${exercise.id}`} className="sr-only">
        Napisz po angielsku
      </label>
      <textarea
        id={`answer-${exercise.id}`}
        ref={focusRef}
        rows={4}
        lang="en"
        spellCheck={false}
        autoCapitalize="sentences"
        value={text}
        readOnly={result !== null}
        placeholder="Napisz po angielsku"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            check()
          }
        }}
        className={`w-full resize-none rounded-md border-2 bg-surface p-4 text-body shadow-st-sm outline-none placeholder:text-ink-muted ${look}`}
      />
      <CheckButton disabled={!text.trim()} onClick={check} hidden={result !== null} />
    </>
  )
}
