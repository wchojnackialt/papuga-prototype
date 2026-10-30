import { describe, expect, it } from 'vitest'
import { classroom, personaSeeds, photoSample } from './content'
import { completeListPractice } from './rules'
import type { UserState, WordList } from './schema'
import * as w from './wordLists'

const persona = (id: string): UserState => structuredClone(personaSeeds[id])
const kubaList = () => persona('kuba').wordLists[0]

describe('dane Moich list', () => {
  it('przykładowe zdjęcie: 20 słówek, 3 niepewne odczyty, 2 podpowiedzi', () => {
    expect(photoSample.words).toHaveLength(20)
    expect(photoSample.words.filter((x) => x.flag === 'uncertain').every((x) => x.read && x.read !== x.en)).toBe(true)
    expect(photoSample.words.filter((x) => x.flag === 'uncertain')).toHaveLength(3)
    expect(photoSample.words.filter((x) => x.flag === 'suggested')).toHaveLength(2)
  })

  it('autorzy zestawów klasy są członkami klasy', () => {
    const ids = new Set(classroom.members.map((m) => m.id))
    expect(classroom.lists.every((l) => ids.has(l.authorId))).toBe(true)
  })

  it('stan bez pól Moich list wczytuje się z wartościami domyślnymi', () => {
    const s = persona('new')
    expect(s.wordLists).toEqual([])
    expect(s.classroom).toEqual({ joinedId: null, parentConsent: false })
  })
})

describe('„umiesz X z Y”', () => {
  it('Kuba umie 3 z 8 (2 poprawne z rzędu = umiesz)', () => {
    const s = persona('kuba')
    expect(w.knownCount(s.wordLists[0], s.wordProgress)).toBe(3)
  })

  it('dwie poprawne odpowiedzi z rzędu dają „umiesz”, błąd zeruje', () => {
    const s = persona('kuba')
    const key = w.wordKey('list-unit2', 'w04')
    const once = completeListPractice(s, { answers: [{ key, correct: true }], today: '2026-10-20' }).state
    expect(w.isKnown(once.wordProgress, 'list-unit2', 'w04')).toBe(false)
    const twice = completeListPractice(once, { answers: [{ key, correct: true }], today: '2026-10-20' }).state
    expect(w.isKnown(twice.wordProgress, 'list-unit2', 'w04')).toBe(true)
    const wrong = completeListPractice(twice, { answers: [{ key, correct: false }], today: '2026-10-20' }).state
    expect(wrong.wordProgress[key]).toBe(0)
  })

  it('sesja z zestawu przedłuża serię, ale nie daje XP', () => {
    const s = persona('kuba')
    const { state, events } = completeListPractice(s, { answers: [], today: '2026-10-20' })
    expect(state.streak.current).toBe(s.streak.current + 1)
    expect(state.xp).toEqual(s.xp)
    expect(state.hearts).toBe(s.hearts)
    expect(events.map((e) => e.name)).toEqual(['streak_extended'])
  })
})

describe('sesja ćwiczeń', () => {
  it('rozgrzewka „Dopasuj pary”, potem po jednym ćwiczeniu na słówko, najpierw nieznane', () => {
    const s = persona('kuba')
    const list = kubaList()
    const session = w.buildSession(list, s.wordProgress, () => 0.3)
    expect(session[0].type).toBe('match_pairs')
    expect(session).toHaveLength(1 + list.words.length)
    expect(session.every((e) => e.source === 'user_material')).toBe(true)
    const firstWords = session.slice(1, 6).map((e) => w.exerciseWordKey(e.id)!.split('/')[1])
    expect(firstWords.every((id) => !w.isKnown(s.wordProgress, list.id, id))).toBe(true)
  })

  it('ćwiczenie wyboru ma poprawną odpowiedź pod wskazanym indeksem', () => {
    const list = kubaList()
    for (const e of w.buildSession(list, {}, Math.random)) {
      if (e.type !== 'choose_translation') continue
      const word = list.words.find((x) => x.pl === e.prompt)!
      expect(e.options[e.answer]).toBe(word.en)
      expect(new Set(e.options).size).toBe(e.options.length)
    }
  })

  it('za mało słówek = brak sesji; „Dopasuj pary” nie liczy się do postępu', () => {
    const tiny: WordList = { ...kubaList(), words: kubaList().words.slice(0, 3) }
    expect(w.buildSession(tiny, {})).toEqual([])
    expect(w.exerciseWordKey('list-unit2#pairs')).toBeNull()
    expect(w.exerciseWordKey('list-unit2/w03#4')).toBe('list-unit2/w03')
  })

  it('sesja ma najwyżej 10 słówek', () => {
    const big: WordList = { ...kubaList(), words: photoSample.words.map(({ id, en, pl }) => ({ id, en, pl })) }
    expect(w.buildSession(big, {})).toHaveLength(1 + w.LISTS.sessionWords)
  })
})

describe('zestawy i klasa', () => {
  it('nowy zestaw pomija puste pary i trafia do Moich list', () => {
    const { state } = w.createList(persona('new'), {
      id: 'l1',
      name: 'Test',
      testDate: null,
      createdAt: '2026-10-20',
      words: [
        { id: 'a', en: ' shy ', pl: 'nieśmiały' },
        { id: 'b', en: '', pl: 'pusty' },
      ],
    })
    expect(state.wordLists[0].words).toEqual([{ id: 'a', en: 'shy', pl: 'nieśmiały' }])
    expect(state.wordLists[0].shared).toBe(false)
  })

  it('najbliższy sprawdzian na górze, bez daty niżej, po sprawdzianie na końcu', () => {
    const mk = (id: string, testDate: string | null) => ({ list: { ...kubaList(), id, testDate } })
    const sorted = w.sortByTestDate([mk('past', '2026-10-01'), mk('none', null), mk('later', '2026-10-30'), mk('soon', '2026-10-22')], '2026-10-20')
    expect(sorted.map((e) => e.list.id)).toEqual(['soon', 'later', 'none', 'past'])
  })

  it('kod klasy bez rozróżniania wielkości liter i myślników', () => {
    expect(w.codeMatches('kot 7b', classroom)).toBe(true)
    expect(w.codeMatches('KOT-7C', classroom)).toBe(false)
  })

  it('poniżej 16 lat bez zgody rodzica nie da się dołączyć', () => {
    const s = persona('kuba')
    expect(w.needsParentConsent(s)).toBe(false)
    expect(w.needsParentConsent({ ...s, classroom: { ...s.classroom, parentConsent: false } })).toBe(true)
    expect(w.needsParentConsent(persona('zosia'))).toBe(false)
  })

  it('po dołączeniu widać zestawy klasy i udostępnione własne; po wyjściu postęp zostaje', () => {
    let s = w.joinClass(persona('kuba'), classroom).state
    s = w.setShared(s, 'list-unit2', true).state
    const { fromClass } = w.visibleLists(s, classroom)
    expect(fromClass).toHaveLength(classroom.lists.length + 1)
    expect(fromClass.find((e) => e.list.id === 'class-unit3')?.author).toBe('Majka')
    const left = w.leaveClass(s).state
    expect(w.visibleLists(left, classroom).fromClass).toEqual([])
    expect(left.wordLists[0].shared).toBe(false)
    expect(left.wordProgress).toEqual(s.wordProgress)
  })

  it('usunięcie zestawu usuwa też jego postęp', () => {
    const { state } = w.deleteList(persona('kuba'), 'list-unit2')
    expect(state.wordLists).toEqual([])
    expect(Object.keys(state.wordProgress)).toEqual([])
  })

  it('etykiety po polsku', () => {
    expect([1, 3, 5, 12, 22, 25].map(w.wordsLabel)).toEqual(['1 słówko', '3 słówka', '5 słówek', '12 słówek', '22 słówka', '25 słówek'])
    expect(w.testDateLabel('2026-10-23', '2026-10-20')).toBe('Sprawdzian za 3 dni')
    expect(w.testDateLabel('2026-10-21', '2026-10-20')).toBe('Sprawdzian jutro')
    expect(w.testDateLabel('2026-10-18', '2026-10-20')).toBe('Sprawdzian był 18.10')
  })
})
