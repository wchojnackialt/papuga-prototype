import { diffDays, fromDayKey, type DayKey } from './dates'
import type { RuleResult } from './rules'
import type { Classroom, Exercise, UserState, Word, WordList } from './schema'

// „Moje listy”: zestawy słówek ucznia i klasy. Czyste funkcje, jak reguły gry w rules.ts.

export const LISTS = {
  /** Tyle poprawnych odpowiedzi z rzędu = „umiesz” słówko. Błąd zeruje licznik. */
  mastery: 2,
  /** Minimum słówek w zestawie: ćwiczenie wyboru potrzebuje 4 odpowiedzi. */
  minWords: 4,
  /** Słówek na jedną sesję ćwiczeń. */
  sessionWords: 10,
  matchPairs: 4,
} as const

export const wordKey = (listId: string, wordId: string) => `${listId}/${wordId}`

export const isKnown = (progress: UserState['wordProgress'], listId: string, wordId: string) =>
  (progress[wordKey(listId, wordId)] ?? 0) >= LISTS.mastery

export const knownCount = (list: WordList, progress: UserState['wordProgress']) =>
  list.words.filter((w) => isKnown(progress, list.id, w.id)).length

// ── Zestawy widoczne dla ucznia ─────────────────────────────────────────

export type ListEntry = { list: WordList; mine: boolean; author: string; avatar: string }

export const isInClass = (s: UserState, c: Classroom) => s.classroom.joinedId === c.id

/** Własne zestawy oraz (po dołączeniu do klasy) zestawy kolegów. */
export function visibleLists(s: UserState, c: Classroom): { mine: ListEntry[]; fromClass: ListEntry[] } {
  const mine = s.wordLists.map((list) => ({ list, mine: true, author: 'Ty', avatar: s.profile.avatar }))
  if (!isInClass(s, c)) return { mine, fromClass: [] }
  const fromClass = c.lists.map(({ authorId, ...list }) => {
    const m = c.members.find((x) => x.id === authorId)
    return { list, mine: false, author: m?.name ?? '?', avatar: m?.avatar ?? '🙂' }
  })
  // Udostępnione własne zestawy widać też w sekcji klasy, tak jak zobaczą je koledzy.
  return { mine, fromClass: [...fromClass, ...mine.filter((e) => e.list.shared)] }
}

export function findList(s: UserState, c: Classroom, listId: string): ListEntry | null {
  const own = s.wordLists.find((l) => l.id === listId)
  if (own) return { list: own, mine: true, author: 'Ty', avatar: s.profile.avatar }
  const cl = c.lists.find((l) => l.id === listId)
  if (!cl) return null
  const m = c.members.find((x) => x.id === cl.authorId)
  return { list: cl, mine: false, author: m?.name ?? '?', avatar: m?.avatar ?? '🙂' }
}

/** Najbliższy sprawdzian na górze, potem zestawy bez daty, na końcu te po sprawdzianie. */
export function sortByTestDate<T extends { list: WordList }>(entries: T[], today: DayKey): T[] {
  const rank = (l: WordList) => (l.testDate === null ? 1 : l.testDate >= today ? 0 : 2)
  return [...entries].sort((a, b) => {
    const r = rank(a.list) - rank(b.list)
    if (r) return r
    const da = a.list.testDate ?? a.list.createdAt
    const db = b.list.testDate ?? b.list.createdAt
    return rank(a.list) === 0 ? da.localeCompare(db) : db.localeCompare(da)
  })
}

/** „Sprawdzian dziś”, „jutro”, „za 3 dni”, „był 20.10”. */
export function testDateLabel(testDate: DayKey | null, today: DayKey): string | null {
  if (!testDate) return null
  const d = diffDays(today, testDate)
  if (d === 0) return 'Sprawdzian dziś'
  if (d === 1) return 'Sprawdzian jutro'
  if (d > 1) return `Sprawdzian za ${d} dni`
  const date = fromDayKey(testDate)
  return `Sprawdzian był ${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** „1 słówko”, „3 słówka”, „12 słówek”. */
export function wordsLabel(n: number): string {
  if (n === 1) return '1 słówko'
  const tens = n % 100
  const ones = n % 10
  return `${n} ${ones >= 2 && ones <= 4 && (tens < 12 || tens > 14) ? 'słówka' : 'słówek'}`
}

// ── Sesja ćwiczeń z zestawu ─────────────────────────────────────────────

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const base = (id: string, prompt: string) => ({ id, prompt, skillTags: ['vocabulary'], source: 'user_material' as const })

/**
 * Ćwiczenia w istniejących formatach, tylko ze słówek zestawu: na rozgrzewkę „Dopasuj pary”,
 * potem na zmianę „Wybierz tłumaczenie” i „Napisz po angielsku”. Najpierw słówka, których uczeń jeszcze nie umie.
 */
export function buildSession(list: WordList, progress: UserState['wordProgress'], random: () => number = Math.random): Exercise[] {
  if (list.words.length < LISTS.minWords) return []
  const unknown = shuffle(list.words.filter((w) => !isKnown(progress, list.id, w.id)), random)
  const known = shuffle(list.words.filter((w) => isKnown(progress, list.id, w.id)), random)
  const picked = [...unknown, ...known].slice(0, LISTS.sessionWords)

  const pairs: Exercise = {
    ...base(`${list.id}#pairs`, ''),
    type: 'match_pairs',
    pairs: picked.slice(0, LISTS.matchPairs).map((w) => [w.pl, w.en] as [string, string]),
  }

  const perWord = picked.map((w, i): Exercise => {
    const id = `${wordKey(list.id, w.id)}#${i}`
    if (i % 2 === 1) return { ...base(id, w.pl), type: 'type_translation', accepted: [w.en] }
    const distractors = shuffle(list.words.filter((x) => x.id !== w.id && x.en !== w.en), random).slice(0, 3)
    const options = shuffle([w, ...distractors], random)
    return { ...base(id, w.pl), type: 'choose_translation', options: options.map((o) => o.en), answer: options.indexOf(w) }
  })

  return [pairs, ...perWord]
}

/** Klucz słówka z id ćwiczenia; null dla „Dopasuj pary” (nie liczy się do „umiesz”). */
export const exerciseWordKey = (exerciseId: string): string | null => (exerciseId.includes('#pairs') ? null : exerciseId.split('#')[0])


// ── Zmiany zestawów ─────────────────────────────────────────────────────

const noEvents = (state: UserState): RuleResult => ({ state, events: [] })

/** Puste pary są pomijane, białe znaki przycięte. */
export const cleanWords = (words: Word[]) =>
  words.map((w) => ({ ...w, en: w.en.trim(), pl: w.pl.trim() })).filter((w) => w.en && w.pl)

export function createList(s: UserState, list: Omit<WordList, 'shared'>): RuleResult {
  return noEvents({ ...s, wordLists: [...s.wordLists, { ...list, words: cleanWords(list.words), shared: false }] })
}

export function updateList(s: UserState, list: WordList): RuleResult {
  return noEvents({ ...s, wordLists: s.wordLists.map((l) => (l.id === list.id ? { ...list, words: cleanWords(list.words) } : l)) })
}

export function deleteList(s: UserState, listId: string): RuleResult {
  const wordProgress = Object.fromEntries(Object.entries(s.wordProgress).filter(([k]) => !k.startsWith(`${listId}/`)))
  return noEvents({ ...s, wordLists: s.wordLists.filter((l) => l.id !== listId), wordProgress })
}

export function setShared(s: UserState, listId: string, shared: boolean): RuleResult {
  return noEvents({ ...s, wordLists: s.wordLists.map((l) => (l.id === listId ? { ...l, shared } : l)) })
}

// ── Klasa ───────────────────────────────────────────────────────────────

/** Uczeń poniżej 16 lat potrzebuje zgody rodzica, żeby dołączyć do klasy (PRD §6). */
export const needsParentConsent = (s: UserState) =>
  (s.profile.ageBand === 'u12' || s.profile.ageBand === '13-15') && !s.classroom.parentConsent

/** Kod bez rozróżniania wielkości liter, spacji i myślników: „kot 7b” = „KOT-7B”. */
export const normalizeCode = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '')

export const codeMatches = (code: string, c: Classroom) => normalizeCode(code) === normalizeCode(c.code)

export function joinClass(s: UserState, c: Classroom): RuleResult {
  return { state: { ...s, classroom: { ...s.classroom, joinedId: c.id } }, events: [{ name: 'class_joined', props: { classId: c.id } }] }
}

/** Po wyjściu z klasy postęp zostaje u ucznia, a jego zestawy przestają być udostępnione. */
export function leaveClass(s: UserState): RuleResult {
  const classId = s.classroom.joinedId
  return {
    state: { ...s, classroom: { ...s.classroom, joinedId: null }, wordLists: s.wordLists.map((l) => ({ ...l, shared: false })) },
    events: [{ name: 'class_left', props: { classId } }],
  }
}
