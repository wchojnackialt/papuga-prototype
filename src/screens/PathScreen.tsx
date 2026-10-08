import { useEffect, useRef, useState } from 'react'
import { useNav } from '../app/nav'
import { HeartsEmptyModal } from '../components/HeartsEmptyModal'
import { Mascot } from '../components/Mascot'
import { PathNode } from '../components/PathNode'
import { UnitBanner } from '../components/UnitBanner'
import { course } from '../engine/content'
import { nodeStatus } from '../engine/rules'
import { useStore } from '../engine/store'
import { openPaywall, startLesson } from './startLesson'

// Zygzak ścieżki: przesunięcie w poziomie dla kolejnych węzłów jednostki.
const zigzag = [0, 56, 84, 56, 0]

// PRD §4.2: banner jednostki, węzły zygzakiem (ukończona, bieżąca, zablokowana, skrzynka).
export function PathScreen() {
  const user = useStore((s) => s.user)
  const openChest = useStore((s) => s.openChest)
  const go = useNav((s) => s.go)
  const [hint, setHint] = useState<string | null>(null)
  const [heartsModal, setHeartsModal] = useState(false)
  const currentRef = useRef<HTMLDivElement>(null)

  // Przewiń do bieżącej lekcji tylko wtedy, gdy nie widać jej na starcie (np. Zosia w jednostce 2).
  useEffect(() => {
    const node = currentRef.current
    const box = node?.closest('main')?.getBoundingClientRect()
    if (node && box && node.getBoundingClientRect().bottom > box.bottom - 40) node.scrollIntoView({ block: 'center' })
  }, [])

  useEffect(() => {
    if (!hint) return
    const t = setTimeout(() => setHint(null), 2500)
    return () => clearTimeout(t)
  }, [hint])

  const onNode = (nodeId: string, chest: boolean, unitLocked: boolean) => {
    const status = unitLocked ? 'locked' : nodeStatus(user, nodeId)
    if (status === 'locked') return setHint(nodeId)
    if (chest) {
      if (status === 'current') go({ name: 'chest', xp: openChest(nodeId) })
      return
    }
    // Ukończone węzły pozwalają powtórzyć lekcję (PRD §4.2).
    if (!startLesson(nodeId)) setHeartsModal(true)
  }

  return (
    <div className="space-y-10 px-4 pb-10 pt-4">
      {course.units.map((unit, u) => (
        <div key={unit.id} className="space-y-8">
          <UnitBanner
            unitNo={u + 1}
            lessonNo={unit.lessons.findIndex((l) => l.id === user.progress.currentLesson) + 1 || null}
            title={unit.title}
            locked={unit.locked}
          />
          <div className="relative flex flex-col items-center gap-14 pt-10">
            {u === 0 && (
              <div className="absolute right-2 top-24">
                <Mascot size={64} />
              </div>
            )}
            {unit.lessons.map((lesson, i) => {
              const chest = lesson.kind === 'chest'
              const status = unit.locked ? 'locked' : nodeStatus(user, lesson.id)
              const offset = zigzag[i % zigzag.length] * (u % 2 ? 1 : -1)
              const label = chest
                ? `Skrzynka, jednostka ${u + 1}${status === 'locked' ? ', zablokowana' : status === 'done' ? ', otwarta' : ''}`
                : `Jednostka ${u + 1}, lekcja ${i + 1}${status === 'locked' ? ', zablokowana' : status === 'done' ? ', ukończona' : ', bieżąca'}`
              return (
                <div
                  key={lesson.id}
                  ref={status === 'current' ? currentRef : undefined}
                  className="relative"
                  style={{ transform: `translateX(${offset}px)` }}
                >
                  <PathNode state={status} chest={chest} label={label} onClick={() => onNode(lesson.id, chest, unit.locked)} />
                  {hint === lesson.id && (
                    <p
                      role="status"
                      className="sticker animate-screen absolute left-1/2 top-[76px] z-10 w-56 -translate-x-1/2 rounded-sm bg-surface p-3 text-center text-small font-bold shadow-st-md"
                    >
                      Ukończ poprzednie lekcje, żeby odblokować
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <HeartsEmptyModal
        open={heartsModal}
        onWait={() => setHeartsModal(false)}
        onPlus={() => {
          setHeartsModal(false)
          openPaywall('hearts')
        }}
      />
    </div>
  )
}
