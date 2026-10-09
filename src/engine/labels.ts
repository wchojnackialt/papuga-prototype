import type { LeagueTier } from './schema'

// Polskie etykiety wartości z danych (UI po polsku, DESIGN.md §6).

export const tierLabel: Record<LeagueTier, string> = {
  bronze: 'Brąz',
  silver: 'Srebro',
  gold: 'Złoto',
  sapphire: 'Szafir',
  diamond: 'Diament',
}

export const tierBg: Record<LeagueTier, string> = {
  bronze: 'bg-league-bronze',
  silver: 'bg-league-silver',
  gold: 'bg-league-gold',
  sapphire: 'bg-league-sapphire',
  diamond: 'bg-league-diamond',
}

/** „1 dzień”, „2 dni”, „5 dni”. */
export const daysWord = (n: number) => (n === 1 ? 'dzień' : 'dni')

export const monthNames = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
export const monthGenitive = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']
