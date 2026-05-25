import { describe, it, expect } from 'vitest'
import { getArrayMean, standardDeviation, standardError, getPercentage, zScore } from '../stats.js'

describe('mean', () => {
  it('returns null for empty array',   () => expect(getArrayMean([])).toBeNull())
  it('returns null for null input',    () => expect(getArrayMean(null)).toBeNull())
  it('returns value for single item',  () => expect(getArrayMean([5])).toBe(5))
  it('computes correctly',             () => expect(getArrayMean([1, 2, 3, 4, 5])).toBe(3))
  it('handles decimals',               () => expect(getArrayMean([1.5, 2.5])).toBe(2))
  it('handles negatives',              () => expect(getArrayMean([-2, 0, 2])).toBe(0))
})

describe('standardDeviation', () => {
  it('returns null for empty array',   () => expect(standardDeviation([])).toBeNull())
  it('returns null for single item',   () => expect(standardDeviation([5])).toBeNull())
  it('returns 0 for identical values', () => expect(standardDeviation([3, 3, 3])).toBe(0))
  it('computes sample SD correctly',   () => {
    // [2,4,4,4,5,5,7,9]  sample SD (÷ n-1) ≈ 2.138
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 2)
  })
  it('is always non-negative',         () => expect(standardDeviation([1, 9])).toBeGreaterThanOrEqual(0))
})

describe('standardError', () => {
  it('returns null for single item',   () => expect(standardError([5])).toBeNull())
  it('equals SD / sqrt(n)',            () => {
    const arr = [2, 4, 4, 4, 5, 5, 7, 9]
    const sd  = standardDeviation(arr)
    expect(standardError(arr)).toBeCloseTo(sd / Math.sqrt(arr.length), 10)
  })
})

describe('pct', () => {
  it('returns null for zero denominator', () => expect(getPercentage(5, 0)).toBeNull())
  it('returns null for null denominator', () => expect(getPercentage(5, null)).toBeNull())
  it('computes 50%',                      () => expect(getPercentage(1, 2)).toBe(50))
  it('computes 100%',                     () => expect(getPercentage(10, 10)).toBe(100))
  it('computes 0%',                       () => expect(getPercentage(0, 10)).toBe(0))
  it('can exceed 100',                    () => expect(getPercentage(15, 10)).toBe(150))
})

describe('zScore (inverse normal CDF with log-linear correction)', () => {
  it('returns finite value for p=0.5',  () => {
    const z = zScore(0.5, 40)
    expect(isFinite(z)).toBe(true)
  })
  it('log-linear correction avoids Infinity at p=0', () => {
    // 0 hits out of 13 targets: corrected p = 0.5/14 should not be -Infinity
    const z = zScore(0, 13)
    expect(isFinite(z)).toBe(true)
    expect(z).toBeLessThan(0)
  })
  it('log-linear correction avoids Infinity at p=1', () => {
    const z = zScore(1, 27)
    expect(isFinite(z)).toBe(true)
    expect(z).toBeGreaterThan(0)
  })
  it('higher probability yields higher z-score', () => {
    expect(zScore(0.84, 100)).toBeGreaterThan(zScore(0.5, 100))
  })
  it('z-score near 0 for p near 0.5', () => {
    expect(Math.abs(zScore(0.5, 100))).toBeLessThan(0.1)
  })
})
