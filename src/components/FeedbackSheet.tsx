import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Button } from './Button'
import { useFocusOnMount } from './hooks'

const praise = ['Świetnie!', 'Dobrze!', 'Super!', 'Brawo!']

// DESIGN.md §5: correct (lime-soft, „Świetnie!”), wrong (error-soft, „Poprawna odpowiedź: …”). Wjeżdża od dołu.
export function FeedbackSheet({ correct, correctAnswer, onNext }: { correct: boolean; correctAnswer: string; onNext: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onNext()
      }
    }
    // Opóźnienie, żeby Enter, który zatwierdził odpowiedź, nie przewinął od razu dalej.
    const t = setTimeout(() => window.addEventListener('keydown', onKey), 150)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [onNext])

  const focusRef = useFocusOnMount<HTMLButtonElement>()
  const [title] = useState(() => (correct ? praise[Math.floor(Math.random() * praise.length)] : 'Niepoprawnie'))
  return (
    <div
      role="status"
      aria-live="assertive"
      className={`animate-slide-up absolute inset-x-0 bottom-0 z-20 border-t-2 border-ink px-4 pb-6 pt-4 ${correct ? 'bg-lime-soft' : 'bg-error-soft'}`}
    >
      <div className={`mb-3 flex items-center gap-2 font-head text-h2 ${correct ? 'text-lime-ink' : 'text-error-ink'}`}>
        {correct ? <CheckCircle weight="fill" size={30} aria-hidden /> : <XCircle weight="fill" size={30} aria-hidden />}
        {title}
      </div>
      {!correct && (
        <p className="mb-4 text-body text-error-ink">
          <span className="font-bold">Poprawna odpowiedź:</span> <span lang="en">{correctAnswer}</span>
        </p>
      )}
      <Button variant={correct ? 'action' : 'primary'} onClick={onNext} ref={focusRef}>
        Dalej
      </Button>
    </div>
  )
}
