import { describe, it, expect } from 'vitest'
import { computeNBackMetrics } from '../compute/computeNBackMetrics.js'

function makeEvent(isTarget, responded, rtms = null) {
  const hit  = isTarget  &&  responded
  const miss = isTarget  && !responded
  const fa   = !isTarget &&  responded
  const _cr   = !isTarget && !responded
  const classification = hit ? 'hit' : miss ? 'miss' : fa ? 'falseAlarm' : 'correctRejection'
  return { isTarget, responded, rtms, classification, include: true }
}

describe('computeNBackMetrics', () => {
  it('counts hits, misses, false alarms, correct rejections', () => {
    const events = [
      makeEvent(true,  true,  450), // hit
      makeEvent(true,  false),      // miss
      makeEvent(false, true,  380), // false alarm
      makeEvent(false, false),      // correct rejection
    ]
    const m = computeNBackMetrics(events)
    expect(m.hits).toBe(1)
    expect(m.misses).toBe(1)
    expect(m.falseAlarms).toBe(1)
    expect(m.correctRejections).toBe(1)
  })

  it('corrected hit rate = hit rate − false alarm rate', () => {
    const events = [
      makeEvent(true,  true,  400),
      makeEvent(true,  true,  420),
      makeEvent(false, false),
      makeEvent(false, true, 350), // false alarm
    ]
    const m = computeNBackMetrics(events)
    // hit rate = 2/2 = 100%, FA rate = 1/2 = 50%, corrected = 50%
    expect(m.correctedHitRatepct).toBeCloseTo(50, 1)
  })

  it('corrected hit rate is clamped at 0 (not negative)', () => {
    // More FAs than hits
    const events = [
      makeEvent(true,  false),      // miss
      makeEvent(false, true, 300),  // FA
      makeEvent(false, true, 310),  // FA
    ]
    const m = computeNBackMetrics(events)
    expect(m.correctedHitRatepct).toBeGreaterThanOrEqual(0)
  })

  it('d-prime is finite when hits and FA both exist', () => {
    const events = [
      makeEvent(true,  true,  400),
      makeEvent(true,  false),
      makeEvent(false, true,  350),
      makeEvent(false, false),
    ]
    const m = computeNBackMetrics(events)
    expect(isFinite(m.dPrime)).toBe(true)
  })

  it('d-prime is positive when hit rate > false alarm rate', () => {
    const events = [
      makeEvent(true,  true,  400),
      makeEvent(true,  true,  420),
      makeEvent(false, false),
      makeEvent(false, false),
    ]
    const m = computeNBackMetrics(events)
    expect(m.dPrime).toBeGreaterThan(0)
  })

  it('flags lowCorrectedHitRate when corrected hit rate < 60%', () => {
    // 1 hit out of 5 targets = 20% HR, 0 FA = 0% FAR => corrected = 20%
    const events = [
      makeEvent(true,  true,  400),
      makeEvent(true,  false),
      makeEvent(true,  false),
      makeEvent(true,  false),
      makeEvent(true,  false),
      makeEvent(false, false),
    ]
    const m = computeNBackMetrics(events)
    expect(m.flags).toContain('lowCorrectedHitRate')
  })

  it('flags severeWorkingMemoryDifficulty when corrected hit rate < 40%', () => {
    const events = [
      makeEvent(true,  false),
      makeEvent(true,  false),
      makeEvent(true,  false),
      makeEvent(false, false),
    ]
    const m = computeNBackMetrics(events)
    expect(m.flags).toContain('severeWorkingMemoryDifficulty')
  })

  it('handles empty events', () => {
    const m = computeNBackMetrics([])
    expect(m.hits).toBe(0)
    expect(m.correctedHitRatepct).toBe(0)
    expect(m.dPrime).toBeNull()
  })
})
