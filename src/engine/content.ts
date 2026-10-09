import badgesJson from '../data/badges.json'
import courseJson from '../data/course.json'
import exercisesJson from '../data/exercises.json'
import leagueJson from '../data/league.json'
import { badgeSchema, courseSchema, exerciseSchema, leagueSchema, userStateSchema, type Exercise, type UserState } from './schema'

// Wczytanie treści z JSON z walidacją: błąd w danych wychodzi od razu przy starcie, a nie w połowie lekcji.

export const course = courseSchema.parse(courseJson)
export const exercises = exerciseSchema.array().parse(exercisesJson)
export const league = leagueSchema.parse(leagueJson)
export const badges = badgeSchema.array().parse(badgesJson)

const seeds = import.meta.glob('../data/personas/*.json', { eager: true, import: 'default' })

export const personaSeeds: Record<string, UserState> = Object.fromEntries(
  Object.entries(seeds).map(([path, json]) => {
    const id = path.split('/').pop()!.replace('.json', '')
    return [id, userStateSchema.parse(json)]
  }),
)

/** Kolejność w przełączniku person: kolejność plików nie ma znaczenia, „nowy” na końcu. */
export const personaIds = Object.keys(personaSeeds).sort((a, b) => Number(a === 'new') - Number(b === 'new') || a.localeCompare(b))

export const DEFAULT_PERSONA = 'new'

const byId = new Map(exercises.map((e) => [e.id, e]))

export function findLesson(lessonId: string) {
  for (const unit of course.units) {
    const index = unit.lessons.findIndex((l) => l.id === lessonId)
    if (index >= 0) return { unit, lesson: unit.lessons[index], index }
  }
  return null
}

export const LESSON_LENGTH = 10

/**
 * Punkt rozbudowy (PRD §7 „Źródło ćwiczeń”): lekcja pobiera ćwiczenia tylko stąd.
 * Od tygodnia 3 można tu dołożyć ćwiczenia z `source: "user_material"`.
 */
export function getExercises(lessonId: string, random: () => number = Math.random): Exercise[] {
  const pool = (findLesson(lessonId)?.lesson.exercisePool ?? []).map((id) => byId.get(id)).filter((e): e is Exercise => !!e)
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, LESSON_LENGTH)
}
