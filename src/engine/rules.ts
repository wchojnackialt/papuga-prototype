import { addDays, diffDays, fromDayKey, isoWeekday, toDayKey, weekStart, type DayKey } from './dates'
import { leagueTiers, type Badge, type Course, type League, type LeagueTier, type Plan, type Quest, type TrackedEvent, type UserState } from './schema'

// Reguły gry (PRD §5) jako czyste funkcje: dostają stan i czas, zwracają nowy stan i zdarzenia do dziennika.
// Ekrany ich nie obchodzą, a testy sprawdzają je bez interfejsu.

export const RULES = {
  xpPerLesson: 10,
  perfectBonus: 5,
  chestXp: 10, // PRD nie podaje wartości; skrzynka daje tyle co lekcja
  maxHearts: 5,
  heartRefillMs: 4 * 60 * 60 * 1000,
  freezesPerWeek: 1,
  leagueSize: 30,
  promoteTop: 7,
  demoteBottom: 5,
  streakReminderHour: 18,
} as const

export type RuleEvent = { name: string; props?: Record<string, unknown> }
export type RuleResult = { state: UserState; events: RuleEvent[] }

export const isPlus = (s: UserState) => s.plan !== 'free'

// ── Kurs i postęp ───────────────────────────────────────────────────────

/** Węzły odblokowanych jednostek w kolejności ścieżki. */
function pathOrder(course: Course): string[] {
  return course.units.filter((u) => !u.locked).flatMap((u) => u.lessons.map((l) => l.id))
}

export function nextNode(course: Course, nodeId: string): string | null {
  const order = pathOrder(course)
  const i = order.indexOf(nodeId)
  return i >= 0 && i < order.length - 1 ? order[i + 1] : null
}

export type NodeStatus = 'done' | 'current' | 'locked'

export function nodeStatus(s: UserState, nodeId: string): NodeStatus {
  if (s.progress.completedLessons.includes(nodeId)) return 'done'
  if (s.progress.currentLesson === nodeId) return 'current'
  return 'locked'
}

function markDone(s: UserState, course: Course, nodeId: string): UserState['progress'] {
  const completed = s.progress.completedLessons.includes(nodeId)
    ? s.progress.completedLessons
    : [...s.progress.completedLessons, nodeId]
  // Powtórka ukończonej lekcji nie przesuwa ścieżki.
  const current = s.progress.currentLesson === nodeId ? nextNode(course, nodeId) : s.progress.currentLesson
  return { completedLessons: completed, currentLesson: current }
}

// ── XP i lekcja ─────────────────────────────────────────────────────────

export function lessonXp(mistakes: number): number {
  return RULES.xpPerLesson + (mistakes === 0 ? RULES.perfectBonus : 0)
}

function addXp(s: UserState, amount: number): UserState['xp'] {
  return { ...s.xp, total: s.xp.total + amount, thisWeek: s.xp.thisWeek + amount }
}

/** Seria +1, gdy to pierwsza ukończona lekcja danego dnia (PRD §5). */
function extendStreak(s: UserState, today: DayKey): RuleResult {
  if (s.streak.lastActiveDate === today) return { state: s, events: [] }
  const current = s.streak.current + 1
  const state = {
    ...s,
    streak: { ...s.streak, current, longest: Math.max(s.streak.longest, current), lastActiveDate: today },
  }
  return { state, events: [{ name: 'streak_extended', props: { current } }] }
}

export function completeLesson(
  s: UserState,
  args: { lessonId: string; mistakes: number; today: DayKey; course: Course },
): RuleResult & { xpGained: number } {
  const xpGained = lessonXp(args.mistakes)
  let state: UserState = { ...s, xp: addXp(s, xpGained), progress: markDone(s, args.course, args.lessonId) }
  const streak = extendStreak(state, args.today)
  state = updateQuests(ensureQuests(streak.state, args.today), { xp: xpGained, lessons: 1, perfect: args.mistakes === 0 ? 1 : 0 })
  return { state, events: streak.events, xpGained }
}

export function openChest(s: UserState, args: { chestId: string; today: DayKey; course: Course }): RuleResult & { xpGained: number } {
  const xpGained = RULES.chestXp
  let state: UserState = { ...s, xp: addXp(s, xpGained), progress: markDone(s, args.course, args.chestId) }
  state = updateQuests(ensureQuests(state, args.today), { xp: xpGained, lessons: 0, perfect: 0 })
  return { state, events: [], xpGained }
}

// ── Serca ───────────────────────────────────────────────────────────────

export function loseHeart(s: UserState, now: Date): RuleResult {
  if (s.hearts === null) return { state: s, events: [] } // Plus: bez limitu
  const hearts = Math.max(0, s.hearts - 1)
  const state = { ...s, hearts, heartsLostAt: now.toISOString() }
  const events: RuleEvent[] = [{ name: 'heart_lost', props: { heartsLeft: hearts } }]
  if (hearts === 0) events.push({ name: 'hearts_depleted', props: { heartsLeft: 0 } })
  return { state, events }
}

/** Kiedy serca wrócą do pełna: 4 h od ostatniej utraty serca. */
export function heartsRefillAt(s: UserState): Date | null {
  if (s.hearts === null || s.hearts >= RULES.maxHearts || !s.heartsLostAt) return null
  return new Date(new Date(s.heartsLostAt).getTime() + RULES.heartRefillMs)
}

export function refillHearts(s: UserState, now: Date): UserState {
  const at = heartsRefillAt(s)
  return at && now >= at ? { ...s, hearts: RULES.maxHearts, heartsLostAt: null } : s
}

export const canStartLesson = (s: UserState) => s.hearts === null || s.hearts > 0

// ── Seria ───────────────────────────────────────────────────────────────

/**
 * Zerwanie serii przy otwarciu aplikacji (PRD §4.6). Każdy pominięty dzień między ostatnią aktywnością a dziś
 * musi być pokryty zamrożeniem (tylko Plus); inaczej seria spada do 0.
 */
export function rollStreak(s: UserState, today: DayKey): RuleResult {
  const last = s.streak.lastActiveDate
  if (!last || s.streak.current === 0) return { state: s, events: [] }

  const frozen = [...s.streak.frozenDates]
  let freezesLeft = s.streak.freezesLeft
  for (let d = addDays(last, 1); diffDays(d, today) > 0; d = addDays(d, 1)) {
    if (frozen.includes(d)) continue
    if (isPlus(s) && freezesLeft > 0) {
      frozen.push(d)
      freezesLeft -= 1
      continue
    }
    const state = { ...s, streak: { ...s.streak, current: 0, freezesLeft, frozenDates: frozen } }
    return { state, events: [{ name: 'streak_broken', props: { current: s.streak.current } }] }
  }
  return { state: { ...s, streak: { ...s.streak, freezesLeft, frozenDates: frozen } }, events: [] }
}

/** Modal „Twoja seria jest zagrożona!” (PRD §4.6): dziś bez lekcji i po 18:00. */
export function isStreakAtRisk(s: UserState, now: Date): boolean {
  return s.streak.current > 0 && s.streak.lastActiveDate !== toDayKey(now) && now.getHours() >= RULES.streakReminderHour
}

export type CalendarDay = { day: DayKey; status: 'active' | 'frozen' | 'missed' | 'future' | 'none'; today: boolean }

/**
 * Kalendarz miesiąca serii (PRD §4.6). Dni aktywne wynikają z bieżącej serii (ostatnie `current` dni do
 * `lastActiveDate`, bez dni zamrożonych). Pominięte = minione dni od dołączenia, które nie są ani aktywne, ani zamrożone.
 */
export function streakCalendar(s: UserState, month: DayKey, today: DayKey): CalendarDay[] {
  const first = fromDayKey(month)
  first.setDate(1)
  const start = toDayKey(first)
  const length = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()

  const active = new Set<DayKey>()
  const frozen = new Set(s.streak.frozenDates)
  if (s.streak.lastActiveDate && s.streak.current > 0) {
    let left = s.streak.current
    for (let d = s.streak.lastActiveDate; left > 0; d = addDays(d, -1)) {
      if (frozen.has(d)) continue
      active.add(d)
      left -= 1
    }
  }

  return Array.from({ length }, (_, i) => {
    const day = addDays(start, i)
    const status: CalendarDay['status'] =
      active.has(day) ? 'active'
      : frozen.has(day) ? 'frozen'
      : diffDays(day, today) <= 0 ? 'future'
      : diffDays(s.profile.joinedAt, day) < 0 ? 'none'
      : 'missed'
    return { day, status, today: day === today }
  })
}

// ── Cel dzienny i odznaki ───────────────────────────────────────────────

/** Minuty nauki dziś, z czasu trwania ukończonych lekcji w dzienniku (cel dzienny w Zadaniach, PRD §5). */
export function minutesToday(events: TrackedEvent[], persona: string, today: DayKey): number {
  const sec = events
    .filter((e) => e.persona === persona && e.name === 'lesson_completed' && toDayKey(new Date(e.ts)) === today)
    .reduce((sum, e) => sum + Number(e.props?.durationSec ?? 0), 0)
  return Math.round(sec / 60)
}

export function isBadgeUnlocked(s: UserState, badge: Badge): boolean {
  if (s.badges.includes(badge.id)) return true
  switch (badge.rule.kind) {
    case 'streak':
      return s.streak.longest >= badge.rule.value
    case 'xp':
      return s.xp.total >= badge.rule.value
    case 'manual':
      return false
  }
}

// ── Liga ────────────────────────────────────────────────────────────────

export type LeagueRow = { id: string; name: string; avatar: string; xp: number; rank: number; isMe: boolean; zone: 'promote' | 'demote' | null }

export function leagueStandings(s: UserState, league: League): LeagueRow[] {
  const scale = league.tierScale[s.league.tier]
  const rows = [
    ...league.members.map((m) => ({ id: m.id, name: m.name, avatar: m.avatar, xp: Math.round(m.baseXp * scale), isMe: false })),
    { id: 'me', name: s.profile.name, avatar: s.profile.avatar, xp: s.xp.thisWeek, isMe: true },
  ]
  // Przy remisie wyżej jestem ja: XP z lekcji ma od razu przesuwać w rankingu.
  rows.sort((a, b) => b.xp - a.xp || Number(b.isMe) - Number(a.isMe))
  return rows.map((r, i) => ({
    ...r,
    rank: i + 1,
    zone: i < RULES.promoteTop ? 'promote' : i >= rows.length - RULES.demoteBottom ? 'demote' : null,
  }))
}

export const myLeagueRank = (s: UserState, league: League) => leagueStandings(s, league).find((r) => r.isMe)!.rank

/** Pełne dni do końca tygodnia ligi (pon–niedz.); wtorek → 5, niedziela → 0. */
export const daysLeftInWeek = (today: DayKey) => 7 - isoWeekday(today)

function shiftTier(tier: LeagueTier, by: number): LeagueTier {
  const i = Math.min(leagueTiers.length - 1, Math.max(0, leagueTiers.indexOf(tier) + by))
  return leagueTiers[i]
}

/** Nowy tydzień: awans/spadek według rankingu, zerowanie XP tygodnia, nowe zamrożenie dla Plus. */
export function rollWeek(s: UserState, today: DayKey, league: League): RuleResult {
  const week = weekStart(today)
  if (s.xp.weekOf === week) return { state: s, events: [] }
  const me = leagueStandings(s, league).find((r) => r.isMe)!
  const tier = shiftTier(s.league.tier, me.zone === 'promote' ? 1 : me.zone === 'demote' ? -1 : 0)
  const state: UserState = {
    ...s,
    league: { tier },
    xp: { ...s.xp, thisWeek: 0, weekOf: week },
    streak: { ...s.streak, freezesLeft: isPlus(s) ? RULES.freezesPerWeek : 0 },
  }
  return { state, events: tier !== s.league.tier ? [{ name: 'league_changed', props: { from: s.league.tier, to: tier } }] : [] }
}

// ── Zadania dnia (PRD §4.7) ─────────────────────────────────────────────

const dailyQuests = (): Quest[] => [
  { id: 'xp', target: 30, progress: 0 },
  { id: 'lessons', target: 2, progress: 0 },
  { id: 'perfect', target: 1, progress: 0 },
]

export function ensureQuests(s: UserState, today: DayKey): UserState {
  if (s.quests.date === today && s.quests.items.length > 0) return s
  return { ...s, quests: { date: today, items: dailyQuests() } }
}

function updateQuests(s: UserState, delta: Record<Quest['id'], number>): UserState {
  const items = s.quests.items.map((q) => ({ ...q, progress: Math.min(q.target, q.progress + delta[q.id]) }))
  return { ...s, quests: { ...s.quests, items } }
}

// ── Otwarcie aplikacji ──────────────────────────────────────────────────

export function onAppOpen(s: UserState, now: Date, league: League): RuleResult {
  const today = toDayKey(now)
  const week = rollWeek(refillHearts(s, now), today, league)
  const streak = rollStreak(week.state, today)
  return { state: ensureQuests(streak.state, today), events: [...week.events, ...streak.events] }
}

// ── Subskrypcja i onboarding ────────────────────────────────────────────

/** „Wypróbuj 7 dni za darmo” (PRD §4.9): plan zmienia się na Plus bez płatności. */
export function startTrial(s: UserState, plan: Exclude<Plan, 'free'>, today: DayKey): RuleResult {
  const state: UserState = {
    ...s,
    plan,
    subscription: { renewsAt: addDays(today, 7), payer: plan === 'family' ? 'parent' : 'self' },
    hearts: null,
    heartsLostAt: null,
    streak: { ...s.streak, freezesLeft: Math.max(s.streak.freezesLeft, RULES.freezesPerWeek) },
  }
  return { state, events: [{ name: 'trial_started', props: { plan } }] }
}

/** Odpowiedzi z onboardingu zapisują się, ale nie zmieniają ścieżki (wada as-is, PRD §3). */
export function completeOnboarding(
  s: UserState,
  answers: { goal: NonNullable<UserState['profile']['goal']>; ageBand: NonNullable<UserState['profile']['ageBand']>; dailyGoalMin: number },
): RuleResult {
  const state = { ...s, onboarded: true, profile: { ...s.profile, ...answers } }
  return { state, events: [{ name: 'onboarding_completed', props: answers }] }
}

// ── Sprawdzanie odpowiedzi ──────────────────────────────────────────────

/** type_translation: bez rozróżniania wielkości liter, interpunkcji i podwójnych spacji (PRD §6.2). */
export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^\p{L}\p{N}' ]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const isAcceptedTranslation = (input: string, accepted: string[]) =>
  accepted.some((a) => normalizeAnswer(a) === normalizeAnswer(input))
