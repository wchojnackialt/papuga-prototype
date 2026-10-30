import { CalendarBlank, ShareNetwork } from '@phosphor-icons/react'
import { clock } from '../engine/clock'
import { diffDays } from '../engine/dates'
import { useStore } from '../engine/store'
import { knownCount, testDateLabel, wordsLabel, type ListEntry } from '../engine/wordLists'
import { ProgressBar } from './ProgressBar'

/** Chip z datą sprawdzianu: w ciągu tygodnia wyróżniony kolorem akcji. */
export function TestDateChip({ testDate }: { testDate: string | null }) {
  const today = clock.today()
  const label = testDateLabel(testDate, today)
  if (!label || !testDate) return null
  const d = diffDays(today, testDate)
  const look = d < 0 ? 'bg-locked text-ink-muted' : d <= 7 ? 'bg-coral-soft' : 'bg-surface'
  return (
    <span className={`sticker inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-small font-bold ${look}`}>
      <CalendarBlank size={14} weight="bold" aria-hidden /> {label}
    </span>
  )
}

/** Karta zestawu w „Moich listach”: nazwa, źródło, data sprawdzianu i „umiesz X z Y”. */
export function ListCard({ entry, onOpen, showAuthor }: { entry: ListEntry; onOpen: () => void; showAuthor?: boolean }) {
  const progress = useStore((s) => s.user.wordProgress)
  const { list } = entry
  const known = knownCount(list, progress)
  const total = list.words.length
  return (
    <button
      type="button"
      onClick={onOpen}
      className="sticker press-md block w-full rounded-md bg-surface p-4 text-left
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender"
    >
      <div className="mb-1 flex items-start justify-between gap-3">
        <span className="font-bold">{list.name}</span>
        <span className="shrink-0 text-small text-ink-muted">{wordsLabel(total)}</span>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {showAuthor && (
          <span className="text-small text-ink-muted">
            <span aria-hidden>{entry.avatar}</span> {entry.mine ? 'Twój zestaw' : entry.author}
          </span>
        )}
        {!showAuthor && entry.list.shared && (
          <span className="inline-flex items-center gap-1 text-small text-ink-muted">
            <ShareNetwork size={14} weight="bold" aria-hidden /> Udostępniony klasie
          </span>
        )}
        <TestDateChip testDate={list.testDate} />
      </div>
      <div className="flex items-center gap-3">
        <ProgressBar value={total ? known / total : 0} label={`${list.name}: umiesz ${known} z ${total}`} />
        <span className="shrink-0 text-small font-bold">
          umiesz {known} z {total}
        </span>
      </div>
    </button>
  )
}
