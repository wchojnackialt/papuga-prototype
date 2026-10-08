import type { Exercise } from '../engine/schema'

export type AnswerResult = { correct: boolean; answer: unknown }

/**
 * Kontrakt typu ćwiczenia (PRD §7 „Rejestr typów ćwiczeń”): komponent dostaje `exercise` i woła `onAnswer`
 * dokładnie raz. Sam renderuje przycisk „Sprawdź” (CheckButton) i swój stan po odpowiedzi.
 */
export type ExerciseProps<T extends Exercise = Exercise> = {
  exercise: T
  onAnswer: (result: AnswerResult) => void
}
