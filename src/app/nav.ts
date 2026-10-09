import { create } from 'zustand'
import type { TabId } from '../config/nav.config'

// Nawigacja bez routera: prototyp działa w ramce telefonu, a stan ekranu jest prosty i łatwy do rozbudowy.

export type LessonSummary = { lessonId: string; xp: number; mistakes: number; accuracy: number; streak: number }

export type Screen =
  | { name: 'tabs' }
  | { name: 'lesson'; lessonId: string; run: number } // run: nowy przebieg tej samej lekcji = świeży stan
  | { name: 'lessonEnd'; summary: LessonSummary }
  | { name: 'chest'; xp: number }
  | { name: 'ad' }
  | { name: 'streak' }
  | { name: 'paywall'; trigger: 'hearts' | 'streak_freeze' | 'profile_banner' }

type Nav = {
  tab: TabId
  screen: Screen
  setTab: (tab: TabId) => void
  go: (screen: Screen) => void
  home: () => void
}

export const useNav = create<Nav>((set) => ({
  tab: 'path',
  screen: { name: 'tabs' },
  setTab: (tab) => set({ tab, screen: { name: 'tabs' } }),
  go: (screen) => set({ screen }),
  home: () => set({ screen: { name: 'tabs' } }),
}))
