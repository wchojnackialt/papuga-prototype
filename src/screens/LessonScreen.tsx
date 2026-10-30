import { Heart, X } from '@phosphor-icons/react'
import { useCallback, useRef, useState, type ComponentType } from 'react'
import { useNav } from '../app/nav'
import { Button } from '../components/Button'
import { FeedbackSheet } from '../components/FeedbackSheet'
import { HeartsEmptyModal } from '../components/HeartsEmptyModal'
import { Modal } from '../components/Modal'
import { ProgressBar } from '../components/ProgressBar'
import { clock } from '../engine/clock'
import { getExercises } from '../engine/content'
import type { Exercise } from '../engine/schema'
import { useStore } from '../engine/store'
import { track } from '../engine/track'
import { getEntry } from '../exercises/registry'
import type { AnswerResult } from '../exercises/types'
import { openPaywall } from './startLesson'

type Feedback = { correct: boolean; correctAnswer: string }

export function ExerciseView({ exercise, onAnswer }: { exercise: Exercise; onAnswer: (r: AnswerResult) => void }) {
  const entry = getEntry(exercise.type)
  const Component = entry.component as ComponentType<{ exercise: Exercise; onAnswer: (r: AnswerResult) => void }>
  return (
    <>
      <h2 className="mb-5 font-head text-h2">{entry.title}</h2>
      <Component exercise={exercise} onAnswer={onAnswer} />
    </>
  )
}

// PRD §4.3: 10 zadań z puli, błędne wracają na koniec kolejki, −1 serce za błąd w planie darmowym.
export function LessonScreen({ lessonId }: { lessonId: string }) {
  const { go, home } = useNav()
  const hearts = useStore((s) => s.user.hearts)
  const loseHeart = useStore((s) => s.loseHeart)
  const completeLesson = useStore((s) => s.completeLesson)

  const [queue, setQueue] = useState(() => getExercises(lessonId))
  const [total] = useState(queue.length)
  const [pos, setPos] = useState(0)
  const [solved, setSolved] = useState(0)
  const [stats, setStats] = useState({ answers: 0, mistakes: 0 })
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const [heartsModal, setHeartsModal] = useState(false)
  const startedAt = useRef(clock.now())

  const exercise = queue[pos]

  const onAnswer = useCallback(
    ({ correct }: AnswerResult) => {
      track('exercise_answered', { exerciseId: exercise.id, type: exercise.type, correct })
      setStats((s) => ({ answers: s.answers + 1, mistakes: s.mistakes + (correct ? 0 : 1) }))
      if (correct) setSolved((n) => n + 1)
      else {
        setQueue((q) => [...q, exercise])
        loseHeart()
      }
      setFeedback({ correct, correctAnswer: getEntry(exercise.type).correctAnswer(exercise as never) })
    },
    [exercise, loseHeart],
  )

  const finish = () => {
    const xp = completeLesson(lessonId, stats.mistakes)
    const durationSec = Math.round((clock.now().getTime() - startedAt.current.getTime()) / 1000)
    track('lesson_completed', { lessonId, xp, mistakes: stats.mistakes, durationSec })
    go({
      name: 'lessonEnd',
      summary: {
        lessonId,
        xp,
        mistakes: stats.mistakes,
        accuracy: Math.round(((stats.answers - stats.mistakes) / Math.max(1, stats.answers)) * 100),
        streak: useStore.getState().user.streak.current,
      },
    })
  }

  const next = () => {
    if (useStore.getState().user.hearts === 0) return setHeartsModal(true)
    setFeedback(null)
    if (pos + 1 >= queue.length) finish()
    else setPos(pos + 1)
  }

  if (!exercise) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-body">Ta lekcja nie ma jeszcze ćwiczeń.</p>
        <Button variant="ghost" fullWidth={false} onClick={home}>
          Wróć
        </Button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 px-4">
        <button
          type="button"
          aria-label="Zamknij lekcję"
          onClick={() => setConfirmExit(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
        >
          <X size={26} weight="bold" aria-hidden />
        </button>
        <ProgressBar value={solved / total} label="Postęp lekcji" />
        {hearts !== null && (
          <span className="flex items-center gap-1 font-head text-stat" aria-label={`Serca: ${hearts}`}>
            <Heart size={24} weight="fill" className="text-heart" aria-hidden />
            {hearts}
          </span>
        )}
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 pb-6 pt-2">
        <div key={pos} className="animate-screen flex flex-1 flex-col">
          <ExerciseView exercise={exercise} onAnswer={onAnswer} />
        </div>
      </main>

      {feedback && <FeedbackSheet key={pos} correct={feedback.correct} correctAnswer={feedback.correctAnswer} onNext={next} />}

      <Modal open={confirmExit} onClose={() => setConfirmExit(false)} title="Na pewno kończysz?">
        <p className="mb-5 text-body">Stracisz postęp w tej lekcji.</p>
        <div className="space-y-3">
          <Button variant="primary" onClick={() => setConfirmExit(false)}>
            Zostań
          </Button>
          <Button variant="ghost" onClick={home}>
            Zakończ lekcję
          </Button>
        </div>
      </Modal>

      <HeartsEmptyModal open={heartsModal} onWait={home} onPlus={() => openPaywall('hearts')} />
    </div>
  )
}
