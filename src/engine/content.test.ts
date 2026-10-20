import { describe, expect, it } from 'vitest'
import { course, exercises, getExercises, LESSON_LENGTH, personaIds, personaSeeds } from './content'
import { validateContent, validateExercise } from './validateContent'

describe('dane', () => {
  it('persony: Kuba, Zosia i nowy użytkownik', () => {
    expect(personaIds).toEqual(['kuba', 'zosia', 'new'])
    expect(personaSeeds.kuba.hearts).toBe(0)
    expect(personaSeeds.zosia.hearts).toBeNull()
  })

  it('kurs: 3 jednostki po 5 węzłów, U3 zablokowana', () => {
    expect(course.units.map((u) => u.lessons.length)).toEqual([5, 5, 5])
    expect(course.units.map((u) => u.locked)).toEqual([false, false, true])
  })

  it('każde ćwiczenie z puli istnieje', () => {
    const ids = new Set(exercises.map((e) => e.id))
    const missing = course.units.flatMap((u) => u.lessons.flatMap((l) => l.exercisePool.filter((id) => !ids.has(id))))
    expect(missing).toEqual([])
  })

  it('L3 i L4 korzystają z puli L1 + L2 swojej jednostki', () => {
    for (const unit of course.units.filter((u) => !u.locked)) {
      const [l1, l2, l3, l4] = unit.lessons
      const base = [...l1.exercisePool, ...l2.exercisePool].sort()
      expect([...l3.exercisePool].sort()).toEqual(base)
      expect([...l4.exercisePool].sort()).toEqual(base)
    }
  })

  it('getExercises losuje 10 zadań z puli lekcji', () => {
    const list = getExercises('u2-l1', () => 0.5)
    expect(list).toHaveLength(LESSON_LENGTH)
    expect(new Set(list.map((e) => e.id)).size).toBe(LESSON_LENGTH)
    expect(list.every((e) => e.id.startsWith('u2-l1'))).toBe(true)
  })

  it('treść przechodzi walidację (npm run validate)', () => {
    expect(validateContent(course, exercises)).toEqual([])
  })
})

describe('walidator treści', () => {
  it('wyłapuje brakujący kafelek, zły indeks i treść szkolną', () => {
    const base = { prompt: 'x', skillTags: [], source: 'course' as const }
    expect(validateExercise({ ...base, id: 'a', type: 'arrange_tiles', tiles: ['I', 'am', 'x', 'y'], answer: ['I', 'am', 'fine'] })).toHaveLength(1)
    expect(validateExercise({ ...base, id: 'b', type: 'choose_translation', options: ['a', 'b'], answer: 2 })).toHaveLength(1)
    expect(validateExercise({ ...base, id: 'c', type: 'type_translation', prompt: 'Jutro mam sprawdzian.', accepted: ['I have a test tomorrow.'] })).toHaveLength(1)
  })
})
