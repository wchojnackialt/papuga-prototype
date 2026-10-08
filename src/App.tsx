import { BottomNav } from './app/BottomNav'
import { useNav } from './app/nav'
import { PhoneFrame } from './app/PhoneFrame'
import { TopBar } from './app/TopBar'
import { useAppOpen } from './app/useAppOpen'
import { navItems } from './config/nav.config'
import { useStore } from './engine/store'
import { AdScreen } from './screens/AdScreen'
import { ComingSoon } from './screens/ComingSoon'
import { ChestScreen, LessonEndScreen } from './screens/LessonEndScreen'
import { LessonScreen } from './screens/LessonScreen'
import { PathScreen } from './screens/PathScreen'
import { PaywallScreen } from './screens/PaywallScreen'

function Tabs() {
  const user = useStore((s) => s.user)
  const { tab, setTab } = useNav()
  return (
    <>
      <TopBar streak={user.streak.current} xp={user.xp.total} hearts={user.hearts} />
      <main key={tab} className="animate-screen flex flex-1 flex-col overflow-y-auto">
        {tab === 'path' ? <PathScreen /> : <ComingSoon title={navItems.find((n) => n.id === tab)?.label ?? ''} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}

export default function App() {
  useAppOpen()
  const screen = useNav((s) => s.screen)
  // Lekcja, nagroda, reklama i paywall przejmują cały ekran: bez dolnego paska (DESIGN.md §4).
  return (
    <PhoneFrame>
      {screen.name === 'tabs' && <Tabs />}
      {screen.name === 'lesson' && <LessonScreen key={screen.run} lessonId={screen.lessonId} />}
      {screen.name === 'lessonEnd' && <LessonEndScreen summary={screen.summary} />}
      {screen.name === 'chest' && <ChestScreen xp={screen.xp} />}
      {screen.name === 'ad' && <AdScreen />}
      {screen.name === 'paywall' && <PaywallScreen />}
    </PhoneFrame>
  )
}
