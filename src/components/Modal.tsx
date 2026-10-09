import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose?: () => void
  title: string
  children: ReactNode
}

// DESIGN.md §5: r-lg, shadow-lg, przyciemnione tło rgba(43,34,48,.6). Renderowany wewnątrz ramki telefonu.
export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Fokus w oknie, Tab krąży tylko po jego przyciskach, Esc zamyka, po zamknięciu fokus wraca na poprzedni element.
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    ref.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose?.()
      if (e.key !== 'Tab' || !ref.current) return
      const items = [...ref.current.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input, textarea')]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus?.({ preventScroll: true })
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[rgba(43,34,48,.6)] p-4" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="sticker w-full rounded-lg bg-surface p-6 shadow-st-lg outline-none animate-[pop_200ms_cubic-bezier(.2,.8,.2,1)]"
      >
        <h2 className="mb-3 font-head text-h1">{title}</h2>
        {children}
      </div>
    </div>
  )
}
