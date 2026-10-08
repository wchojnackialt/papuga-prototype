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

  useEffect(() => {
    if (!open) return
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
