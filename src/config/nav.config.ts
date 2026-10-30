import { ListChecks, Notebook, Path, Trophy, User, type Icon } from '@phosphor-icons/react'

export type TabId = 'path' | 'league' | 'quests' | 'lists' | 'profile' | (string & {})

export type NavItem = { id: TabId; label: string; icon: Icon }

// PRD §7 „Piąta zakładka”: nową zakładkę (np. „Moje materiały”, „Rozmowy”) dodajemy tutaj,
// między Zadaniami a Profilem. Dolny pasek dzieli szerokość równo, więc 5 pozycji mieści się bez zmian w układzie.
export const navItems: NavItem[] = [
  { id: 'path', label: 'Ścieżka', icon: Path },
  { id: 'league', label: 'Liga', icon: Trophy },
  { id: 'quests', label: 'Zadania', icon: ListChecks },
  { id: 'lists', label: 'Moje listy', icon: Notebook },
  { id: 'profile', label: 'Profil', icon: User },
]
