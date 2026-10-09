import { useEffect, useState, type ReactNode } from 'react'
import { useNav } from '../app/nav'
import { clock, DEFAULT_SIM_START } from '../engine/clock'
import { personaIds, personaSeeds } from '../engine/content'
import { addDays, toDayKey } from '../engine/dates'
import { heartsRefillAt } from '../engine/rules'
import { useStore } from '../engine/store'

// Panel prowadzącego (PRD §4.10). Celowo poza światem marki: styl techniczny, monospace (DESIGN.md §5 DevPanel).
// Otwierany Shift + D albo ikoną w rogu, poza ramką telefonu.

const pad = (n: number) => String(n).padStart(2, '0')
const toLocalInput = (d: Date) => `${toDayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
const fmtTime = (iso: string) => new Date(iso).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })

/** Ustawienie zegara = „otwarcie aplikacji o tej porze”: reguły serii, serc i tygodnia ligi działają od razu. */
function setTime(date: Date) {
  clock.set(date)
  useNav.setState({ screen: { name: 'tabs' } })
  useStore.getState().appOpened()
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-white/15 px-4 py-3">
      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/50">{title}</h3>
      {children}
    </section>
  )
}

function Btn({ onClick, children, active, danger }: { onClick: () => void; children: ReactNode; active?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-2 py-1 text-[12px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sun
        ${active ? 'border-sun bg-sun text-ink' : danger ? 'border-red-400/60 text-red-300 hover:bg-red-400/10' : 'border-white/30 hover:bg-white/10'}`}
    >
      {children}
    </button>
  )
}

/** Przycisk wymagający drugiego kliknięcia (bez okien dialogowych przeglądarki). */
function ConfirmBtn({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(t)
  }, [armed])
  return (
    <Btn
      danger
      onClick={() => {
        if (armed) {
          setArmed(false)
          onConfirm()
        } else setArmed(true)
      }}
    >
      {armed ? 'Na pewno? Kliknij ponownie' : label}
    </Btn>
  )
}

function exportEvents(events: unknown) {
  const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `papuga-zdarzenia-${toDayKey(clock.now())}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function DevPanel() {
  const [open, setOpen] = useState(false)
  const [onlyPersona, setOnlyPersona] = useState(false)
  const [, tick] = useState(0)
  const user = useStore((s) => s.user)
  const events = useStore((s) => s.events)
  const { switchPersona, resetPersona, resetAll, refillHearts, clearEvents } = useStore.getState()
  const now = clock.now()
  const [input, setInput] = useState(() => toLocalInput(now))
  const go = (date: Date) => {
    setTime(date)
    setInput(toLocalInput(date))
  }

  // Shift + D (poza polami tekstowymi, żeby nie przeszkadzać w ćwiczeniu „Napisz po angielsku”).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      if (e.shiftKey && e.key.toLowerCase() === 'd' && !typing) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Zegar na żywo w panelu.
  useEffect(() => {
    if (!open) return
    const t = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [open])

  const shown = (onlyPersona ? events.filter((e) => e.persona === user.persona) : events).slice(-50).reverse()
  const refill = heartsRefillAt(user)
  const today = toDayKey(now)
  const at = (day: string, time: string) => new Date(`${day}T${time}:00`)

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Zamknij panel prowadzącego' : 'Otwórz panel prowadzącego (Shift + D)'}
        title="Panel prowadzącego (Shift + D)"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-3 right-3 z-50 rounded border border-white/30 bg-black/60 px-2 py-1 font-mono text-[11px] text-white/80 hover:bg-black/80"
      >
        DEV
      </button>

      {open && (
        <aside
          aria-label="Panel prowadzącego"
          className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[380px] flex-col overflow-y-auto border-l border-white/20 bg-[#16121a] pb-12 font-mono text-[12px] text-white/90"
        >
          <header className="flex items-center justify-between border-b border-white/15 px-4 py-3">
            <strong className="text-[13px]">Panel prowadzącego</strong>
            <span className="text-white/50">Shift + D</span>
          </header>

          <Section title="Persona">
            <div className="flex flex-wrap gap-2">
              {personaIds.map((id) => (
                <Btn
                  key={id}
                  active={user.persona === id}
                  onClick={() => {
                    switchPersona(id)
                    useNav.setState({ tab: 'path', screen: { name: 'tabs' } })
                  }}
                >
                  {id === 'new' ? 'Nowy użytkownik' : `${personaSeeds[id].profile.name} · ${personaSeeds[id].plan}`}
                </Btn>
              ))}
            </div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-white/70">
              <dt>plan</dt>
              <dd>
                {user.plan}
                {user.subscription && ` (płaci: ${user.subscription.payer}, odnowienie ${user.subscription.renewsAt})`}
              </dd>
              <dt>serca</dt>
              <dd>
                {user.hearts ?? '∞'}
                {refill && ` (pełne o ${refill.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })})`}
              </dd>
              <dt>seria</dt>
              <dd>
                {user.streak.current} (rekord {user.streak.longest}, ostatnio {user.streak.lastActiveDate ?? '—'}, zamrożenia {user.streak.freezesLeft})
              </dd>
              <dt>xp</dt>
              <dd>
                {user.xp.total} (tydzień {user.xp.thisWeek}), liga {user.league.tier}
              </dd>
              <dt>lekcja</dt>
              <dd>{user.progress.currentLesson ?? '—'}</dd>
              <dt>cel</dt>
              <dd>
                {user.profile.goal ?? '—'}, {user.profile.ageBand ?? '—'}, {user.profile.dailyGoalMin ?? '—'} min
              </dd>
            </dl>
          </Section>

          <Section title="Symulowany czas">
            <p className="mb-2 text-[14px] text-sun">
              {now.toLocaleString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <div className="mb-2 flex gap-2">
              <input
                type="datetime-local"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded border border-white/30 bg-transparent px-2 py-1 text-white [color-scheme:dark]"
                aria-label="Data i godzina"
              />
              <Btn onClick={() => input && go(new Date(input))}>Ustaw</Btn>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn onClick={() => go(new Date(now.getTime() + 3_600_000))}>+1 h</Btn>
              <Btn onClick={() => go(new Date(now.getTime() + 4 * 3_600_000))}>+4 h</Btn>
              <Btn onClick={() => go(at(today, '18:30'))}>Dziś 18:30</Btn>
              <Btn onClick={() => go(at(addDays(today, 1), '10:00'))}>Jutro 10:00</Btn>
              <Btn onClick={() => go(at(addDays(today, 2), '10:00'))}>Pojutrze 10:00</Btn>
              <Btn onClick={() => go(new Date(DEFAULT_SIM_START))}>Start: 20.10 10:00</Btn>
            </div>
            <p className="mt-2 text-white/50">Zmiana czasu = otwarcie aplikacji o tej porze (seria, serca, liga).</p>
          </Section>

          <Section title="Stan">
            <div className="flex flex-wrap gap-2">
              <Btn onClick={refillHearts}>Odnów serca</Btn>
              <ConfirmBtn label="Reset persony" onConfirm={() => (resetPersona(), useNav.setState({ tab: 'path', screen: { name: 'tabs' } }))} />
              <ConfirmBtn label="Reset wszystkiego" onConfirm={() => (resetAll(), setInput(toLocalInput(clock.now())), useNav.setState({ tab: 'path', screen: { name: 'tabs' } }))} />
            </div>
          </Section>

          <Section title={`Dziennik zdarzeń (${events.length})`}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={onlyPersona} onChange={(e) => setOnlyPersona(e.target.checked)} />
                tylko bieżąca persona
              </label>
              <Btn onClick={() => exportEvents(events)}>Eksport JSON</Btn>
              <ConfirmBtn label="Wyczyść" onConfirm={clearEvents} />
            </div>
            <ol className="space-y-1" aria-live="polite">
              {shown.map((e, i) => (
                <li key={`${e.ts}-${i}`} className="border-l-2 border-white/20 pl-2">
                  <span className="text-white/50">{fmtTime(e.ts)}</span> <span className="text-white/60">{e.persona}</span>{' '}
                  <strong className="text-sun">{e.name}</strong>
                  {e.props && <div className="break-all text-white/60">{JSON.stringify(e.props)}</div>}
                </li>
              ))}
              {!shown.length && <li className="text-white/50">Brak zdarzeń.</li>}
            </ol>
          </Section>
        </aside>
      )}
    </>
  )
}
