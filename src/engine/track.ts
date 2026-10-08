import { useStore } from './store'

/** Punkt rozbudowy (PRD §7 „Dziennik zdarzeń”): każda akcja z PRD §6.5 przechodzi tędy. */
export const track = (name: string, props?: Record<string, unknown>) => useStore.getState().track(name, props)
