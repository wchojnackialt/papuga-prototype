import { toDayKey, type DayKey } from './dates'
import { storage } from './storage'

// Symulowany zegar (PRD §4.10). Cała logika czasu w aplikacji bierze „teraz” stąd, nigdy z Date.now().
// Zegar płynie: simNow = base + (realny czas od ustawienia), więc np. czas trwania lekcji jest prawdziwy.

const KEY = 'papuga:clock'
export const DEFAULT_SIM_START = '2026-10-20T10:00:00' // dzień startu programu, wtorek

type ClockState = { base: number; setAt: number }

let state: ClockState = load()
const listeners = new Set<() => void>()

function load(): ClockState {
  const saved = storage.getJSON<ClockState>(KEY)
  return saved ?? { base: new Date(DEFAULT_SIM_START).getTime(), setAt: Date.now() }
}

export const clock = {
  now(): Date {
    return new Date(state.base + (Date.now() - state.setAt))
  },
  today(): DayKey {
    return toDayKey(clock.now())
  },
  set(date: Date) {
    state = { base: date.getTime(), setAt: Date.now() }
    storage.setJSON(KEY, state)
    listeners.forEach((l) => l())
  },
  advance(ms: number) {
    clock.set(new Date(clock.now().getTime() + ms))
  },
  reset() {
    clock.set(new Date(DEFAULT_SIM_START))
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
