import type { ReactNode } from 'react'

// DESIGN.md §5: coral-soft, kontur, pogrubiony tekst. Celowo natarczywy (stan as-is).
export function Nudge({ icon, children }: { variant: 'streak' | 'league' | 'quest' | 'plus'; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="sticker flex items-center gap-3 rounded-md bg-coral-soft p-3 font-bold shadow-st-sm">
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <p className="text-small">{children}</p>
    </div>
  )
}
