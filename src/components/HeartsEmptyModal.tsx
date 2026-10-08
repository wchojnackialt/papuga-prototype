import { Heart } from '@phosphor-icons/react'
import { heartsRefillAt } from '../engine/rules'
import { useStore } from '../engine/store'
import { Button } from './Button'
import { Modal } from './Modal'

const hhmm = (d: Date) => d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })

// PRD §4.3: 0 serc w planie darmowym → Papuga Plus (paywall) albo „Poczekaj 4 godziny”.
export function HeartsEmptyModal({ open, onPlus, onWait }: { open: boolean; onPlus: () => void; onWait: () => void }) {
  const user = useStore((s) => s.user)
  const at = heartsRefillAt(user)
  return (
    <Modal open={open} onClose={onWait} title="Skończyły Ci się serca">
      <div className="mb-4 flex justify-center gap-1" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Heart key={i} size={32} weight="fill" className="text-locked" />
        ))}
      </div>
      <p className="mb-5 text-body">
        Bez serc nie zaczniesz lekcji. {at ? `Wrócą o ${hhmm(at)}.` : 'Wrócą za 4 godziny.'} Z Papuga Plus masz nielimitowane serca.
      </p>
      <div className="space-y-3">
        <Button variant="action" onClick={onPlus}>
          Papuga Plus
        </Button>
        <Button variant="ghost" onClick={onWait}>
          Poczekaj 4 godziny
        </Button>
      </div>
    </Modal>
  )
}
