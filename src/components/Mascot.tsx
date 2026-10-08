// Maskotka Pola (DESIGN.md §3): zaślepka emoji w naklejce. Stany: neutralna, cieszy się, smutna, przypomina o serii.
export type MascotMood = 'neutral' | 'happy' | 'sad' | 'reminder'

const moodBadge: Record<MascotMood, string | null> = { neutral: null, happy: '⭐', sad: '💧', reminder: '🔥' }

export function Mascot({ mood = 'neutral', size = 72, className = '' }: { mood?: MascotMood; size?: number; className?: string }) {
  const badge = moodBadge[mood]
  return (
    <div
      role="img"
      aria-label="Pola, papuga"
      className={`sticker relative flex shrink-0 items-center justify-center rounded-full bg-surface shadow-st-md
        ${mood === 'happy' ? 'animate-bounce-once' : ''} ${mood === 'sad' ? 'grayscale-[40%]' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      <span aria-hidden className={mood === 'sad' ? '-scale-x-100' : ''}>🦜</span>
      {badge && (
        <span aria-hidden className="absolute -right-1 -top-1 text-[0.4em]">
          {badge}
        </span>
      )}
    </div>
  )
}
