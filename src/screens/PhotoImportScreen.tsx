import { Camera, Images, Lightbulb } from '@phosphor-icons/react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { useNav } from '../app/nav'
import { Button } from '../components/Button'
import { Mascot } from '../components/Mascot'
import { ScreenHeader } from '../components/ScreenHeader'
import { WordEditor, type EditableWord } from '../components/WordEditor'
import { clock } from '../engine/clock'
import { photoSample } from '../engine/content'
import { fromDayKey } from '../engine/dates'
import { useStore } from '../engine/store'
import { track } from '../engine/track'
import { cleanWords, LISTS, wordsLabel } from '../engine/wordLists'

// F1 „Słówka ze zdjęcia” (PRD 1.2–1.7). Rozpoznawanie jest symulowane: każde zdjęcie daje ten sam
// przygotowany odczyt z kilkoma błędami, żeby każdy badany przeszedł przez sprawdzanie i poprawki.

type Step = 'photo' | 'crop' | 'reading' | 'review' | 'name'
type Photo = { kind: 'file'; url: string } | { kind: 'sample' }

const stepNo: Record<Step, number> = { photo: 1, crop: 2, reading: 3, review: 3, name: 4 }

/** Przykładowa strona podręcznika na komputer (bez aparatu). Brakujące tłumaczenia jak w prawdziwym podręczniku. */
function SamplePage() {
  return (
    <div className="bg-[#FDFBF5] p-4 font-body text-[11px] leading-[16px] text-ink" lang="en" aria-label="Przykładowa strona z podręcznika">
      <p className="mb-1 text-[9px] uppercase tracking-widest text-ink-muted">Unit 3 · page 38</p>
      <p className="mb-2 font-head text-[16px]">{photoSample.title}</p>
      <p className="mb-2 font-bold">Vocabulary</p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {photoSample.words.map((w) => (
          <li key={w.id}>
            <strong>{w.en}</strong>
            {w.flag !== 'suggested' && <span lang="pl"> – {w.pl}</span>}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] italic text-ink-muted">Exercise 4. Describe your best friend using five adjectives.</p>
    </div>
  )
}

type Rect = { x: number; y: number; w: number; h: number }
type Corner = 'tl' | 'tr' | 'bl' | 'br'
const MIN = 15 // minimalny kadr w % zdjęcia

/** Ręczne kadrowanie (PRD 1.3): prostokąt z czterema uchwytami. Wynik odczytu od kadru nie zależy (symulacja). */
function Cropper({ children, rect, onChange }: { children: ReactNode; rect: Rect; onChange: (r: Rect) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const drag = useRef<Corner | null>(null)

  const move = (e: ReactPointerEvent) => {
    if (!drag.current || !box.current) return
    const b = box.current.getBoundingClientRect()
    const px = Math.min(100, Math.max(0, ((e.clientX - b.left) / b.width) * 100))
    const py = Math.min(100, Math.max(0, ((e.clientY - b.top) / b.height) * 100))
    let { x, y, w, h } = rect
    const right = x + w
    const bottom = y + h
    if (drag.current.includes('l')) x = Math.min(px, right - MIN)
    if (drag.current.includes('r')) w = Math.max(px, x + MIN) - x
    if (drag.current.includes('t')) y = Math.min(py, bottom - MIN)
    if (drag.current.includes('b')) h = Math.max(py, y + MIN) - y
    if (drag.current.includes('l')) w = right - x
    if (drag.current.includes('t')) h = bottom - y
    onChange({ x, y, w, h })
  }

  const corners: [Corner, string][] = [
    ['tl', '-left-3 -top-3'],
    ['tr', '-right-3 -top-3'],
    ['bl', '-bottom-3 -left-3'],
    ['br', '-bottom-3 -right-3'],
  ]

  return (
    <div ref={box} className="sticker relative touch-none select-none overflow-hidden rounded-md" onPointerMove={move} onPointerUp={() => (drag.current = null)}>
      {children}
      <div
        className="absolute border-2 border-dashed border-surface"
        style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%`, boxShadow: '0 0 0 9999px rgba(43,34,48,.55)' }}
      >
        {corners.map(([c, pos]) => (
          <span
            key={c}
            role="presentation"
            onPointerDown={(e) => {
              drag.current = c
              box.current?.setPointerCapture(e.pointerId)
            }}
            className={`absolute h-6 w-6 rounded-full border-2 border-ink bg-sun ${pos}`}
          />
        ))}
      </div>
    </div>
  )
}

const defaultName = () => {
  const d = fromDayKey(clock.today())
  return `Słówka ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function PhotoImportScreen() {
  const { go, home } = useNav()
  const createList = useStore((s) => s.createList)
  const [step, setStep] = useState<Step>('photo')
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [rect, setRect] = useState<Rect>({ x: 4, y: 14, w: 92, h: 72 })
  const [words, setWords] = useState<EditableWord[]>([])
  const [name, setName] = useState(defaultName)
  const [testDate, setTestDate] = useState('')
  const startedAt = useRef(clock.now())
  const edited = useRef(new Set<string>())
  const camera = useRef<HTMLInputElement>(null)
  const gallery = useRef<HTMLInputElement>(null)

  // Zdjęcie nie jest przechowywane (PRD F1): po odczycie albo wyjściu z ekranu zwalniamy plik.
  useEffect(() => () => {
    if (photo?.kind === 'file') URL.revokeObjectURL(photo.url)
  }, [photo])

  useEffect(() => {
    if (step !== 'reading') return
    const t = setTimeout(() => {
      const read = photoSample.words.map(({ read, flag, ...w }) => ({ ...w, en: read ?? w.en, flag }))
      setWords(read)
      setPhoto(null)
      track('words_recognized', { words: read.length, uncertain: read.filter((w) => w.flag === 'uncertain').length, suggested: read.filter((w) => w.flag === 'suggested').length })
      setStep('review')
    }, 1600)
    return () => clearTimeout(t)
  }, [step])

  const pick = (source: 'camera' | 'gallery' | 'sample', file?: File) => {
    track('photo_taken', { source })
    setPhoto(file ? { kind: 'file', url: URL.createObjectURL(file) } : { kind: 'sample' })
    setStep('crop')
  }

  const valid = cleanWords(words)
  const flagsLeft = words.filter((w) => w.flag).length

  const save = (practice: boolean) => {
    const id = `list-${clock.now().getTime()}`
    createList({ id, name: name.trim() || defaultName(), testDate: testDate || null, createdAt: clock.today(), words: valid })
    track('list_created', {
      listId: id,
      words: valid.length,
      edited: edited.current.size,
      flagsLeft,
      withTestDate: !!testDate,
      durationSec: Math.round((clock.now().getTime() - startedAt.current.getTime()) / 1000),
    })
    if (practice) go({ name: 'listPractice', listId: id, run: clock.now().getTime() })
    else home()
  }

  const back = () => {
    if (step === 'photo' || step === 'reading') return home()
    if (step === 'crop') {
      setPhoto(null)
      return setStep('photo')
    }
    if (step === 'review') return home()
    setStep('review')
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between pr-4">
        <ScreenHeader title="Słówka ze zdjęcia" onBack={back} close={step === 'photo' || step === 'review'} />
        <span className="text-label-caps text-ink-muted">Krok {stepNo[step]} z 4</span>
      </div>

      {step === 'photo' && (
        <div className="animate-screen flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
          <h2 className="font-head text-h2">Zrób zdjęcie listy słówek</h2>
          <div className="sticker flex gap-3 rounded-md bg-coral-soft p-4 shadow-st-sm">
            <Lightbulb size={24} weight="bold" className="shrink-0" aria-hidden />
            <ul className="space-y-1 text-small">
              <li>Połóż podręcznik płasko, w dobrym świetle.</li>
              <li>Trzymaj telefon prosto nad kartką.</li>
              <li>Wystarczy sama lista, resztę przytniesz.</li>
            </ul>
          </div>
          <p className="text-small text-ink-muted">Zdjęcie służy tylko do odczytania słówek. Nie zapisujemy go.</p>
          <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && pick('camera', e.target.files[0])} />
          <input ref={gallery} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && pick('gallery', e.target.files[0])} />
          <div className="mt-auto space-y-3">
            <Button variant="action" onClick={() => camera.current?.click()}>
              <span className="inline-flex items-center gap-2">
                <Camera size={22} weight="bold" aria-hidden /> Zrób zdjęcie
              </span>
            </Button>
            <Button variant="ghost" onClick={() => gallery.current?.click()}>
              <span className="inline-flex items-center gap-2">
                <Images size={22} weight="bold" aria-hidden /> Wybierz z galerii
              </span>
            </Button>
            <button
              type="button"
              onClick={() => pick('sample')}
              className="min-h-[44px] w-full text-small font-bold text-ink-muted underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
            >
              Użyj przykładowej strony z podręcznika
            </button>
          </div>
        </div>
      )}

      {step === 'crop' && photo && (
        <div className="animate-screen flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
          <h2 className="font-head text-h2">Przytnij do listy słówek</h2>
          <p className="text-small text-ink-muted">Przeciągnij żółte rogi tak, żeby w ramce była tylko lista.</p>
          <Cropper rect={rect} onChange={setRect}>
            {photo.kind === 'file' ? <img src={photo.url} alt="Twoje zdjęcie" className="block w-full" draggable={false} /> : <SamplePage />}
          </Cropper>
          <div className="mt-auto pt-2">
            <Button variant="primary" onClick={() => setStep('reading')}>
              Odczytaj słówka
            </Button>
          </div>
        </div>
      )}

      {step === 'reading' && (
        <div className="animate-screen flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center" role="status">
          <Mascot size={88} className="animate-pulse" />
          <p className="font-head text-h2">Czytam słówka…</p>
          <p className="text-small text-ink-muted">To potrwa chwilę.</p>
        </div>
      )}

      {step === 'review' && (
        <div className="animate-screen flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            <div>
              <h2 className="font-head text-h2">Sprawdź słówka</h2>
              <p className="mt-1 text-small text-ink-muted">
                Odczytaliśmy {wordsLabel(words.length)}. Popraw to, co się nie zgadza z podręcznikiem.
                {flagsLeft > 0 && ` Do sprawdzenia: ${flagsLeft}.`}
              </p>
            </div>
            <WordEditor words={words} onChange={setWords} onEdit={(w) => edited.current.add(w.id)} />
            <p className="text-small text-ink-muted">Zdjęcie zostało usunięte, zostały tylko słówka.</p>
          </div>
          <div className="border-t-2 border-ink bg-paper px-4 py-3">
            <Button variant="primary" disabled={valid.length < LISTS.minWords} onClick={() => setStep('name')}>
              Dalej
            </Button>
            {valid.length < LISTS.minWords && <p className="mt-2 text-center text-small text-ink-muted">Potrzebne są co najmniej {LISTS.minWords} słówka.</p>}
          </div>
        </div>
      )}

      {step === 'name' && (
        <div className="animate-screen flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6">
          <h2 className="font-head text-h2">Nazwij zestaw</h2>
          <label className="block">
            <span className="mb-1 block font-bold">Nazwa</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Unit 3 na piątek"
              className="min-h-[52px] w-full rounded-md border-2 border-ink bg-surface px-4 text-body shadow-st-sm outline-none focus:border-lavender"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-bold">
              Data sprawdzianu <span className="font-normal text-ink-muted">(opcjonalnie)</span>
            </span>
            <input
              type="date"
              value={testDate}
              min={clock.today()}
              onChange={(e) => setTestDate(e.target.value)}
              className="min-h-[52px] w-full rounded-md border-2 border-ink bg-surface px-4 text-body shadow-st-sm outline-none focus:border-lavender"
            />
            <span className="mt-1 block text-small text-ink-muted">Zestawy z najbliższym sprawdzianem będą na górze listy.</span>
          </label>
          <p className="text-small">{wordsLabel(valid.length)} w zestawie</p>
          <div className="mt-auto space-y-3">
            <Button variant="action" onClick={() => save(true)}>
              Zapisz i ćwicz
            </Button>
            <Button variant="ghost" onClick={() => save(false)}>
              Tylko zapisz
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
