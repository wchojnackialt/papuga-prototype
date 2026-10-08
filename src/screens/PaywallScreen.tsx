import { X } from '@phosphor-icons/react'
import { useNav } from '../app/nav'
import { Button } from '../components/Button'
import { useStore } from '../engine/store'

// Tymczasowy paywall (etap 3), żeby działały wyzwalacze. Pełny ekran z planami powstaje w etapie 4 (PRD §4.9).
export function PaywallScreen() {
  const home = useNav((s) => s.home)
  const startTrial = useStore((s) => s.startTrial)
  return (
    <div className="flex flex-1 flex-col bg-lavender-soft px-4 pb-6 pt-4">
      <button type="button" aria-label="Zamknij" onClick={home} className="flex h-11 w-11 items-center justify-center">
        <X size={26} weight="bold" aria-hidden />
      </button>
      <h1 className="mt-6 font-head text-display">Papuga Plus</h1>
      <p className="mt-2 text-body">Bez reklam, nielimitowane serca, zamrożenie serii.</p>
      <p className="mt-4 text-small text-ink-muted">Pełny ekran z planami: etap 4.</p>
      <div className="mt-auto">
        <Button
          variant="action"
          onClick={() => {
            startTrial('annual')
            home()
          }}
        >
          Wypróbuj 7 dni za darmo
        </Button>
      </div>
    </div>
  )
}
