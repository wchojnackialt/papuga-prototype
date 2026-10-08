// DESIGN.md §6: separator tysięcy = spacja („12 480 XP”). Twarda spacja, żeby liczba się nie łamała.
export function formatNumber(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
