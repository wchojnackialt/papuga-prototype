import { Heart, Star } from '@phosphor-icons/react'
import { useState } from 'react'
import { usePrefersReducedMotion } from './hooks'

const colors = ['text-coral', 'text-sun', 'text-lime', 'text-lavender', 'text-flame']

/** Konfetti z naklejek (gwiazdki, serca), ok. 1,2 s. Wyłączone przy prefers-reduced-motion. */
export function Confetti({ count = 26 }: { count?: number }) {
  const reduced = usePrefersReducedMotion()
  const [pieces] = useState(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 300,
        duration: 900 + Math.random() * 500,
        size: 16 + Math.random() * 14,
        Icon: i % 3 === 0 ? Heart : Star,
        color: colors[i % colors.length],
      })),
  )
  if (reduced) return null
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {pieces.map(({ id, left, delay, duration, size, Icon, color }) => (
        <Icon
          key={id}
          weight="fill"
          size={size}
          className={`absolute top-0 ${color} drop-shadow-[1.5px_1.5px_0_var(--ink)]`}
          style={{ left: `${left}%`, animation: `confetti ${duration}ms cubic-bezier(.2,.8,.2,1) ${delay}ms forwards`, opacity: 0 }}
        />
      ))}
    </div>
  )
}
