import { useEffect, useRef, useState } from 'react'

export function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches)
  useEffect(() => {
    const mq = matchMedia(query)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** Liczby XP i serii „odliczają” w górę (DESIGN.md §3, 600 ms). */
export function useCountUp(target: number, durationMs = 600, delayMs = 0): number {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (reduced) return
    let frame = 0
    const start = performance.now() + delayMs
    const step = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / durationMs))
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, delayMs, reduced])
  return reduced ? target : value
}

/**
 * Fokus po zamontowaniu bez przewijania. Zwykły `autoFocus` w ramce z overflow:hidden przesuwa całą ramkę telefonu.
 */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])
  return ref
}
