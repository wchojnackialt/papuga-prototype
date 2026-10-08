import { StatChip } from '../components/StatChip'

type Props = {
  streak: number
  xp: number
  hearts: number | null
  onStat?: (kind: 'course' | 'streak' | 'xp' | 'hearts') => void
}

function FlagEN() {
  return (
    <svg viewBox="0 0 60 40" className="h-6 w-9 rounded-[4px] border-2 border-ink" aria-hidden>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="7" />
    </svg>
  )
}

// DESIGN.md §4: 56px, flaga kursu · seria · XP · serca, kontur dolny 2px ink.
export function TopBar({ streak, xp, hearts, onStat }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b-2 border-ink bg-paper px-4">
      <button
        type="button"
        aria-label="Kurs: angielski"
        onClick={() => onStat?.('course')}
        className="flex min-h-[44px] items-center rounded-sm px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
      >
        <FlagEN />
      </button>
      <StatChip kind="streak" value={streak} onClick={() => onStat?.('streak')} />
      <StatChip kind="xp" value={xp} onClick={() => onStat?.('xp')} />
      <StatChip kind="hearts" value={hearts} onClick={() => onStat?.('hearts')} />
    </header>
  )
}
