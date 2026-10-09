import { z } from 'zod'

// Schematy danych (PRD §6). Typy w aplikacji wyprowadzamy z nich (z.infer), żeby JSON i kod nie rozjechały się.

const dayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

// ── Ćwiczenia (PRD §6.2) ────────────────────────────────────────────────

const exerciseBase = z.object({
  id: z.string(),
  prompt: z.string(),
  // W as-is zapisane w danych, ale nieużywane w interfejsie (przydadzą się w tygodniu 3).
  skillTags: z.array(z.string()),
  source: z.enum(['course', 'user_material']),
})

export const chooseTranslationSchema = exerciseBase.extend({
  type: z.literal('choose_translation'),
  options: z.array(z.string()).min(2),
  answer: z.number().int().nonnegative(),
})

export const arrangeTilesSchema = exerciseBase.extend({
  type: z.literal('arrange_tiles'),
  tiles: z.array(z.string()).min(2),
  answer: z.array(z.string()).min(1),
})

export const matchPairsSchema = exerciseBase.extend({
  type: z.literal('match_pairs'),
  pairs: z.array(z.tuple([z.string(), z.string()])).min(2),
})

export const typeTranslationSchema = exerciseBase.extend({
  type: z.literal('type_translation'),
  accepted: z.array(z.string()).min(1),
})

export const exerciseSchema = z.discriminatedUnion('type', [
  chooseTranslationSchema,
  arrangeTilesSchema,
  matchPairsSchema,
  typeTranslationSchema,
])

export type Exercise = z.infer<typeof exerciseSchema>
export type ExerciseType = Exercise['type']

// ── Kurs (PRD §6.3) ─────────────────────────────────────────────────────

export const lessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(['lesson', 'chest']),
  exercisePool: z.array(z.string()),
})

export const unitSchema = z.object({
  id: z.string(),
  title: z.string(),
  locked: z.boolean().default(false),
  lessons: z.array(lessonSchema),
})

export const courseSchema = z.object({
  id: z.string(),
  language: z.string(),
  units: z.array(unitSchema),
})

export type Lesson = z.infer<typeof lessonSchema>
export type Unit = z.infer<typeof unitSchema>
export type Course = z.infer<typeof courseSchema>

// ── Liga (PRD §4.5) ─────────────────────────────────────────────────────

export const leagueTiers = ['bronze', 'silver', 'gold', 'sapphire', 'diamond'] as const
export type LeagueTier = (typeof leagueTiers)[number]

export const leagueSchema = z.object({
  // XP rywala w danej lidze = baseXp × mnożnik ligi
  tierScale: z.record(z.enum(leagueTiers), z.number().positive()),
  members: z
    .array(z.object({ id: z.string(), name: z.string(), avatar: z.string(), baseXp: z.number().int().nonnegative() }))
    .length(29), // + ja = 30 osób
})

export type League = z.infer<typeof leagueSchema>

// ── Odznaki (PRD §4.8): wszystkie za wysiłek, żadna za umiejętność (as-is) ──

export const badgeSchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string(),
  rule: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('streak'), value: z.number().int().positive() }),
    z.object({ kind: z.literal('xp'), value: z.number().int().positive() }),
    z.object({ kind: z.literal('manual') }),
  ]),
})

export type Badge = z.infer<typeof badgeSchema>

// ── Stan użytkownika (PRD §6.4) ─────────────────────────────────────────

export const goals = ['school', 'test', 'work', 'travel', 'self'] as const
export const ageBands = ['u12', '13-15', '16-19', '20+'] as const
export const plans = ['free', 'monthly', 'annual', 'family'] as const
export type Plan = (typeof plans)[number]

export const questSchema = z.object({
  id: z.enum(['xp', 'lessons', 'perfect']),
  target: z.number().int().positive(),
  progress: z.number().int().nonnegative(),
})

export type Quest = z.infer<typeof questSchema>

export const userStateSchema = z.object({
  persona: z.string(),
  onboarded: z.boolean(),
  profile: z.object({
    name: z.string(),
    avatar: z.string(),
    ageBand: z.enum(ageBands).nullable(),
    goal: z.enum(goals).nullable(),
    dailyGoalMin: z.number().int().positive().nullable(),
    joinedAt: dayKey,
  }),
  plan: z.enum(plans),
  subscription: z.object({ renewsAt: dayKey, payer: z.enum(['self', 'parent']) }).nullable(),
  streak: z.object({
    current: z.number().int().nonnegative(),
    longest: z.number().int().nonnegative(),
    lastActiveDate: dayKey.nullable(),
    freezesLeft: z.number().int().nonnegative(),
    frozenDates: z.array(dayKey),
  }),
  xp: z.object({
    total: z.number().int().nonnegative(),
    thisWeek: z.number().int().nonnegative(),
    weekOf: dayKey, // poniedziałek tygodnia, do którego należy thisWeek
  }),
  // null = bez limitu (Papuga Plus)
  hearts: z.number().int().min(0).max(5).nullable(),
  heartsLostAt: z.string().nullable(), // ISO, start odliczania 4 h do odnowienia
  league: z.object({ tier: z.enum(leagueTiers) }),
  progress: z.object({
    completedLessons: z.array(z.string()),
    currentLesson: z.string().nullable(), // null = wszystko dostępne ukończone
  }),
  quests: z.object({ date: dayKey, items: z.array(questSchema) }),
  badges: z.array(z.string()),
})

export type UserState = z.infer<typeof userStateSchema>

// ── Dziennik zdarzeń (PRD §6.5) ─────────────────────────────────────────

export type TrackedEvent = {
  ts: string
  persona: string
  name: string
  props?: Record<string, unknown>
}
