import { Diamond, Fire, Heart, Lightning } from '@phosphor-icons/react'
import { formatNumber } from '../engine/format'

export type StatKind = 'streak' | 'xp' | 'hearts' | 'gems-off'

type Props = {
  kind: StatKind
  // hearts: null = bez limitu (Papuga Plus), PRD §6.4
  value: number | null
  onClick?: () => void
}

const config = {
  streak: { Icon: Fire, color: 'text-flame', label: 'Seria' },
  xp: { Icon: Lightning, color: 'text-sun', label: 'XP' },
  hearts: { Icon: Heart, color: 'text-heart', label: 'Serca' },
  'gems-off': { Icon: Diamond, color: 'text-ink-muted', label: 'Klejnoty' },
} satisfies Record<StatKind, unknown>

export function StatChip({ kind, value, onClick }: Props) {
  const { Icon, color, label } = config[kind]
  const shown = value === null ? '∞' : formatNumber(value)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${shown}`}
      className="flex min-h-[44px] items-center gap-1 rounded-sm px-2 font-head text-stat
        hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
    >
      <Icon weight="fill" size={24} className={`${color} icon-ink`} aria-hidden />
      <span>{shown}</span>
    </button>
  )
}
