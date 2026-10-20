import { beforeEach, describe, expect, it } from 'vitest'
import { clock } from './clock'
import { useStore } from './store'

const s = () => useStore.getState()

describe('store', () => {
  beforeEach(() => {
    clock.reset()
    s().clearEvents()
  })

  it('przełączenie persony podmienia stan i zapisuje app_opened', () => {
    s().switchPersona('zosia')
    expect(s().user.streak.current).toBe(412)
    s().switchPersona('kuba')
    expect(s().user.hearts).toBe(0)
    expect(s().events.map((e) => [e.persona, e.name])).toEqual([
      ['zosia', 'app_opened'],
      ['kuba', 'app_opened'],
    ])
  })

  it('każda persona pamięta własny stan, reset przywraca dane startowe', () => {
    s().switchPersona('kuba')
    s().refillHearts()
    s().loseHeart()
    s().switchPersona('zosia')
    s().switchPersona('kuba')
    expect(s().user.hearts).toBe(4)
    s().resetPersona()
    expect(s().user.hearts).toBe(0)
  })

  it('lekcja zapisuje zdarzenia z reguł', () => {
    s().switchPersona('new')
    s().resetPersona()
    s().clearEvents()
    s().completeLesson('u1-l1', 0)
    expect(s().events.map((e) => e.name)).toEqual(['streak_extended'])
    expect(s().user.xp.total).toBe(15)
  })
})

describe('przypomnienie o serii', () => {
  beforeEach(() => {
    clock.reset()
    s().clearEvents()
  })

  it('po 18:00 bez dzisiejszej lekcji: modal i zdarzenie streak_reminder_shown', () => {
    s().switchPersona('kuba')
    s().resetPersona()
    expect(s().streakReminder).toBe(false) // 10:00
    clock.set(new Date('2026-10-20T18:30:00'))
    s().appOpened()
    expect(s().streakReminder).toBe(true)
    expect(s().events.at(-1)).toMatchObject({ name: 'streak_reminder_shown', props: { hour: 18 } })
  })

  it('po dzisiejszej lekcji: bez modala', () => {
    s().switchPersona('kuba')
    s().resetPersona()
    s().completeLesson('u1-l3', 0)
    clock.set(new Date('2026-10-20T19:00:00'))
    s().appOpened()
    expect(s().streakReminder).toBe(false)
  })

  it('nowy użytkownik bez serii: bez modala', () => {
    s().switchPersona('new')
    clock.set(new Date('2026-10-20T20:00:00'))
    s().appOpened()
    expect(s().streakReminder).toBe(false)
  })
})
