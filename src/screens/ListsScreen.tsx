import { Camera, SignOut, UsersThree } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNav } from '../app/nav'
import { Button } from '../components/Button'
import { useTrackOnMount } from '../components/hooks'
import { ListCard } from '../components/ListCard'
import { Mascot } from '../components/Mascot'
import { Modal } from '../components/Modal'
import { clock } from '../engine/clock'
import { classroom } from '../engine/content'
import { useStore } from '../engine/store'
import { track } from '../engine/track'
import { isInClass, sortByTestDate, visibleLists } from '../engine/wordLists'

// Zakładka „Moje listy” (PRD F0): własne zestawy słówek, wejście do słówek ze zdjęcia (F1) i do klasy (F2).
export function ListsScreen() {
  const user = useStore((s) => s.user)
  const leaveClass = useStore((s) => s.leaveClass)
  const go = useNav((s) => s.go)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const today = clock.today()
  const { mine, fromClass } = visibleLists(user, classroom)
  const inClass = isInClass(user, classroom)

  useTrackOnMount('list_tab_opened', { lists: user.wordLists.length, inClass })

  const open = (listId: string) => {
    track('list_opened', { listId })
    go({ name: 'wordList', listId })
  }
  const addFromPhoto = () => {
    track('photo_import_started', { from: 'lists_tab' })
    go({ name: 'photoImport' })
  }

  return (
    <div className="space-y-6 px-4 pb-8 pt-4">
      <h1 className="font-head text-h1">Moje listy</h1>

      {mine.length === 0 ? (
        <section className="sticker flex flex-col items-center gap-4 rounded-md bg-surface p-6 text-center shadow-st-md">
          <Mascot size={64} />
          <p className="text-body">Tu trzymasz słówka na najbliższy sprawdzian. Zrób zdjęcie listy z podręcznika, a resztę przepiszemy za ciebie.</p>
          <Button variant="action" onClick={addFromPhoto}>
            <span className="inline-flex items-center gap-2">
              <Camera size={22} weight="bold" aria-hidden /> Dodaj pierwszy zestaw
            </span>
          </Button>
        </section>
      ) : (
        <>
          <Button variant="action" onClick={addFromPhoto}>
            <span className="inline-flex items-center gap-2">
              <Camera size={22} weight="bold" aria-hidden /> Dodaj słówka ze zdjęcia
            </span>
          </Button>
          <section aria-labelledby="mine-h" className="space-y-3">
            <h2 id="mine-h" className="text-label-caps text-ink-muted">
              Moje zestawy
            </h2>
            {sortByTestDate(mine, today).map((e) => (
              <ListCard key={e.list.id} entry={e} onOpen={() => open(e.list.id)} />
            ))}
          </section>
        </>
      )}

      {inClass ? (
        <section aria-labelledby="class-h" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 id="class-h" className="text-label-caps text-ink-muted">
              Klasa · {classroom.name}
            </h2>
            <button
              type="button"
              onClick={() => setConfirmLeave(true)}
              className="flex min-h-[44px] items-center gap-1 rounded-sm px-2 text-small font-bold text-ink-muted
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
            >
              <SignOut size={16} weight="bold" aria-hidden /> Opuść
            </button>
          </div>
          <p className="flex items-center gap-1 text-small text-ink-muted">
            <span aria-hidden>{classroom.members.map((m) => m.avatar).join(' ')}</span>
            <span>
              {classroom.members.length + 1} osób w klasie
            </span>
          </p>
          {sortByTestDate(fromClass, today).map((e) => (
            <ListCard key={`class-${e.list.id}`} entry={e} showAuthor onOpen={() => open(e.list.id)} />
          ))}
        </section>
      ) : (
        <section className="sticker rounded-md border-dashed bg-paper p-4">
          <p className="mb-1 flex items-center gap-2 font-bold">
            <UsersThree size={22} weight="bold" aria-hidden /> Ćwicz razem z klasą
          </p>
          <p className="mb-4 text-small text-ink-muted">Dołącz kodem od kogoś z klasy i korzystaj z zestawów, które już przepisali inni.</p>
          <Button
            variant="ghost"
            onClick={() => {
              track('class_join_started')
              go({ name: 'joinClass' })
            }}
          >
            Dołącz do klasy
          </Button>
        </section>
      )}

      <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="Opuścić klasę?">
        <p className="mb-5 text-body">
          Twój postęp zostaje u ciebie. Twoje zestawy przestaną być widoczne dla klasy {classroom.name}.
        </p>
        <div className="space-y-3">
          <Button variant="primary" onClick={() => setConfirmLeave(false)}>
            Zostań
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              leaveClass()
              setConfirmLeave(false)
            }}
          >
            Opuść klasę
          </Button>
        </div>
      </Modal>
    </div>
  )
}
