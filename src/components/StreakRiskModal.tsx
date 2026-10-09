import { Fire } from '@phosphor-icons/react'
import { useState } from 'react'
import { clock } from '../engine/clock'
import { course } from '../engine/content'
import { daysWord } from '../engine/labels'
import { useStore } from '../engine/store'
import { openPaywall, startLesson } from '../screens/startLesson'
import { Button } from './Button'
import { HeartsEmptyModal } from './HeartsEmptyModal'
import { Mascot } from './Mascot'
import { Modal } from './Modal'

// PRD §4.6 (S): przy otwarciu aplikacji po 18:00, jeśli dziś nie było lekcji. Celowo natarczywy (seria jako obowiązek, as-is).
export function StreakRiskModal() {
  const open = useStore((s) => s.streakReminder)
  const user = useStore((s) => s.user)
  const dismiss = useStore((s) => s.dismissStreakReminder)
  const [noHearts, setNoHearts] = useState(false)
  const now = clock.now()
  const hoursLeft = 24 - now.getHours()

  const lessonNow = () => {
    dismiss()
    const lesson = user.progress.currentLesson ?? course.units[0].lessons[0].id
    if (!startLesson(lesson)) setNoHearts(true)
  }

  return (
    <>
      <Modal open={open} onClose={dismiss} title="Twoja seria jest zagrożona!">
        <div className="mb-4 flex items-center justify-center gap-4">
          <Mascot mood="reminder" size={72} />
          <span className="flex items-center gap-1 font-head text-display text-flame">
            <Fire size={40} weight="fill" aria-hidden />
            {user.streak.current}
          </span>
        </div>
        <p className="mb-5 text-body font-bold">
          {user.streak.current} {daysWord(user.streak.current)} serii przepadnie za {hoursLeft} h! Zrób jedną lekcję przed północą 🔥
        </p>
        <div className="space-y-3">
          <Button variant="action" onClick={lessonNow}>
            Ratuj serię
          </Button>
          <Button variant="ghost" onClick={dismiss}>
            Później
          </Button>
        </div>
      </Modal>
      <HeartsEmptyModal
        open={noHearts}
        onWait={() => setNoHearts(false)}
        onPlus={() => {
          setNoHearts(false)
          openPaywall('hearts')
        }}
      />
    </>
  )
}
