import { describe, it, expect } from 'vitest'
import { computeStroopMetrics } from '../compute/computeStroopMetrics.js'

function makeEvent(type, correct, rtms) {
  return { type, correct, rtms, responded: true, include: true }
}
function makeOmission(type) {
  return { type, correct: false, rtms: null, responded: false, include: true }
}

describe('computeStroopMetrics', () => {
  const baseline = [
    makeEvent('congruent',   true,  400),
    makeEvent('congruent',   true,  420),
    makeEvent('neutral',     true,  460),
    makeEvent('neutral',     true,  480),
    makeEvent('incongruent', true,  580),
    makeEvent('incongruent', true,  600),
  ]

  it('computes congruent mean RT correctly', () => {
    const m = computeStroopMetrics(baseline)
    expect(m.congruentRTms).toBeCloseTo(410, 0)
  })

  it('computes neutral mean RT correctly', () => {
    const m = computeStroopMetrics(baseline)
    expect(m.neutralRTms).toBeCloseTo(470, 0)
  })

  it('computes incongruent mean RT correctly', () => {
    const m = computeStroopMetrics(baseline)
    expect(m.incongruentRTms).toBeCloseTo(590, 0)
  })

  it('true interference = incongruent − neutral', () => {
    const m = computeStroopMetrics(baseline)
    expect(m.trueInterferencems).toBeCloseTo(590 - 470, 0)
  })

  it('classic interference = incongruent − congruent', () => {
    const m = computeStroopMetrics(baseline)
    expect(m.classicInterferencems).toBeCloseTo(590 - 410, 0)
  })

  it('facilitation = neutral − congruent', () => {
    const m = computeStroopMetrics(baseline)
    expect(m.facilitationms).toBeCloseTo(470 - 410, 0)
  })

  it('computes accuracy per condition', () => {
    const events = [
      makeEvent('congruent',   true,  400),
      makeEvent('congruent',   false, 350), // error
      makeEvent('incongruent', true,  580),
      makeEvent('incongruent', true,  600),
    ]
    const m = computeStroopMetrics(events)
    expect(m.congruentAccuracypct).toBeCloseTo(50, 1)
    expect(m.incongruentAccuracypct).toBeCloseTo(100, 1)
  })

  it('flags highInterference when true interference > 150ms', () => {
    const events = [
      makeEvent('neutral',     true, 400),
      makeEvent('incongruent', true, 600), // 200ms interference
    ]
    const m = computeStroopMetrics(events)
    expect(m.flags).toContain('highInterference')
  })

  it('flags lowIncongruentAccuracy when accuracy < 75%', () => {
    const events = [
      makeEvent('incongruent', true,  500),
      makeEvent('incongruent', false, 480),
      makeEvent('incongruent', false, 470),
      makeEvent('incongruent', false, 490),
    ]
    const m = computeStroopMetrics(events)
    expect(m.flags).toContain('lowIncongruentAccuracy')
  })

  it('handles empty events gracefully', () => {
    const m = computeStroopMetrics([])
    expect(m.trueInterferencems).toBeNull()
    expect(m.flags).toEqual([])
  })
})
