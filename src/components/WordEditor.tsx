import { Check, Plus, Sparkle, Trash, Warning } from '@phosphor-icons/react'
import type { Word } from '../engine/schema'

export type EditableWord = Word & { flag?: 'uncertain' | 'suggested' }

const inputClass = `min-h-[44px] w-full min-w-0 rounded-sm border-2 border-ink bg-surface px-3 text-body outline-none
  focus:border-lavender placeholder:text-ink-muted`

/**
 * Lista par słówko–tłumaczenie do sprawdzenia i poprawek (PRD 1.4–1.5).
 * Niepewny odczyt i podpowiedziane tłumaczenie są oznaczone kolorem, ikoną i tekstem; edycja albo „Dobrze” zdejmuje oznaczenie.
 */
export function WordEditor({ words, onChange, onEdit }: { words: EditableWord[]; onChange: (words: EditableWord[]) => void; onEdit?: (word: EditableWord) => void }) {
  const set = (id: string, patch: Partial<EditableWord>) => onChange(words.map((w) => (w.id === id ? { ...w, ...patch } : w)))
  const edit = (w: EditableWord, patch: Partial<Word>) => {
    onEdit?.(w)
    set(w.id, { ...patch, flag: undefined })
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_44px] gap-2 px-1 text-label-caps text-ink-muted" aria-hidden>
        <span>Angielski</span>
        <span>Polski</span>
      </div>
      <ul className="space-y-2">
        {words.map((w, i) => {
          const look = w.flag === 'uncertain' ? 'border-ink bg-coral-soft' : w.flag === 'suggested' ? 'border-ink bg-lavender-soft' : 'border-transparent'
          return (
            <li key={w.id} className={`rounded-md border-2 p-1 ${look}`}>
              <div className="grid grid-cols-[1fr_1fr_44px] items-center gap-2">
                <input
                  aria-label={`Słówko ${i + 1} po angielsku`}
                  lang="en"
                  spellCheck={false}
                  autoCapitalize="off"
                  value={w.en}
                  placeholder="word"
                  onChange={(e) => edit(w, { en: e.target.value })}
                  className={inputClass}
                />
                <input
                  aria-label={`Słówko ${i + 1} po polsku`}
                  value={w.pl}
                  placeholder="tłumaczenie"
                  onChange={(e) => edit(w, { pl: e.target.value })}
                  className={inputClass}
                />
                <button
                  type="button"
                  aria-label={`Usuń słówko ${w.en || i + 1}`}
                  onClick={() => onChange(words.filter((x) => x.id !== w.id))}
                  className="flex h-11 w-11 items-center justify-center rounded-sm text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
                >
                  <Trash size={20} weight="bold" aria-hidden />
                </button>
              </div>
              {w.flag && (
                <div className="flex items-center justify-between gap-2 px-2 pt-1">
                  <span className="flex items-center gap-1 text-small font-bold">
                    {w.flag === 'uncertain' ? (
                      <>
                        <Warning size={16} weight="bold" aria-hidden /> Sprawdź pisownię, mogło się źle odczytać
                      </>
                    ) : (
                      <>
                        <Sparkle size={16} weight="bold" className="text-lavender" aria-hidden /> Tłumaczenie podpowiedziane
                      </>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => set(w.id, { flag: undefined })}
                    className="sticker press-sm flex min-h-[36px] shrink-0 items-center gap-1 rounded-sm bg-surface px-2 text-small font-bold
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
                  >
                    <Check size={14} weight="bold" aria-hidden /> Dobrze
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...words, { id: `w${Date.now()}`, en: '', pl: '' }])}
        className="sticker press-sm flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border-dashed bg-paper font-bold
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender"
      >
        <Plus size={18} weight="bold" aria-hidden /> Dodaj słówko
      </button>
    </div>
  )
}
