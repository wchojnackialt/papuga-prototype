import { Clock, Gift } from '@phosphor-icons/react'
import { ProgressBar } from '../components/ProgressBar'
import { clock } from '../engine/clock'
import { minutesToday } from '../engine/rules'
import { useStore } from '../engine/store'

const questTitle = { xp: 'Zdobądź 30 XP', lessons: 'Ukończ 2 lekcje', perfect: 'Zrób lekcję bez błędów' } as const

// PRD §4.7: 3 zadania dnia z paskami postępu, nagroda: skrzynka. Cel dzienny tylko jako pasek (PRD §5).
export function QuestsScreen() {
  const user = useStore((s) => s.user)
  const events = useStore((s) => s.events)
  const now = clock.now()
  const hoursLeft = 24 - now.getHours()
  const items = user.quests.date === clock.today() ? user.quests.items : []
  const goal = user.profile.dailyGoalMin
  const minutes = minutesToday(events, user.persona, clock.today())

  return (
    <div className="space-y-6 px-4 pb-8 pt-4">
      <div className="flex items-end justify-between">
        <h1 className="font-head text-h1">Zadania dnia</h1>
        <span className="flex items-center gap-1 text-small text-ink-muted">
          <Clock size={16} weight="bold" aria-hidden /> Nowe za {hoursLeft} h
        </span>
      </div>

      {goal && (
        <section className="sticker rounded-md bg-surface p-4 shadow-st-md">
          <div className="mb-2 flex justify-between font-bold">
            <span>Cel dzienny</span>
            <span>
              {Math.min(minutes, goal)} / {goal} min
            </span>
          </div>
          <ProgressBar value={minutes / goal} label="Cel dzienny" />
        </section>
      )}

      <ul className="space-y-3">
        {items.map((q) => {
          const done = q.progress >= q.target
          return (
            <li key={q.id} className="sticker flex items-center gap-4 rounded-md bg-surface p-4 shadow-st-md">
              <div className="flex-1">
                <p className="mb-2 font-bold">{questTitle[q.id]}</p>
                <div className="flex items-center gap-3">
                  <ProgressBar value={q.progress / q.target} label={questTitle[q.id]} />
                  <span className="shrink-0 text-small font-bold">
                    {q.progress} / {q.target}
                  </span>
                </div>
              </div>
              <span
                className={`sticker flex h-12 w-12 shrink-0 items-center justify-center rounded-sm ${done ? 'bg-sun shadow-st-sm' : 'border-dashed bg-locked text-ink-muted'}`}
                aria-label={done ? 'Skrzynka zdobyta' : 'Skrzynka'}
              >
                <Gift size={26} weight={done ? 'fill' : 'bold'} aria-hidden />
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
