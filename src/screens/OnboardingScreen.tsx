import { ArrowLeft } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { Mascot } from '../components/Mascot'
import { ProgressBar } from '../components/ProgressBar'
import type { ageBands, goals } from '../engine/schema'
import { useStore } from '../engine/store'

type Goal = (typeof goals)[number]
type AgeBand = (typeof ageBands)[number]

const languages = [
  { id: 'en', label: 'Angielski', flag: '🇬🇧', active: true },
  { id: 'es', label: 'Hiszpański', flag: '🇪🇸', active: false },
  { id: 'de', label: 'Niemiecki', flag: '🇩🇪', active: false },
  { id: 'fr', label: 'Francuski', flag: '🇫🇷', active: false },
]
const goalOptions: { id: Goal; label: string; icon: string }[] = [
  { id: 'school', label: 'Szkoła', icon: '🎒' },
  { id: 'test', label: 'Sprawdzian lub egzamin', icon: '📝' },
  { id: 'work', label: 'Praca', icon: '💼' },
  { id: 'travel', label: 'Podróże', icon: '✈️' },
  { id: 'self', label: 'Dla siebie', icon: '✨' },
]
const ageOptions: { id: AgeBand; label: string }[] = [
  { id: 'u12', label: 'do 12 lat' },
  { id: '13-15', label: '13–15 lat' },
  { id: '16-19', label: '16–19 lat' },
  { id: '20+', label: '20+ lat' },
]
const dailyOptions = [
  { id: 5, label: '5 min dziennie', hint: 'Na luzie' },
  { id: 10, label: '10 min dziennie', hint: 'Regularnie' },
  { id: 15, label: '15 min dziennie', hint: 'Na serio' },
  { id: 20, label: '20 min dziennie', hint: 'Intensywnie' },
]

function Option({ selected, disabled, onClick, children }: { selected: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[56px] w-full items-center gap-3 rounded-md border-2 px-4 text-left text-body
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender
        ${disabled ? 'border-dashed border-ink/40 bg-locked text-ink-muted' : selected ? 'press-sm border-lavender bg-lavender-soft' : 'press-sm border-ink bg-surface'}`}
    >
      {children}
    </button>
  )
}

const questions = ['Czego chcesz się uczyć?', 'Po co się uczysz?', 'Ile masz lat?', 'Jaki masz cel dzienny?']

// PRD §4.1: odpowiedzi zapisują się i trafiają do dziennika, ale nie zmieniają ścieżki (wada as-is).
export function OnboardingScreen() {
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null)
  const [daily, setDaily] = useState<number | null>(null)
  const done = step === questions.length

  const ready = [true, goal !== null, ageBand !== null, daily !== null][step] ?? true

  if (done) {
    return (
      <div className="animate-screen flex flex-1 flex-col items-center px-4 pb-6 pt-24 text-center">
        <Mascot mood="happy" size={120} />
        <h1 className="mt-6 font-head text-display">Zaczynamy!</h1>
        <p className="mt-3 text-body">Twoja pierwsza lekcja już czeka. Zdobywaj XP, buduj serię i walcz w lidze!</p>
        <div className="mt-auto w-full">
          <Button variant="action" onClick={() => completeOnboarding({ goal: goal!, ageBand: ageBand!, dailyGoalMin: daily! })}>
            Zaczynamy!
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col px-4 pb-6">
      <header className="flex h-14 shrink-0 items-center gap-3">
        <button
          type="button"
          aria-label="Wróć"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm disabled:invisible"
        >
          <ArrowLeft size={26} weight="bold" aria-hidden />
        </button>
        <ProgressBar value={step / questions.length} label="Postęp" />
      </header>

      <div key={step} className="animate-screen flex flex-1 flex-col">
        <div className="mb-6 mt-4 flex items-end gap-3">
          <Mascot size={64} />
          <p className="sticker rounded-md bg-surface px-4 py-3 font-head text-h2 shadow-st-sm">{questions[step]}</p>
        </div>
        <div role="radiogroup" aria-label={questions[step]} className="space-y-3">
          {step === 0 &&
            languages.map((l) => (
              <Option key={l.id} selected={l.active} disabled={!l.active} onClick={() => {}}>
                <span className="text-2xl" aria-hidden>
                  {l.flag}
                </span>
                <span className="flex-1">{l.label}</span>
                {!l.active && <span className="text-label-caps">Wkrótce</span>}
              </Option>
            ))}
          {step === 1 &&
            goalOptions.map((g) => (
              <Option key={g.id} selected={goal === g.id} onClick={() => setGoal(g.id)}>
                <span className="text-2xl" aria-hidden>
                  {g.icon}
                </span>
                {g.label}
              </Option>
            ))}
          {step === 2 &&
            ageOptions.map((a) => (
              <Option key={a.id} selected={ageBand === a.id} onClick={() => setAgeBand(a.id)}>
                {a.label}
              </Option>
            ))}
          {step === 3 &&
            dailyOptions.map((d) => (
              <Option key={d.id} selected={daily === d.id} onClick={() => setDaily(d.id)}>
                <span className="flex-1 font-bold">{d.label}</span>
                <span className="text-small text-ink-muted">{d.hint}</span>
              </Option>
            ))}
        </div>
        <div className="mt-auto pt-6">
          <Button variant="primary" disabled={!ready} onClick={() => setStep(step + 1)}>
            Dalej
          </Button>
        </div>
      </div>
    </div>
  )
}
