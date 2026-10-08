import type { ReactNode } from 'react'

// DESIGN.md §4: ramka 390×844 wyśrodkowana na desktopie (niższa, gdy okno jest niższe); na telefonie pełny ekran (PRD §8).
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center sm:p-6">
      <div
        className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-paper
          sm:h-[min(844px,calc(100dvh-48px))] sm:w-[390px] sm:rounded-[44px] sm:border-2 sm:border-ink sm:shadow-[0_0_0_10px_#3d3343]"
      >
        {children}
      </div>
    </div>
  )
}
