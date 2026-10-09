import { ArrowLeft, X } from '@phosphor-icons/react'

/** Nagłówek ekranu pełnoekranowego (seria, paywall): powrót albo zamknięcie. */
export function ScreenHeader({ title, onBack, close }: { title?: string; onBack: () => void; close?: boolean }) {
  const Icon = close ? X : ArrowLeft
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-2">
      <button
        type="button"
        aria-label={close ? 'Zamknij' : 'Wróć'}
        onClick={onBack}
        className="flex h-11 w-11 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
      >
        <Icon size={26} weight="bold" aria-hidden />
      </button>
      {title && <h1 className="font-head text-h2">{title}</h1>}
    </header>
  )
}
