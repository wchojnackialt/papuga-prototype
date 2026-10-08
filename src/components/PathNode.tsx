import { Gift, Lock, Play, Star } from '@phosphor-icons/react'

export type PathNodeState = 'done' | 'current' | 'locked'

// DESIGN.md §5: done (lime, gwiazdka), current (coral, ▶ + dymek START), locked (locked, przerywany), chest (sun, prezent). 64px.
export function PathNode({
  state,
  chest,
  label,
  onClick,
}: {
  state: PathNodeState
  chest: boolean
  label: string
  onClick: () => void
}) {
  const look =
    state === 'locked'
      ? 'bg-locked border-dashed shadow-none text-ink-muted'
      : chest
        ? 'bg-sun press-md'
        : state === 'done'
          ? 'bg-lime press-md'
          : 'bg-coral press-lg'
  const Icon = chest ? Gift : state === 'done' ? Star : state === 'current' ? Play : Lock
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`sticker relative flex h-16 w-16 items-center justify-center rounded-node
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lavender ${look}`}
    >
      <Icon size={30} weight={state === 'locked' ? 'bold' : 'fill'} aria-hidden />
      {state === 'current' && (
        <span className="sticker animate-bob absolute -top-11 left-1/2 whitespace-nowrap rounded-sm bg-surface px-3 py-1 text-label-caps shadow-st-sm">
          {chest ? 'Otwórz' : 'Start'}
        </span>
      )}
    </button>
  )
}
