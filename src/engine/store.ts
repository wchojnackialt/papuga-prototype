import { create } from 'zustand'
import { clock } from './clock'
import { course, DEFAULT_PERSONA, league, personaSeeds } from './content'
import * as rules from './rules'
import { userStateSchema, type Plan, type TrackedEvent, type UserState } from './schema'
import { storage } from './storage'

// Stan aplikacji. Każda persona ma własny zapis w localStorage (`papuga:state:<persona>`, PRD §6.4),
// dziennik zdarzeń jest wspólny (PRD §6.5).

const stateKey = (persona: string) => `papuga:state:${persona}`
const PERSONA_KEY = 'papuga:persona'
const EVENTS_KEY = 'papuga:events'
const MAX_EVENTS = 500

const seed = (persona: string): UserState => structuredClone(personaSeeds[persona] ?? personaSeeds[DEFAULT_PERSONA])

function loadUser(persona: string): UserState {
  const parsed = userStateSchema.safeParse(storage.getJSON(stateKey(persona)))
  return parsed.success ? parsed.data : seed(persona)
}

type Store = {
  user: UserState
  events: TrackedEvent[]

  track: (name: string, props?: Record<string, unknown>) => void
  appOpened: () => void
  switchPersona: (persona: string) => void
  resetPersona: () => void
  clearEvents: () => void

  completeOnboarding: (answers: Parameters<typeof rules.completeOnboarding>[1]) => void
  completeLesson: (lessonId: string, mistakes: number) => number
  openChest: (chestId: string) => number
  loseHeart: () => void
  /** Odnowienie serc, jeśli minęły 4 h (reguła z zegara). */
  syncHearts: () => void
  /** Pełne serca od ręki (panel prowadzącego). */
  refillHearts: () => void
  startTrial: (plan: Exclude<Plan, 'free'>) => void
}

export const useStore = create<Store>((set, get) => {
  const initialPersona = storage.getJSON<string>(PERSONA_KEY) ?? DEFAULT_PERSONA

  /** Zapisuje wynik reguły i jej zdarzenia. */
  const apply = ({ state, events }: rules.RuleResult) => {
    set({ user: state })
    storage.setJSON(stateKey(state.persona), state)
    events.forEach((e) => get().track(e.name, e.props))
  }

  return {
    user: loadUser(initialPersona),
    events: storage.getJSON<TrackedEvent[]>(EVENTS_KEY) ?? [],

    track(name, props) {
      const event: TrackedEvent = { ts: clock.now().toISOString(), persona: get().user.persona, name, ...(props && { props }) }
      const events = [...get().events, event].slice(-MAX_EVENTS)
      set({ events })
      storage.setJSON(EVENTS_KEY, events)
    },

    appOpened() {
      get().track('app_opened')
      apply(rules.onAppOpen(get().user, clock.now(), league))
    },

    switchPersona(persona) {
      storage.setJSON(PERSONA_KEY, persona)
      set({ user: loadUser(persona) })
      get().appOpened()
    },

    resetPersona() {
      const { persona } = get().user
      storage.remove(stateKey(persona))
      set({ user: seed(persona) })
      get().appOpened()
    },

    clearEvents() {
      set({ events: [] })
      storage.remove(EVENTS_KEY)
    },

    completeOnboarding(answers) {
      apply(rules.completeOnboarding(get().user, answers))
    },

    completeLesson(lessonId, mistakes) {
      const result = rules.completeLesson(get().user, { lessonId, mistakes, today: clock.today(), course })
      apply(result)
      return result.xpGained
    },

    openChest(chestId) {
      const result = rules.openChest(get().user, { chestId, today: clock.today(), course })
      apply(result)
      return result.xpGained
    },

    loseHeart() {
      apply(rules.loseHeart(get().user, clock.now()))
    },

    syncHearts() {
      const user = get().user
      const next = rules.refillHearts(user, clock.now())
      if (next !== user) apply({ state: next, events: [] })
    },

    refillHearts() {
      const user = get().user
      if (user.hearts === null) return
      apply({ state: { ...user, hearts: rules.RULES.maxHearts, heartsLostAt: null }, events: [] })
    },

    startTrial(plan) {
      apply(rules.startTrial(get().user, plan, clock.today()))
    },
  }
})
