import { X } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { useNav } from '../app/nav'
import { clock } from '../engine/clock'
import { track } from '../engine/track'

const AD_SECONDS = 5

// PRD §4.4: pełnoekranowa reklama w planie darmowym, zamknięcie po 5 s. Celowo poza stylem marki: to „cudza” reklama.
export function AdScreen() {
  const home = useNav((s) => s.home)
  const [left, setLeft] = useState(AD_SECONDS)
  const shownAt = useRef(clock.now())

  const tracked = useRef(false)

  useEffect(() => {
    if (!tracked.current) track('ad_shown') // StrictMode w dev uruchamia efekt dwa razy
    tracked.current = true
    const t = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const close = () => {
    track('ad_closed', { afterSec: Math.round((clock.now().getTime() - shownAt.current.getTime()) / 1000) })
    home()
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-[#1e3a8a] to-[#0ea5e9] p-8 text-center text-white">
      <span className="absolute left-3 top-3 rounded bg-black/40 px-2 py-0.5 text-[11px] font-bold">Reklama</span>
      {left > 0 ? (
        <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-small font-bold" aria-live="polite">
          {left}
        </span>
      ) : (
        <button
          type="button"
          aria-label="Zamknij reklamę"
          onClick={close}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <X size={22} weight="bold" aria-hidden />
        </button>
      )}
      <div className="mb-6 text-[96px] leading-none" aria-hidden>
        🥤
      </div>
      <p className="font-body text-[36px] font-bold leading-tight">FIZZO COLA</p>
      <p className="mt-2 text-[18px] opacity-90">Bąbelki, które dodają energii!</p>
      <span className="mt-8 rounded-full bg-white px-6 py-3 text-[16px] font-bold text-[#1e3a8a]">Sprawdź teraz</span>
    </div>
  )
}
