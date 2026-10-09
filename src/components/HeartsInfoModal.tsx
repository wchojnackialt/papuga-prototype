import { Heart } from '@phosphor-icons/react'
import { heartsRefillAt, RULES } from '../engine/rules'
import { useStore } from '../engine/store'
import { Button } from './Button'
import { Modal } from './Modal'

const hhmm = (d: Date) => d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })

/** Szczegóły serc po kliknięciu w pasku górnym (StatChip „po kliknięciu otwiera szczegóły”, DESIGN.md §5). */
export function HeartsInfoModal({ open, onClose, onPlus }: { open: boolean; onClose: () => void; onPlus: () => void }) {
  const user = useStore((s) => s.user)
  const at = heartsRefillAt(user)
  const plus = user.hearts === null
  return (
    <Modal open={open} onClose={onClose} title={plus ? 'Nielimitowane serca' : 'Serca'}>
      <div className="mb-4 flex justify-center gap-1" aria-label={plus ? 'Bez limitu' : `${user.hearts} z ${RULES.maxHearts}`}>
        {Array.from({ length: RULES.maxHearts }, (_, i) => (
          <Heart key={i} size={32} weight="fill" className={`icon-ink ${plus || i < (user.hearts ?? 0) ? 'text-heart' : 'text-locked'}`} aria-hidden />
        ))}
      </div>
      <p className="mb-5 text-body">
        {plus
          ? 'Masz Papuga Plus: błędy nie zabierają serc.'
          : `Każdy błąd zabiera serce. ${at ? `Pełne serca wrócą o ${hhmm(at)}.` : 'Masz komplet.'}`}
      </p>
      <div className="space-y-3">
        {!plus && (
          <Button variant="action" onClick={onPlus}>
            Nielimitowane serca z Plus
          </Button>
        )}
        <Button variant="ghost" onClick={onClose}>
          OK
        </Button>
      </div>
    </Modal>
  )
}
