import { Check, Heart, Prohibit, Repeat, Snowflake } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNav } from '../app/nav'
import { Button } from '../components/Button'
import { Mascot } from '../components/Mascot'
import { ScreenHeader } from '../components/ScreenHeader'
import type { Plan } from '../engine/schema'
import { useStore } from '../engine/store'

type PaidPlan = Exclude<Plan, 'free'>

const benefits = [
  { Icon: Prohibit, text: 'Bez reklam' },
  { Icon: Heart, text: 'Nielimitowane serca' },
  { Icon: Snowflake, text: 'Zamrożenie serii' },
  { Icon: Repeat, text: 'Powtórka błędów' },
]

const planCards: { id: PaidPlan; title: string; price: string; note: string; badge?: string; after: string }[] = [
  { id: 'monthly', title: 'Miesięczny', price: '29,99 zł', note: 'miesięcznie', after: '29,99 zł miesięcznie' },
  { id: 'annual', title: 'Roczny', price: '199 zł', note: '16,58 zł/mies.', badge: 'Najpopularniejszy', after: '199 zł rocznie' },
  { id: 'family', title: 'Rodzinny', price: '299 zł', note: 'rocznie, do 6 kont', after: '299 zł rocznie' },
]

// PlanCard (DESIGN.md §5): wybrany plan = kontur 3px lavender. PRD §4.9: trial bez płatności zmienia plan na Plus.
export function PaywallScreen() {
  const home = useNav((s) => s.home)
  const startTrial = useStore((s) => s.startTrial)
  const [plan, setPlan] = useState<PaidPlan>('annual')
  const [done, setDone] = useState(false)
  const selected = planCards.find((p) => p.id === plan)!

  if (done) {
    return (
      <div className="animate-screen flex flex-1 flex-col items-center px-4 pb-6 pt-24 text-center">
        <Mascot mood="happy" size={120} />
        <h1 className="mt-6 font-head text-display">Witaj w Plus!</h1>
        <p className="mt-3 text-body">Masz 7 dni za darmo. Serca bez limitu, zero reklam.</p>
        <div className="mt-auto w-full">
          <Button variant="action" onClick={home}>
            Dalej
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-lavender-soft">
      <ScreenHeader onBack={home} close />
      <div className="flex flex-1 flex-col px-4 pb-6">
        <div className="flex items-center gap-4">
          <Mascot size={72} />
          <h1 className="font-head text-h1">Papuga Plus</h1>
        </div>

        <ul className="mt-5 space-y-2">
          {benefits.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3 font-bold">
              <span className="sticker flex h-9 w-9 items-center justify-center rounded-sm bg-sun">
                <Icon size={20} weight="bold" aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div role="radiogroup" aria-label="Plan" className="mt-6 space-y-3">
          {planCards.map((p) => {
            const isSel = p.id === plan
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => setPlan(p.id)}
                className={`relative flex min-h-[64px] w-full items-center gap-3 rounded-md bg-surface px-4 py-3 text-left shadow-st-md
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender
                  ${isSel ? 'border-[3px] border-lavender' : 'border-2 border-ink'}`}
              >
                {p.badge && (
                  <span className="sticker absolute -top-3 right-3 rounded-sm bg-coral px-2 py-0.5 text-label-caps">{p.badge}</span>
                )}
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${isSel ? 'border-lavender bg-lavender text-white' : 'border-ink'}`}>
                  {isSel && <Check size={14} weight="bold" aria-hidden />}
                </span>
                <span className="flex-1">
                  <span className="block font-bold">{p.title}</span>
                  <span className="text-small text-ink-muted">{p.note}</span>
                </span>
                <span className="font-head text-stat">{p.price}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-auto pt-6">
          <Button
            variant="action"
            onClick={() => {
              startTrial(plan)
              setDone(true)
            }}
          >
            Wypróbuj 7 dni za darmo
          </Button>
          <p className="mt-2 text-center text-small text-ink-muted">Potem {selected.after}. Anulujesz w każdej chwili.</p>
        </div>
      </div>
    </div>
  )
}
