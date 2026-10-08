import { Button } from '../components/Button'

/** Przycisk „Sprawdź” w dolnej części ekranu (kciuk i jedna ręka, DESIGN.md §2). */
export function CheckButton({ disabled, onClick, hidden }: { disabled: boolean; onClick: () => void; hidden?: boolean }) {
  return (
    <div className={`mt-auto pt-4 ${hidden ? 'invisible' : ''}`}>
      <Button variant="primary" disabled={disabled} onClick={onClick}>
        Sprawdź
      </Button>
    </div>
  )
}
