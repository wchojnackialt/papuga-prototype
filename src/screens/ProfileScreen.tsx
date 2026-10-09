import { Crown } from '@phosphor-icons/react'
import { Button } from '../components/Button'
import { profileSlot as ProfileSlot } from '../config/profileSlot.config'
import { badges } from '../engine/content'
import { fromDayKey } from '../engine/dates'
import { formatNumber } from '../engine/format'
import { daysWord, monthGenitive, tierLabel } from '../engine/labels'
import { isBadgeUnlocked, isPlus } from '../engine/rules'
import { useStore } from '../engine/store'
import { openPaywall } from './startLesson'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="sticker rounded-md bg-surface p-3 shadow-st-md">
      <p className="font-head text-stat">{value}</p>
      <p className="text-small text-ink-muted">{label}</p>
    </div>
  )
}

// PRD §4.8: statystyki wysiłku, odznaki, pusty slot. Brak jakiejkolwiek informacji o umiejętnościach (celowo).
export function ProfileScreen() {
  const user = useStore((s) => s.user)
  const joined = fromDayKey(user.profile.joinedAt)

  return (
    <div className="space-y-6 px-4 pb-8 pt-6">
      <section className="flex items-center gap-4">
        <span className="sticker flex h-20 w-20 items-center justify-center rounded-full bg-lavender-soft text-[44px] shadow-st-md" aria-hidden>
          {user.profile.avatar}
        </span>
        <div>
          <h1 className="font-head text-h1">{user.profile.name}</h1>
          <p className="text-small text-ink-muted">
            W Papudze od {monthGenitive[joined.getMonth()]} {joined.getFullYear()}
          </p>
          {isPlus(user) && (
            <span className="sticker mt-1 inline-flex items-center gap-1 rounded-sm bg-sun px-2 py-0.5 text-label-caps">
              <Crown size={14} weight="fill" aria-hidden /> Papuga Plus
            </span>
          )}
        </div>
      </section>

      {!isPlus(user) && (
        <section className="sticker rounded-md bg-lavender p-4 text-white shadow-st-lg">
          <p className="font-head text-h2">Ucz się bez limitów</p>
          <p className="mb-3 text-small">Bez reklam, nielimitowane serca i zamrożenie serii.</p>
          <Button variant="ghost" onClick={() => openPaywall('profile_banner')}>
            Wypróbuj Papuga Plus
          </Button>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-head text-h2">Statystyki</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Łączne XP" value={formatNumber(user.xp.total)} />
          <StatCard label="Seria" value={`${formatNumber(user.streak.current)} ${daysWord(user.streak.current)}`} />
          <StatCard label="Najdłuższa seria" value={`${formatNumber(user.streak.longest)} ${daysWord(user.streak.longest)}`} />
          <StatCard label="Liga" value={tierLabel[user.league.tier]} />
        </div>
      </section>

      {ProfileSlot && <ProfileSlot />}

      <section>
        <h2 className="mb-3 font-head text-h2">Odznaki</h2>
        <ul className="grid grid-cols-3 gap-3">
          {badges.map((b) => {
            const unlocked = isBadgeUnlocked(user, b)
            return (
              <li
                key={b.id}
                className={`sticker flex flex-col items-center gap-1 rounded-md p-3 text-center ${unlocked ? 'bg-sun shadow-st-sm' : 'border-dashed bg-locked text-ink-muted'}`}
              >
                <span className={`text-3xl ${unlocked ? '' : 'opacity-30 grayscale'}`} aria-hidden>
                  {b.icon}
                </span>
                <span className="text-small font-bold leading-tight">{b.title}</span>
                <span className="sr-only">{unlocked ? 'zdobyta' : 'zablokowana'}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
