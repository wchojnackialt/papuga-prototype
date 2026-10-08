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
    expect(s().user.hearts).toBe(2)
    expect(s().events.map((e) => [e.persona, e.name])).toEqual([
      ['zosia', 'app_opened'],
      ['kuba', 'app_opened'],
    ])
  })

  it('każda persona pamięta własny stan, reset przywraca dane startowe', () => {
    s().switchPersona('kuba')
    s().loseHeart()
    s().switchPersona('zosia')
    s().switchPersona('kuba')
    expect(s().user.hearts).toBe(1)
    s().resetPersona()
    expect(s().user.hearts).toBe(2)
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
