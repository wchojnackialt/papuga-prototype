import { Fire, Snowflake } from '@phosphor-icons/react'
import { useNav } from '../app/nav'
import { Button } from '../components/Button'
import { ScreenHeader } from '../components/ScreenHeader'
import { clock } from '../engine/clock'
import { fromDayKey } from '../engine/dates'
import { formatNumber } from '../engine/format'
import { daysWord, monthNames } from '../engine/labels'
import { isPlus, streakCalendar } from '../engine/rules'
import { useStore } from '../engine/store'
import { openPaywall } from './startLesson'

const weekdays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

// CalendarDay (DESIGN.md §5): active (płomień), frozen (płatek śniegu), missed, today.
function Day({ n, status, today }: { n: number; status: string; today: boolean }) {
  const look =
    status === 'active' ? 'bg-flame text-ink' : status === 'frozen' ? 'bg-ice' : status === 'missed' ? 'bg-locked text-ink-muted' : 'text-ink-muted'
  return (
    <div
      className={`relative flex aspect-square items-center justify-center rounded-sm text-small font-bold ${look} ${today ? 'outline outline-2 outline-offset-1 outline-lavender' : ''}`}
      aria-label={`${n}: ${{ active: 'aktywny', frozen: 'zamrożony', missed: 'pominięty', future: '', none: '' }[status] ?? ''}${today ? ', dziś' : ''}`}
    >
      {status === 'active' && <Fire size={14} weight="fill" className="absolute right-0.5 top-0.5 text-sun" aria-hidden />}
      {status === 'frozen' && <Snowflake size={14} weight="bold" className="absolute right-0.5 top-0.5 text-ice-ink" aria-hidden />}
      {n}
    </div>
  )
}

// PRD §4.6: kalendarz miesiąca, rekord, zamrożenie serii tylko w Plus. Seria jako obowiązek (as-is).
export function StreakScreen() {
  const user = useStore((s) => s.user)
  const home = useNav((s) => s.home)
  const today = clock.today()
  const days = streakCalendar(user, today, today)
  const offset = (fromDayKey(days[0].day).getDay() + 6) % 7
  const month = fromDayKey(today)
  const doneToday = user.streak.lastActiveDate === today

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <ScreenHeader onBack={home} title="Seria" />
      <div className="px-4 pb-8">
        <section className="sticker flex items-center gap-4 rounded-md bg-coral-soft p-5 shadow-st-lg">
          <Fire size={64} weight="fill" className={`icon-ink ${user.streak.current > 0 ? 'text-flame' : 'text-locked'}`} aria-hidden />
          <div>
            <p className="font-head text-display">{formatNumber(user.streak.current)}</p>
            <p className="font-bold">{daysWord(user.streak.current)} serii</p>
          </div>
        </section>
        <p className="mt-4 text-body font-bold">
          {doneToday ? 'Dzisiejsza lekcja zaliczona! Wróć jutro 🔥' : 'Zrób dziś lekcję, żeby nie stracić serii! 🔥'}
        </p>
        <p className="text-small text-ink-muted">Rekord: {formatNumber(user.streak.longest)} {daysWord(user.streak.longest)}</p>

        <section className="sticker mt-6 rounded-md bg-surface p-4 shadow-st-md">
          <h2 className="mb-3 font-head text-h2 capitalize">
            {monthNames[month.getMonth()]} {month.getFullYear()}
          </h2>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {weekdays.map((w) => (
              <span key={w} className="text-label-caps text-ink-muted">
                {w}
              </span>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {days.map((d, i) => (
              <Day key={d.day} n={i + 1} status={d.status} today={d.today} />
            ))}
          </div>
        </section>

        <section className="sticker mt-6 flex items-center gap-3 rounded-md bg-surface p-4 shadow-st-md">
          <Snowflake size={36} weight="bold" className="shrink-0 text-ice-ink" aria-hidden />
          <div className="flex-1">
            <h2 className="font-bold">Zamrożenie serii</h2>
            <p className="text-small text-ink-muted">
              {isPlus(user)
                ? `Masz ${user.streak.freezesLeft} na ten tydzień. Włącza się samo, gdy pominiesz dzień.`
                : 'Chroni serię, gdy pominiesz dzień. Tylko w Papuga Plus.'}
            </p>
          </div>
        </section>
        {!isPlus(user) && (
          <div className="mt-4">
            <Button variant="action" onClick={() => openPaywall('streak_freeze')}>
              Zamroź serię
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
