import { Trophy } from '@phosphor-icons/react'
import { Fragment, useEffect, useRef } from 'react'
import { clock } from '../engine/clock'
import { league } from '../engine/content'
import { formatNumber } from '../engine/format'
import { daysWord, tierBg, tierLabel } from '../engine/labels'
import { daysLeftInWeek, leagueStandings, RULES } from '../engine/rules'
import { leagueTiers } from '../engine/schema'
import { useStore } from '../engine/store'
import { track } from '../engine/track'

// PRD §4.5: ranking tygodniowy 30 osób, moja pozycja, strefa awansu (top 7) i spadku (ostatnie 5).
export function LeagueScreen() {
  const user = useStore((s) => s.user)
  const rows = leagueStandings(user, league)
  const me = rows.find((r) => r.isMe)!
  const left = daysLeftInWeek(clock.today())
  const meRef = useRef<HTMLLIElement>(null)
  const tracked = useRef(false)

  useEffect(() => {
    if (!tracked.current) track('league_viewed', { rank: me.rank }) // StrictMode w dev uruchamia efekt dwa razy
    tracked.current = true
    meRef.current?.scrollIntoView({ block: 'center' })
  }, [me.rank])

  return (
    <div className="px-4 pb-8 pt-4">
      <div className="mb-4 flex justify-center gap-2" aria-label="Ligi">
        {leagueTiers.map((t) => (
          <span
            key={t}
            title={tierLabel[t]}
            className={`sticker flex h-11 w-11 items-center justify-center rounded-sm ${tierBg[t]}
              ${t === user.league.tier ? 'scale-110 shadow-st-md' : 'opacity-40'}`}
          >
            <Trophy size={22} weight="fill" aria-hidden />
          </span>
        ))}
      </div>
      <h1 className="text-center font-head text-h1">Liga {tierLabel[user.league.tier]}</h1>
      <p className="mb-5 text-center text-small text-ink-muted">
        {left === 0 ? 'Ostatni dzień tygodnia!' : `Do końca tygodnia: ${left} ${daysWord(left)}`} · Top {RULES.promoteTop} awansuje
      </p>

      <ol className="sticker overflow-hidden rounded-md bg-surface shadow-st-md">
        {rows.map((r, i) => (
          <Fragment key={r.id}>
            {i === RULES.promoteTop && (
              <li aria-hidden className="flex items-center gap-2 border-y-2 border-lime-ink bg-lime-soft px-3 py-1 text-label-caps text-lime-ink">
                ▲ Strefa awansu
              </li>
            )}
            {i === rows.length - RULES.demoteBottom && (
              <li aria-hidden className="flex items-center gap-2 border-y-2 border-error-ink bg-error-soft px-3 py-1 text-label-caps text-error-ink">
                ▼ Strefa spadku
              </li>
            )}
            <li
              ref={r.isMe ? meRef : undefined}
              aria-current={r.isMe ? 'true' : undefined}
              className={`flex min-h-[52px] items-center gap-3 px-3 ${r.isMe ? 'bg-lavender-soft font-bold' : ''} ${i > 0 ? 'border-t border-ink/10' : ''}`}
            >
              <span className={`w-6 text-center font-head text-stat ${r.zone === 'promote' ? 'text-lime-ink' : r.zone === 'demote' ? 'text-error-ink' : ''}`}>
                {r.rank}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-paper text-xl" aria-hidden>
                {r.avatar}
              </span>
              <span className="flex-1">{r.isMe ? `${r.name} (Ty)` : r.name}</span>
              <span className="text-small">{formatNumber(r.xp)} XP</span>
            </li>
          </Fragment>
        ))}
      </ol>
    </div>
  )
}
