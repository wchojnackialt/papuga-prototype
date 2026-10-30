import { ShieldCheck } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNav } from '../app/nav'
import { Button } from '../components/Button'
import { useTrackOnMount } from '../components/hooks'
import { Mascot } from '../components/Mascot'
import { ScreenHeader } from '../components/ScreenHeader'
import { classroom } from '../engine/content'
import { useStore } from '../engine/store'
import { track } from '../engine/track'
import { codeMatches, needsParentConsent } from '../engine/wordLists'

// F2 „Dołączam do klasy kodem od kolegi” (PRD 2.2–2.3): kod → podgląd klasy → dołączenie.
// Bez wyszukiwania klas po szkole; w klasie widać tylko pseudonimy i awatary.
export function JoinClassScreen() {
  const home = useNav((s) => s.home)
  const user = useStore((s) => s.user)
  const joinClass = useStore((s) => s.joinClass)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [preview, setPreview] = useState(false)
  const blocked = needsParentConsent(user)

  useTrackOnMount(blocked ? 'class_consent_required' : null, { ageBand: user.profile.ageBand })

  if (blocked) {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader onBack={home} close />
        <div className="animate-screen flex flex-1 flex-col items-center gap-4 px-4 pb-6 pt-6 text-center">
          <Mascot size={88} />
          <h1 className="font-head text-h1">Potrzebna zgoda rodzica</h1>
          <p className="text-body">
            W klasie uczniowie dzielą się zestawami słówek. Jeśli masz mniej niż 16 lat, rodzic musi się na to zgodzić w swoim koncie Papugi.
          </p>
          <p className="text-small text-ink-muted">Twoje własne zestawy działają bez tego, jak dotąd.</p>
          <div className="mt-auto w-full">
            <Button variant="primary" onClick={home}>
              Rozumiem
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const submit = () => {
    const ok = codeMatches(code, classroom)
    track('class_join_attempted', { ok })
    setError(!ok)
    if (ok) setPreview(true)
  }

  if (preview) {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader onBack={() => setPreview(false)} />
        <div className="animate-screen flex flex-1 flex-col gap-4 px-4 pb-6">
          <p className="text-label-caps text-ink-muted">Dołączasz do klasy</p>
          <h1 className="font-head text-h1">{classroom.name}</h1>
          <p className="text-body">
            {classroom.members.length} osób · {classroom.lists.length} zestawy słówek
          </p>
          <ul className="sticker grid grid-cols-3 gap-3 rounded-md bg-surface p-4 shadow-st-md">
            {classroom.members.map((m) => (
              <li key={m.id} className="flex flex-col items-center gap-1 text-center">
                <span className="sticker flex h-12 w-12 items-center justify-center rounded-full bg-lavender-soft text-[26px]" aria-hidden>
                  {m.avatar}
                </span>
                <span className="w-full truncate text-small">{m.name}</span>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-small text-ink-muted">
            <ShieldCheck size={20} weight="bold" className="shrink-0" aria-hidden />
            Inni widzą tylko twój pseudonim ({user.profile.name}) i awatar. Klasę możesz opuścić w każdej chwili.
          </p>
          <div className="mt-auto">
            <Button
              variant="action"
              onClick={() => {
                joinClass(code)
                home()
              }}
            >
              Dołącz do klasy
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader onBack={home} close />
      <form
        className="animate-screen flex flex-1 flex-col gap-4 px-4 pb-6"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <h1 className="font-head text-h1">Dołącz do klasy</h1>
        <p className="text-body">Wpisz kod klasy, który dostałeś albo dostałaś od kogoś z klasy.</p>
        <label className="block">
          <span className="sr-only">Kod klasy</span>
          <input
            value={code}
            autoFocus
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            placeholder="np. ABC-12"
            aria-invalid={error}
            aria-describedby={error ? 'code-error' : undefined}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(false)
            }}
            className={`min-h-[56px] w-full rounded-md border-2 bg-surface px-4 text-center font-head text-h1 tracking-widest shadow-st-sm outline-none
              placeholder:font-body placeholder:text-body placeholder:tracking-normal placeholder:text-ink-muted
              ${error ? 'border-error-ink bg-error-soft' : 'border-ink focus:border-lavender'}`}
          />
        </label>
        {error && (
          <p id="code-error" role="alert" className="text-small font-bold text-error-ink">
            Nie znamy takiego kodu. Sprawdź, czy jest przepisany dokładnie.
          </p>
        )}
        <div className="mt-auto">
          <Button variant="primary" type="submit" disabled={!code.trim()}>
            Dalej
          </Button>
        </div>
      </form>
    </div>
  )
}
