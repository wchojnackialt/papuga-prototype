import { describe, expect, it } from 'vitest'
import { formatNumber } from './format'

describe('formatNumber', () => {
  it('oddziela tysiące spacją', () => {
    expect(formatNumber(12480)).toBe('12 480')
    expect(formatNumber(1200000)).toBe('1 200 000')
    expect(formatNumber(340)).toBe('340')
  })
})
