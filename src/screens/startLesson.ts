import { useNav } from '../app/nav'
import { track } from '../engine/track'
import { canStartLesson } from '../engine/rules'
import { useStore } from '../engine/store'

/** Start lekcji z ścieżki. Zwraca false, gdy brak serc (wtedy ekran pokazuje modal). */
export function startLesson(lessonId: string): boolean {
  const store = useStore.getState()
  store.syncHearts()
  if (!canStartLesson(useStore.getState().user)) return false
  track('lesson_started', { lessonId })
  useNav.getState().go({ name: 'lesson', lessonId, run: Date.now() })
  return true
}

export function openPaywall(trigger: 'hearts' | 'streak_freeze' | 'profile_banner') {
  track('paywall_shown', { trigger })
  useNav.getState().go({ name: 'paywall', trigger })
}
