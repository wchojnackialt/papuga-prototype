import { CheckCircle, PencilSimple, ShareNetwork, Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNav } from '../app/nav'
import { Button } from '../components/Button'
import { TestDateChip } from '../components/ListCard'
import { Modal } from '../components/Modal'
import { ProgressBar } from '../components/ProgressBar'
import { ScreenHeader } from '../components/ScreenHeader'
import { WordEditor, type EditableWord } from '../components/WordEditor'
import { classroom } from '../engine/content'
import { useStore } from '../engine/store'
import { track } from '../engine/track'
import { cleanWords, findList, isInClass, isKnown, knownCount, LISTS, wordsLabel } from '../engine/wordLists'

const fieldClass = 'min-h-[52px] w-full rounded-md border-2 border-ink bg-surface px-4 text-body shadow-st-sm outline-none focus:border-lavender'

// Szczegół zestawu: postęp „umiesz X z Y” zamiast XP (PRD 2.7), ćwiczenie, udostępnienie klasie jednym dotknięciem (PRD 2.5).
export function ListDetailScreen({ listId }: { listId: string }) {
  const { go, home } = useNav()
  const user = useStore((s) => s.user)
  const { updateList, deleteList, setShared } = useStore.getState()
  const entry = findList(user, classroom, listId)
  const [editing, setEditing] = useState<{ name: string; testDate: string; words: EditableWord[] } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!entry) {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader onBack={home} />
        <p className="p-4 text-body">Tego zestawu już nie ma.</p>
      </div>
    )
  }

  const { list, mine } = entry
  const known = knownCount(list, user.wordProgress)
  const total = list.words.length
  const inClass = isInClass(user, classroom)
  const canPractice = total >= LISTS.minWords

  if (editing) {
    const valid = cleanWords(editing.words)
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <ScreenHeader title="Edytuj zestaw" onBack={() => setEditing(null)} close />
        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <label className="block">
            <span className="mb-1 block font-bold">Nazwa</span>
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={fieldClass} />
          </label>
          <label className="block">
            <span className="mb-1 block font-bold">
              Data sprawdzianu <span className="font-normal text-ink-muted">(opcjonalnie)</span>
            </span>
            <input type="date" value={editing.testDate} onChange={(e) => setEditing({ ...editing, testDate: e.target.value })} className={fieldClass} />
          </label>
          <WordEditor words={editing.words} onChange={(words) => setEditing({ ...editing, words })} />
        </div>
        <div className="border-t-2 border-ink bg-paper px-4 py-3">
          <Button
            variant="primary"
            disabled={valid.length < LISTS.minWords}
            onClick={() => {
              updateList({ ...list, name: editing.name.trim() || list.name, testDate: editing.testDate || null, words: valid })
              track('list_edited', { listId, words: valid.length })
              setEditing(null)
            }}
          >
            Zapisz zmiany
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <ScreenHeader onBack={home} />
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        <div>
          <h1 className="font-head text-h1">{list.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-small text-ink-muted">
              <span aria-hidden>{entry.avatar}</span> {mine ? 'Twój zestaw' : `Z klasy · ${entry.author}`}
            </span>
            <TestDateChip testDate={list.testDate} />
          </div>
        </div>

        <section className="sticker rounded-md bg-surface p-4 shadow-st-md">
          <p className="mb-2 font-head text-h2">
            Umiesz {known} z {total}
          </p>
          <ProgressBar value={total ? known / total : 0} label={`Umiesz ${known} z ${total}`} />
          <p className="mt-2 text-small text-ink-muted">
            {known === total ? 'Znasz cały zestaw. Powtórz go jeszcze raz przed sprawdzianem.' : `Słówko jest „umiane”, gdy odpowiesz dobrze ${LISTS.mastery} razy z rzędu.`}
          </p>
        </section>

        {mine && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={list.shared}
              onClick={() => {
                if (!inClass) {
                  track('list_share_blocked', { listId, reason: 'no_class' })
                  return go({ name: 'joinClass' })
                }
                setShared(list.id, !list.shared)
                track(list.shared ? 'list_unshared' : 'list_shared', { listId })
              }}
              className={`sticker press-sm flex min-h-[44px] items-center gap-2 rounded-sm px-3 text-small font-bold
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender ${list.shared ? 'bg-lime' : 'bg-surface'}`}
            >
              <ShareNetwork size={18} weight="bold" aria-hidden />
              {list.shared ? 'Udostępniony klasie' : inClass ? 'Udostępnij klasie' : 'Udostępnij klasie (dołącz do klasy)'}
            </button>
            <button
              type="button"
              onClick={() => setEditing({ name: list.name, testDate: list.testDate ?? '', words: list.words })}
              className="sticker press-sm flex min-h-[44px] items-center gap-2 rounded-sm bg-surface px-3 text-small font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
            >
              <PencilSimple size={18} weight="bold" aria-hidden /> Edytuj
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="sticker press-sm flex min-h-[44px] items-center gap-2 rounded-sm bg-surface px-3 text-small font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
            >
              <Trash size={18} weight="bold" aria-hidden /> Usuń
            </button>
          </div>
        )}
        {!mine && <p className="text-small text-ink-muted">Zestaw przygotował(a) {entry.author}. Zmiany może wprowadzać tylko autor.</p>}

        <section aria-labelledby="words-h">
          <h2 id="words-h" className="mb-2 text-label-caps text-ink-muted">
            {wordsLabel(total)}
          </h2>
          <ul className="sticker divide-y-2 divide-locked rounded-md bg-surface">
            {list.words.map((w) => {
              const ok = isKnown(user.wordProgress, list.id, w.id)
              return (
                <li key={w.id} className="flex items-center gap-3 px-4 py-2">
                  <span className="flex-1" lang="en">
                    <strong>{w.en}</strong>
                  </span>
                  <span className="flex-1 text-ink-muted">{w.pl}</span>
                  {ok ? (
                    <CheckCircle size={20} weight="fill" className="icon-ink text-lime" aria-label="Umiesz" />
                  ) : (
                    <span className="w-5" aria-hidden />
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <div className="border-t-2 border-ink bg-paper px-4 py-3">
        <Button
          variant="action"
          disabled={!canPractice}
          onClick={() => go({ name: 'listPractice', listId, run: Date.now() })}
        >
          Ćwicz
        </Button>
        {!canPractice && <p className="mt-2 text-center text-small text-ink-muted">Dodaj co najmniej {LISTS.minWords} słówka, żeby ćwiczyć.</p>}
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Usunąć zestaw?">
        <p className="mb-5 text-body">„{list.name}” zniknie razem z postępem.{list.shared && ' Klasa też przestanie go widzieć.'}</p>
        <div className="space-y-3">
          <Button variant="primary" onClick={() => setConfirmDelete(false)}>
            Zostaw
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              deleteList(list.id)
              track('list_deleted', { listId })
              home()
            }}
          >
            Usuń zestaw
          </Button>
        </div>
      </Modal>
    </div>
  )
}
