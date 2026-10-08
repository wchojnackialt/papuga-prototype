// Daty jako klucze dnia „YYYY-MM-DD” w czasie lokalnym. Bez stref czasowych: prototyp działa w czasie urządzenia.

export type DayKey = string

const pad = (n: number) => String(n).padStart(2, '0')

export function toDayKey(d: Date): DayKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: DayKey, n: number): DayKey {
  const d = fromDayKey(key)
  d.setDate(d.getDate() + n)
  return toDayKey(d)
}

/** Liczba dni kalendarzowych od `a` do `b` (b − a). */
export function diffDays(a: DayKey, b: DayKey): number {
  const ms = fromDayKey(b).getTime() - fromDayKey(a).getTime()
  return Math.round(ms / 86_400_000)
}

/** Dzień tygodnia ISO: poniedziałek = 1 … niedziela = 7. */
export function isoWeekday(key: DayKey): number {
  const day = fromDayKey(key).getDay()
  return day === 0 ? 7 : day
}

/** Poniedziałek tygodnia, w którym leży `key` (tydzień ligi: pon–niedz.). */
export function weekStart(key: DayKey): DayKey {
  return addDays(key, 1 - isoWeekday(key))
}
