import { useState } from 'react'
import { useNav, type LessonSummary } from '../app/nav'
import { Nudge } from '../components/Nudge'
import { league } from '../engine/content'
import { leagueStandings, RULES } from '../engine/rules'
import type { UserState } from '../engine/schema'
import { useStore } from '../engine/store'
import { RewardScreen } from './RewardScreen'

const questLabel = { xp: 'zdobądź 30 XP', lessons: 'ukończ 2 lekcje', perfect: 'zrób lekcję bez błędów' } as const

/** Jeden losowy nudge pod kartami (PRD §4.4): seria, liga albo zadanie dnia. O umiejętnościach ani słowa (as-is). */
function pickNudge(user: UserState) {
  const options = []

  options.push(
    <Nudge variant="streak" icon="🔥">
      Seria {user.streak.current} {user.streak.current === 1 ? 'dzień' : 'dni'}! Wróć jutro, bo stracisz serię.
    </Nudge>,
  )

  const rows = leagueStandings(user, league)
  const me = rows.find((r) => r.isMe)!
  if (me.rank > RULES.promoteTop) {
    const gap = rows[RULES.promoteTop - 1].xp - me.xp + 1
    options.push(
      <Nudge variant="league" icon="🏆">
        Jeszcze {gap} XP do strefy awansu! Zrób kolejną lekcję.
      </Nudge>,
    )
  } else if (me.rank > 1) {
    const ahead = rows[me.rank - 2]
    options.push(
      <Nudge variant="league" icon="🏆">
        Jeszcze {ahead.xp - me.xp + 1} XP i wyprzedzisz: {ahead.name}!
      </Nudge>,
    )
  }

  const quest = user.quests.items.find((q) => q.progress < q.target)
  if (quest) {
    options.push(
      <Nudge variant="quest" icon="🎯">
        Zadanie dnia: {questLabel[quest.id]}. Jeszcze jedna lekcja!
      </Nudge>,
    )
  }
  return options[Math.floor(Math.random() * options.length)]
}

// PRD §4.4: koniec lekcji. Plan darmowy: po „Dalej” pełnoekranowa reklama.
export function LessonEndScreen({ summary }: { summary: LessonSummary }) {
  const user = useStore((s) => s.user)
  const { go, home } = useNav()
  const [nudge] = useState(() => pickNudge(user))
  return (
    <RewardScreen
      title="Lekcja ukończona!"
      stats={[
        { kind: 'xp', value: summary.xp },
        { kind: 'streak', value: summary.streak },
        { kind: 'accuracy', value: summary.accuracy },
      ]}
      nudge={nudge}
      onContinue={() => (user.plan === 'free' ? go({ name: 'ad' }) : home())}
    />
  )
}

export function ChestScreen({ xp }: { xp: number }) {
  const user = useStore((s) => s.user)
  const home = useNav((s) => s.home)
  return (
    <RewardScreen
      title="Skrzynka otwarta!"
      stats={[
        { kind: 'xp', value: xp },
        { kind: 'streak', value: user.streak.current },
      ]}
      onContinue={home}
    />
  )
}
