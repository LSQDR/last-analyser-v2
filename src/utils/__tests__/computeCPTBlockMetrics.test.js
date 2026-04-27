import { describe, it, expect } from 'vitest'
import { computeBlockMetrics } from '../compute/computeCPTBlockMetrics.js'

// Helper — build a minimal event
function makeEvent(type, classification, rtms = null, include = true) {
  return { type, classification, rtms, include, scheduledAtMs: 1000, isi: 1500 }
}

describe('computeBlockMetrics', () => {
  it('returns zero omissions for all hits', () => {
    const events = [
      makeEvent('target', 'hit', 320),
      makeEvent('target', 'hit', 340),
      makeEvent('non-target', 'correct-rejection'),
    ]
    const m = computeBlockMetrics(events)
    expect(m.omissions).toBe(0)
    expect(m.omissionRatepct).toBe(0)
  })

  it('counts omissions correctly', () => {
    const events = [
      makeEvent('target', 'omission'),
      makeEvent('target', 'hit', 300),
      makeEvent('target', 'omission'),
    ]
    const m = computeBlockMetrics(events)
    expect(m.omissions).toBe(2)
    expect(m.omissionRatepct).toBeCloseTo(66.67, 1)
  })

  it('counts commissions correctly', () => {
    const events = [
      makeEvent('non-target', 'commission', 250),
      makeEvent('non-target', 'correct-rejection'),
      makeEvent('target', 'hit', 310),
    ]
    const m = computeBlockMetrics(events)
    expect(m.commissions).toBe(1)
    expect(m.commissionRatepct).toBeCloseTo(50, 1)
  })

  it('computes mean RT from hit RTs only', () => {
    const events = [
      makeEvent('target', 'hit', 300),
      makeEvent('target', 'hit', 400),
      makeEvent('target', 'omission'),
    ]
    const m = computeBlockMetrics(events)
    expect(m.cleanMeanRTms).toBeCloseTo(350, 1)
  })

  it('returns null cleanMeanRTms when no hits have RT', () => {
    const events = [makeEvent('target', 'omission')]
    const m = computeBlockMetrics(events)
    expect(m.cleanMeanRTms).toBeNull()
  })

  it('handles empty event log', () => {
    const m = computeBlockMetrics([])
    expect(m.omissions).toBe(0)
    expect(m.hits).toBe(0)
    expect(m.cleanMeanRTms).toBeNull()
  })

  it('flags highOmission when omission rate exceeds 25%', () => {
    const events = Array.from({ length: 10 }, (_, i) =>
      makeEvent('target', i < 3 ? 'hit' : 'omission', i < 3 ? 300 : null)
    )
    const m = computeBlockMetrics(events)
    expect(m.flags).toContain('highOmission')
  })
})
