import type { ComponentType } from 'react'
import type { Exercise, ExerciseType } from '../engine/schema'
import { ArrangeTiles } from './ArrangeTiles'
import { ChooseTranslation } from './ChooseTranslation'
import { MatchPairs } from './MatchPairs'
import { TypeTranslation } from './TypeTranslation'
import type { ExerciseProps } from './types'

// Punkt rozbudowy (PRD §7): nowy typ ćwiczenia = schemat w engine/schema.ts + komponent + wpis tutaj.

type Entry<T extends ExerciseType> = {
  component: ComponentType<ExerciseProps<Extract<Exercise, { type: T }>>>
  /** Tytuł polecenia nad ćwiczeniem (H2). */
  title: string
  /** Poprawna odpowiedź pokazywana w arkuszu „Niepoprawnie”. */
  correctAnswer: (e: Extract<Exercise, { type: T }>) => string
}

const joinTiles = (words: string[]) => words.join(' ').replace(/ ([,.!?])/g, '$1')

export const exerciseRegistry: { [T in ExerciseType]: Entry<T> } = {
  choose_translation: { component: ChooseTranslation, title: 'Wybierz tłumaczenie', correctAnswer: (e) => e.options[e.answer] },
  arrange_tiles: { component: ArrangeTiles, title: 'Przetłumacz to zdanie', correctAnswer: (e) => joinTiles(e.answer) },
  match_pairs: { component: MatchPairs, title: 'Dopasuj pary', correctAnswer: (e) => e.pairs.map((p) => p.join(' = ')).join(', ') },
  type_translation: { component: TypeTranslation, title: 'Napisz po angielsku', correctAnswer: (e) => e.accepted[0] },
}

export function getEntry<T extends ExerciseType>(type: T): Entry<T> {
  return exerciseRegistry[type]
}
