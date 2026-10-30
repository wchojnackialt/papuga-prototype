import { X } from '@phosphor-icons/react'
import { useCallback, useRef, useState } from 'react'
import { useNav, type PracticeSummary } from '../app/nav'
import { Button } from '../components/Button'
import { Confetti } from '../components/Confetti'
import { FeedbackSheet } from '../components/FeedbackSheet'
import { useFocusOnMount, useTrackOnMount } from '../components/hooks'
import { Mascot } from '../components/Mascot'
import { Modal } from '../components/Modal'
import { ProgressBar } from '../components/ProgressBar'
import { clock } from '../engine/clock'
import { classroom } from '../engine/content'
import { useStore } from '../engine/store'
import { track } from '../engine/track'
import { buildSession, exerciseWordKey, findList, knownCount, wordsLabel } from '../engine/wordLists'
import { getEntry } from '../exercises/registry'
import type { AnswerResult } from '../exercises/types'
import { ExerciseView } from './LessonScreen'

// Sesja ze słówek zestawu. Jak lekcja (błędne wracają na koniec kolejki), ale bez serc i XP:
// liczy się do serii, a wynikiem jest „umiesz X z Y” (PRD 2.7, decyzja z planu prototypu).
export function ListPracticeScreen({ listId }: { listId: string }) {
  const { go, home } = useNav()
  const completeListPractice = useStore((s) => s.completeListPractice)
  const [entry] = useState(() => findList(useStore.getState().user, classroom, listId))
  const [knownBefore] = useState(() => (entry ? knownCount(entry.list, useStore.getState().user.wordProgress) : 0))
  const [queue, setQueue] = useState(() => (entry ? buildSession(entry.list, useStore.getState().user.wordProgress) : []))
  const [total] = useState(queue.length)
  const [pos, setPos] = useState(0)
  const [solved, setSolved] = useState(0)
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const answers = useRef<{ key: string; correct: boolean }[]>([])
  const startedAt = useRef(clock.now())

  useTrackOnMount(entry && 'list_practice_started', { listId, mine: entry?.mine, known: knownBefore, total: entry?.list.words.length })

  const exercise = queue[pos]

  const onAnswer = useCallback(
    ({ correct }: AnswerResult) => {
      track('exercise_answered', { exerciseId: exercise.id, type: exercise.type, correct, source: 'user_material' })
      const key = exerciseWordKey(exercise.id)
      if (key) answers.current.push({ key, correct })
      if (correct) setSolved((n) => n + 1)
      else setQueue((q) => [...q, exercise])
      setFeedback({ correct, correctAnswer: getEntry(exercise.type).correctAnswer(exercise as never) })
    },
    [exercise],
  )

  const finish = () => {
    completeListPractice(answers.current)
    const user = useStore.getState().user
    const known = knownCount(entry!.list, user.wordProgress)
    const mistakes = answers.current.filter((a) => !a.correct).length
    const summary: PracticeSummary = {
      listId,
      knownBefore,
      known,
      total: entry!.list.words.length,
      accuracy: Math.round(((answers.current.length - mistakes) / Math.max(1, answers.current.length)) * 100),
      streak: user.streak.current,
    }
    track('list_practice_completed', { ...summary, durationSec: Math.round((clock.now().getTime() - startedAt.current.getTime()) / 1000) })
    go({ name: 'listPracticeEnd', summary })
  }

  const next = () => {
    setFeedback(null)
    if (pos + 1 >= queue.length) finish()
    else setPos(pos + 1)
  }

  if (!entry || !exercise) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-body">W tym zestawie jest za mało słówek do ćwiczenia.</p>
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
          aria-label="Zakończ ćwiczenie"
          onClick={() => setConfirmExit(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
        >
          <X size={26} weight="bold" aria-hidden />
        </button>
        <ProgressBar value={solved / total} label="Postęp ćwiczenia" />
      </header>
      <p className="truncate px-4 text-label-caps text-ink-muted">{entry.list.name}</p>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 pb-6 pt-2">
        <div key={pos} className="animate-screen flex flex-1 flex-col">
          <ExerciseView exercise={exercise} onAnswer={onAnswer} />
        </div>
      </main>

      {feedback && <FeedbackSheet key={pos} correct={feedback.correct} correctAnswer={feedback.correctAnswer} onNext={next} />}

      <Modal open={confirmExit} onClose={() => setConfirmExit(false)} title="Na pewno kończysz?">
        <p className="mb-5 text-body">Odpowiedzi z tej sesji nie zapiszą się w postępie.</p>
        <div className="space-y-3">
          <Button variant="primary" onClick={() => setConfirmExit(false)}>
            Zostań
          </Button>
          <Button variant="ghost" onClick={() => go({ name: 'wordList', listId })}>
            Zakończ
          </Button>
        </div>
      </Modal>
    </div>
  )
}

/** Koniec sesji: „umiesz X z Y” zamiast XP. */
export function ListPracticeEndScreen({ summary }: { summary: PracticeSummary }) {
  const go = useNav((s) => s.go)
  const focusRef = useFocusOnMount<HTMLButtonElement>()
  const gained = summary.known - summary.knownBefore
  const left = summary.total - summary.known
  return (
    <div className="animate-screen relative flex flex-1 flex-col items-center px-4 pb-6 pt-12 text-center">
      {gained > 0 && <Confetti />}
      <Mascot mood="happy" size={120} />
      <h1 className="mt-6 font-head text-display">
        Umiesz {summary.known} z {summary.total}
      </h1>
      <p className="mt-2 text-body">
        {gained > 0 ? `+${wordsLabel(gained)} od poprzedniej sesji.` : 'Każda powtórka utrwala słówka.'}
      </p>
      <div className="mt-6 w-full">
        <ProgressBar value={summary.known / summary.total} label={`Umiesz ${summary.known} z ${summary.total}`} />
      </div>
      <div className="mt-6 flex w-full gap-3">
        <div className="sticker flex flex-1 flex-col items-center gap-1 rounded-md bg-lime p-3 shadow-st-md">
          <span className="text-label-caps">Poprawne</span>
          <span className="font-head text-stat">{summary.accuracy}%</span>
        </div>
        <div className="sticker flex flex-1 flex-col items-center gap-1 rounded-md bg-coral-soft p-3 shadow-st-md">
          <span className="text-label-caps">Dni serii</span>
          <span className="font-head text-stat">{summary.streak}</span>
        </div>
      </div>
      <p className="mt-6 w-full text-left text-small font-bold">
        {left === 0 ? 'Znasz cały zestaw. Powodzenia na sprawdzianie!' : `Do powtórki: ${wordsLabel(left)}. Wróć do nich jeszcze dziś albo jutro.`}
      </p>
      <div className="mt-auto w-full pt-6">
        <Button variant="action" ref={focusRef} onClick={() => go({ name: 'wordList', listId: summary.listId })}>
          Dalej
        </Button>
      </div>
    </div>
  )
}
