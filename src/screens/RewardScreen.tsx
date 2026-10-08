import { Fire, Lightning, Target } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Button } from '../components/Button'
import { Confetti } from '../components/Confetti'
import { useCountUp, useFocusOnMount } from '../components/hooks'
import { Mascot } from '../components/Mascot'
import { formatNumber } from '../engine/format'

type Stat = { kind: 'xp' | 'streak' | 'accuracy'; value: number }

const statLook = {
  xp: { label: 'Zdobyte XP', Icon: Lightning, bg: 'bg-sun', prefix: '+', suffix: '' },
  streak: { label: 'Dni serii', Icon: Fire, bg: 'bg-coral-soft', prefix: '', suffix: '' },
  accuracy: { label: 'Poprawne', Icon: Target, bg: 'bg-lime', prefix: '', suffix: '%' },
} as const

function StatCard({ kind, value, delay }: Stat & { delay: number }) {
  const { label, Icon, bg, prefix, suffix } = statLook[kind]
  const shown = useCountUp(value, 600, delay)
  return (
    <div className={`sticker flex flex-1 flex-col items-center gap-1 rounded-md p-3 shadow-st-md ${bg}`}>
      <span className="text-label-caps">{label}</span>
      <span className="flex items-center gap-1 font-head text-stat">
        <Icon size={20} weight="fill" className={kind === 'streak' ? 'text-flame' : ''} aria-hidden />
        {prefix}
        {formatNumber(shown)}
        {suffix}
      </span>
    </div>
  )
}

// RewardScreen (DESIGN.md §5): maskotka, Display, 3 karty statystyk, nudge, CTA. „Nagradzaj głośno” (as-is).
export function RewardScreen({ title, stats, nudge, onContinue }: { title: string; stats: Stat[]; nudge?: ReactNode; onContinue: () => void }) {
  const focusRef = useFocusOnMount<HTMLButtonElement>()
  return (
    <div className="animate-screen relative flex flex-1 flex-col items-center px-4 pb-6 pt-12 text-center">
      <Confetti />
      <Mascot mood="happy" size={120} />
      <h1 className="mt-6 font-head text-display">{title}</h1>
      <div className="mt-8 flex w-full gap-3">
        {stats.map((s, i) => (
          <StatCard key={s.kind} {...s} delay={200 + i * 150} />
        ))}
      </div>
      {nudge && <div className="mt-6 w-full text-left">{nudge}</div>}
      <div className="mt-auto w-full pt-6">
        <Button variant="action" onClick={onContinue} ref={focusRef}>
          Dalej
        </Button>
      </div>
    </div>
  )
}
