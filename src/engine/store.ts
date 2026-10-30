import { create } from 'zustand'
import { clock } from './clock'
import { classroom, course, DEFAULT_PERSONA, league, personaSeeds } from './content'
import * as rules from './rules'
import { userStateSchema, type Plan, type TrackedEvent, type UserState, type WordList } from './schema'
import { storage } from './storage'
import * as lists from './wordLists'

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
  /** Modal „Twoja seria jest zagrożona!” do pokazania po otwarciu aplikacji (PRD §4.6). */
  streakReminder: boolean

  track: (name: string, props?: Record<string, unknown>) => void
  appOpened: () => void
  switchPersona: (persona: string) => void
  resetPersona: () => void
  /** Czyści wszystkie persony, dziennik i zegar (panel prowadzącego). */
  resetAll: () => void
  clearEvents: () => void
  dismissStreakReminder: () => void

  completeOnboarding: (answers: Parameters<typeof rules.completeOnboarding>[1]) => void
  completeLesson: (lessonId: string, mistakes: number) => number
  openChest: (chestId: string) => number
  loseHeart: () => void
  /** Odnowienie serc, jeśli minęły 4 h (reguła z zegara). */
  syncHearts: () => void
  /** Pełne serca od ręki (panel prowadzącego). */
  refillHearts: () => void
  startTrial: (plan: Exclude<Plan, 'free'>) => void

  // Moje listy
  createList: (list: Omit<WordList, 'shared'>) => void
  updateList: (list: WordList) => void
  deleteList: (listId: string) => void
  setShared: (listId: string, shared: boolean) => void
  completeListPractice: (answers: { key: string; correct: boolean }[]) => void
  /** Zwraca false przy złym kodzie. */
  joinClass: (code: string) => boolean
  leaveClass: () => void
  /** Zgoda rodzica na klasy (panel testowy). */
  setParentConsent: (consent: boolean) => void
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
    streakReminder: false,

    track(name, props) {
      const event: TrackedEvent = { ts: clock.now().toISOString(), persona: get().user.persona, name, ...(props && { props }) }
      const events = [...get().events, event].slice(-MAX_EVENTS)
      set({ events })
      storage.setJSON(EVENTS_KEY, events)
    },

    appOpened() {
      get().track('app_opened')
      apply(rules.onAppOpen(get().user, clock.now(), league))
      const now = clock.now()
      const remind = get().user.onboarded && rules.isStreakAtRisk(get().user, now)
      set({ streakReminder: remind })
      if (remind) get().track('streak_reminder_shown', { hour: now.getHours() })
    },

    dismissStreakReminder() {
      set({ streakReminder: false })
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

    resetAll() {
      for (const persona of Object.keys(personaSeeds)) storage.remove(stateKey(persona))
      storage.remove(EVENTS_KEY)
      clock.reset()
      set({ user: seed(get().user.persona), events: [] })
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

    createList(list) {
      apply(lists.createList(get().user, list))
    },

    updateList(list) {
      apply(lists.updateList(get().user, list))
    },

    deleteList(listId) {
      apply(lists.deleteList(get().user, listId))
    },

    setShared(listId, shared) {
      apply(lists.setShared(get().user, listId, shared))
    },

    completeListPractice(answers) {
      apply(rules.completeListPractice(get().user, { answers, today: clock.today() }))
    },

    joinClass(code) {
      if (!lists.codeMatches(code, classroom)) return false
      apply(lists.joinClass(get().user, classroom))
      return true
    },

    leaveClass() {
      apply(lists.leaveClass(get().user))
    },

    setParentConsent(parentConsent) {
      const user = get().user
      apply({ state: { ...user, classroom: { ...user.classroom, parentConsent } }, events: [] })
    },
  }
})
