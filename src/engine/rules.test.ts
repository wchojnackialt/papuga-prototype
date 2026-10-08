import { describe, expect, it } from 'vitest'
import { course, league, personaSeeds } from './content'
import * as r from './rules'
import type { UserState } from './schema'

const at = (iso: string) => new Date(iso)
const persona = (id: string): UserState => structuredClone(personaSeeds[id])

describe('XP', () => {
  it('10 za lekcję, +5 bez błędów', () => {
    expect(r.lessonXp(0)).toBe(15)
    expect(r.lessonXp(2)).toBe(10)
  })

  it('XP trafia do sumy i do tygodnia', () => {
    const { state, xpGained } = r.completeLesson(persona('zosia'), { lessonId: 'u2-l2', mistakes: 0, today: '2026-10-20', course })
    expect(xpGained).toBe(15)
    expect(state.xp.total).toBe(12495)
    expect(state.xp.thisWeek).toBe(355)
  })
})

describe('postęp na ścieżce', () => {
  it('ukończenie bieżącej lekcji odblokowuje następny węzeł', () => {
    const { state } = r.completeLesson(persona('new'), { lessonId: 'u1-l1', mistakes: 1, today: '2026-10-20', course })
    expect(state.progress.completedLessons).toContain('u1-l1')
    expect(state.progress.currentLesson).toBe('u1-l2')
  })

  it('powtórka ukończonej lekcji nie przesuwa ścieżki', () => {
    const { state } = r.completeLesson(persona('zosia'), { lessonId: 'u1-l1', mistakes: 0, today: '2026-10-20', course })
    expect(state.progress.currentLesson).toBe('u2-l2')
  })

  it('po skrzynce U1 bieżąca jest U2-L1', () => {
    const s = { ...persona('new'), progress: { completedLessons: ['u1-l1', 'u1-l2', 'u1-l3', 'u1-l4'], currentLesson: 'u1-chest' } }
    const { state, xpGained } = r.openChest(s, { chestId: 'u1-chest', today: '2026-10-20', course })
    expect(xpGained).toBe(r.RULES.chestXp)
    expect(state.progress.currentLesson).toBe('u2-l1')
  })

  it('po skrzynce U2 nie ma bieżącej lekcji, bo U3 jest zablokowana', () => {
    expect(r.nextNode(course, 'u2-chest')).toBeNull()
  })

  it('statusy węzłów', () => {
    const z = persona('zosia')
    expect(r.nodeStatus(z, 'u1-l3')).toBe('done')
    expect(r.nodeStatus(z, 'u2-l2')).toBe('current')
    expect(r.nodeStatus(z, 'u2-l3')).toBe('locked')
  })
})

describe('seria', () => {
  it('+1 przy pierwszej lekcji dnia, nie przy drugiej', () => {
    const first = r.completeLesson(persona('kuba'), { lessonId: 'u1-l3', mistakes: 0, today: '2026-10-20', course })
    expect(first.state.streak.current).toBe(4)
    expect(first.events).toContainEqual({ name: 'streak_extended', props: { current: 4 } })
    const second = r.completeLesson(first.state, { lessonId: 'u1-l4', mistakes: 0, today: '2026-10-20', course })
    expect(second.state.streak.current).toBe(4)
    expect(second.events).toEqual([])
  })

  it('pierwsza lekcja nowego użytkownika zaczyna serię od 1', () => {
    const { state } = r.completeLesson(persona('new'), { lessonId: 'u1-l1', mistakes: 0, today: '2026-10-20', course })
    expect(state.streak).toMatchObject({ current: 1, longest: 1, lastActiveDate: '2026-10-20' })
  })

  it('rekord rośnie razem z serią', () => {
    const { state } = r.completeLesson(persona('zosia'), { lessonId: 'u2-l2', mistakes: 0, today: '2026-10-20', course })
    expect(state.streak.longest).toBe(413)
  })

  it('dzień po aktywności seria trwa', () => {
    const { state, events } = r.rollStreak(persona('kuba'), '2026-10-20')
    expect(state.streak.current).toBe(3)
    expect(events).toEqual([])
  })

  it('pominięty dzień bez zamrożenia zrywa serię (plan darmowy)', () => {
    const { state, events } = r.rollStreak(persona('kuba'), '2026-10-21')
    expect(state.streak.current).toBe(0)
    expect(events).toEqual([{ name: 'streak_broken', props: { current: 3 } }])
  })

  it('Plus: zamrożenie pokrywa jeden pominięty dzień', () => {
    const { state, events } = r.rollStreak(persona('zosia'), '2026-10-21')
    expect(state.streak.current).toBe(412)
    expect(state.streak.frozenDates).toEqual(['2026-10-20'])
    expect(state.streak.freezesLeft).toBe(0)
    expect(events).toEqual([])
  })

  it('Plus: drugi pominięty dzień bez zamrożenia zrywa serię', () => {
    const { state } = r.rollStreak(persona('zosia'), '2026-10-22')
    expect(state.streak.current).toBe(0)
  })

  it('ponowne otwarcie po zamrożeniu nie zużywa kolejnego', () => {
    const once = r.rollStreak(persona('zosia'), '2026-10-21').state
    const twice = r.rollStreak(once, '2026-10-21').state
    expect(twice.streak.freezesLeft).toBe(0)
    expect(twice.streak.current).toBe(412)
  })

  it('zagrożona po 18:00, jeśli dziś nie było lekcji', () => {
    expect(r.isStreakAtRisk(persona('kuba'), at('2026-10-20T17:59:00'))).toBe(false)
    expect(r.isStreakAtRisk(persona('kuba'), at('2026-10-20T18:00:00'))).toBe(true)
    expect(r.isStreakAtRisk(persona('new'), at('2026-10-20T20:00:00'))).toBe(false)
  })
})

describe('serca', () => {
  it('plan darmowy: −1 za błąd, przy 0 zdarzenie hearts_depleted', () => {
    const one = r.loseHeart(persona('kuba'), at('2026-10-20T10:00:00'))
    expect(one.state.hearts).toBe(1)
    expect(one.events).toEqual([{ name: 'heart_lost', props: { heartsLeft: 1 } }])
    const zero = r.loseHeart(one.state, at('2026-10-20T10:01:00'))
    expect(zero.state.hearts).toBe(0)
    expect(zero.events.map((e) => e.name)).toEqual(['heart_lost', 'hearts_depleted'])
    expect(r.canStartLesson(zero.state)).toBe(false)
  })

  it('Plus: serca bez limitu', () => {
    const { state, events } = r.loseHeart(persona('zosia'), at('2026-10-20T10:00:00'))
    expect(state.hearts).toBeNull()
    expect(events).toEqual([])
  })

  it('odnowienie do pełna 4 h po ostatniej utracie', () => {
    const kuba = persona('kuba') // stracił serce o 9:15
    expect(r.refillHearts(kuba, at('2026-10-20T13:14:00')).hearts).toBe(2)
    expect(r.refillHearts(kuba, at('2026-10-20T13:15:00')).hearts).toBe(5)
  })
})

describe('liga', () => {
  it('30 osób, Zosia 4. w Diamencie', () => {
    const rows = r.leagueStandings(persona('zosia'), league)
    expect(rows).toHaveLength(30)
    expect(r.myLeagueRank(persona('zosia'), league)).toBe(4)
  })

  it('strefy: awans top 7, spadek ostatnie 5', () => {
    const rows = r.leagueStandings(persona('zosia'), league)
    expect(rows.filter((x) => x.zone === 'promote')).toHaveLength(7)
    expect(rows.filter((x) => x.zone === 'demote')).toHaveLength(5)
  })

  it('XP z lekcji przesuwa w rankingu', () => {
    const z = persona('zosia')
    const more = { ...z, xp: { ...z.xp, thisWeek: 400 } }
    expect(r.myLeagueRank(more, league)).toBe(3)
  })

  it('dni do końca tygodnia z zegara', () => {
    expect(r.daysLeftInWeek('2026-10-20')).toBe(5) // wtorek
    expect(r.daysLeftInWeek('2026-10-25')).toBe(0) // niedziela
  })

  it('nowy tydzień: awans z top 7, zerowanie XP, nowe zamrożenie dla Plus', () => {
    const z = { ...persona('zosia'), league: { tier: 'sapphire' as const }, streak: { ...persona('zosia').streak, freezesLeft: 0 } }
    const { state } = r.rollWeek(z, '2026-10-26', league)
    expect(state.league.tier).toBe('diamond')
    expect(state.xp).toMatchObject({ thisWeek: 0, weekOf: '2026-10-26' })
    expect(state.streak.freezesLeft).toBe(1)
  })

  it('ten sam tydzień: bez zmian', () => {
    const z = persona('zosia')
    expect(r.rollWeek(z, '2026-10-25', league).state).toBe(z)
  })
})

describe('zadania dnia', () => {
  it('nowy dzień = nowe zadania; lekcja bez błędów liczy się do wszystkich trzech', () => {
    const { state } = r.completeLesson(persona('new'), { lessonId: 'u1-l1', mistakes: 0, today: '2026-10-20', course })
    expect(state.quests.items).toEqual([
      { id: 'xp', target: 30, progress: 15 },
      { id: 'lessons', target: 2, progress: 1 },
      { id: 'perfect', target: 1, progress: 1 },
    ])
  })
})

describe('otwarcie aplikacji', () => {
  it('Kuba 20.10 o 10:00: seria i 2 serca bez zmian', () => {
    const { state, events } = r.onAppOpen(persona('kuba'), at('2026-10-20T10:00:00'), league)
    expect(state.streak.current).toBe(3)
    expect(state.hearts).toBe(2)
    expect(events).toEqual([])
  })
})

describe('subskrypcja i onboarding', () => {
  it('trial włącza Plus: serca bez limitu i zamrożenie', () => {
    const { state, events } = r.startTrial(persona('kuba'), 'annual', '2026-10-20')
    expect(state).toMatchObject({ plan: 'annual', hearts: null, subscription: { renewsAt: '2026-10-27', payer: 'self' } })
    expect(state.streak.freezesLeft).toBe(1)
    expect(events).toEqual([{ name: 'trial_started', props: { plan: 'annual' } }])
  })

  it('onboarding zapisuje cel, ale nie zmienia ścieżki (as-is)', () => {
    const before = persona('new')
    const { state, events } = r.completeOnboarding(before, { goal: 'test', ageBand: '13-15', dailyGoalMin: 10 })
    expect(state.onboarded).toBe(true)
    expect(state.profile.goal).toBe('test')
    expect(state.progress).toEqual(before.progress)
    expect(events[0].name).toBe('onboarding_completed')
  })
})

describe('sprawdzanie tłumaczenia', () => {
  const accepted = ['The parrot drinks coffee.', 'The parrot is drinking coffee.']
  it('ignoruje wielkość liter, interpunkcję i podwójne spacje', () => {
    expect(r.isAcceptedTranslation('the  parrot drinks coffee', accepted)).toBe(true)
    expect(r.isAcceptedTranslation('THE PARROT IS DRINKING COFFEE!!', accepted)).toBe(true)
    expect(r.isAcceptedTranslation('The parrot drink coffee.', accepted)).toBe(false)
  })
})
