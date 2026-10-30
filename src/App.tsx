import { useState } from 'react'
import { BottomNav } from './app/BottomNav'
import { useNav } from './app/nav'
import { PhoneFrame } from './app/PhoneFrame'
import { TopBar } from './app/TopBar'
import { useAppOpen } from './app/useAppOpen'
import { useClockVersion } from './app/useClock'
import { HeartsInfoModal } from './components/HeartsInfoModal'
import { StreakRiskModal } from './components/StreakRiskModal'
import { DevPanel } from './dev/DevPanel'
import { useStore } from './engine/store'
import { AdScreen } from './screens/AdScreen'
import { LeagueScreen } from './screens/LeagueScreen'
import { ChestScreen, LessonEndScreen } from './screens/LessonEndScreen'
import { JoinClassScreen } from './screens/JoinClassScreen'
import { LessonScreen } from './screens/LessonScreen'
import { ListDetailScreen } from './screens/ListDetailScreen'
import { ListPracticeEndScreen, ListPracticeScreen } from './screens/ListPracticeScreen'
import { ListsScreen } from './screens/ListsScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { PathScreen } from './screens/PathScreen'
import { PaywallScreen } from './screens/PaywallScreen'
import { PhotoImportScreen } from './screens/PhotoImportScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { QuestsScreen } from './screens/QuestsScreen'
import { openPaywall } from './screens/startLesson'
import { StreakScreen } from './screens/StreakScreen'

const tabScreens: Record<string, () => React.JSX.Element> = {
  path: PathScreen,
  league: LeagueScreen,
  quests: QuestsScreen,
  lists: ListsScreen,
  profile: ProfileScreen,
}

function Tabs() {
  const user = useStore((s) => s.user)
  const { tab, setTab, go } = useNav()
  const [hearts, setHearts] = useState(false)
  const Screen = tabScreens[tab] ?? PathScreen
  return (
    <>
      <TopBar
        streak={user.streak.current}
        xp={user.xp.total}
        hearts={user.hearts}
        onStat={(kind) => {
          if (kind === 'streak') go({ name: 'streak' })
          if (kind === 'xp') setTab('league')
          if (kind === 'hearts') setHearts(true)
        }}
      />
      <main key={tab} className="animate-screen flex flex-1 flex-col overflow-y-auto">
        <Screen />
      </main>
      <BottomNav active={tab} onChange={setTab} />
      <StreakRiskModal />
      <HeartsInfoModal
        open={hearts}
        onClose={() => setHearts(false)}
        onPlus={() => {
          setHearts(false)
          openPaywall('hearts')
        }}
      />
    </>
  )
}

export default function App() {
  useAppOpen()
  useClockVersion()
  const screen = useNav((s) => s.screen)
  const onboarded = useStore((s) => s.user.onboarded)
  // Lekcja, nagroda, reklama, seria i paywall przejmują cały ekran: bez dolnego paska (DESIGN.md §4).
  return (
    <>
      <PhoneFrame>
        {!onboarded ? (
          <OnboardingScreen />
        ) : (
          <>
            {screen.name === 'tabs' && <Tabs />}
            {screen.name === 'lesson' && <LessonScreen key={screen.run} lessonId={screen.lessonId} />}
            {screen.name === 'lessonEnd' && <LessonEndScreen summary={screen.summary} />}
            {screen.name === 'chest' && <ChestScreen xp={screen.xp} />}
            {screen.name === 'ad' && <AdScreen />}
            {screen.name === 'streak' && <StreakScreen />}
            {screen.name === 'paywall' && <PaywallScreen />}
            {screen.name === 'photoImport' && <PhotoImportScreen />}
            {screen.name === 'wordList' && <ListDetailScreen key={screen.listId} listId={screen.listId} />}
            {screen.name === 'listPractice' && <ListPracticeScreen key={screen.run} listId={screen.listId} />}
            {screen.name === 'listPracticeEnd' && <ListPracticeEndScreen summary={screen.summary} />}
            {screen.name === 'joinClass' && <JoinClassScreen />}
          </>
        )}
      </PhoneFrame>
      <DevPanel />
    </>
  )
}
