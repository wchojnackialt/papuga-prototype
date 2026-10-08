import { navItems, type TabId } from '../config/nav.config'

type Props = { active: TabId; onChange: (id: TabId) => void }

// DESIGN.md §4: 64px, aktywna zakładka = lavender-soft + shadow-sm.
export function BottomNav({ active, onChange }: Props) {
  return (
    <nav aria-label="Nawigacja" className="flex h-16 shrink-0 items-center gap-1 border-t-2 border-ink bg-paper px-2">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = id === active
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(id)}
            className={`flex h-12 flex-1 flex-col items-center justify-center rounded-sm border-2 text-[11px] font-bold
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender
              ${isActive ? 'border-ink bg-lavender-soft shadow-st-sm' : 'border-transparent text-ink-muted'}`}
          >
            <Icon size={22} weight={isActive ? 'fill' : 'bold'} className={isActive ? 'text-lavender' : ''} aria-hidden />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
