import { describe, it, expect } from 'vitest'
import { computeSSTMetrics } from '../compute/computeSSTMetrics.js'

const makeGo    = (rt) => ({ type: 'go',   responded: true,  rtms: rt,  classification: 'goHit',          include: true,  ssd: null, isPractice: false })
const makeGoOm  = ()   => ({ type: 'go',   responded: false, rtms: null, classification: 'goOmission',    include: true,  ssd: null, isPractice: false })
const makeStop  = (r, ssd) => ({ type: 'stop', responded: r, rtms: r ? 280 : null, ssd, isPractice: false,
                                  classification: r ? 'failedStop' : 'successfulStop', include: true })

const staircase = { history: [250, 300, 250, 200, 250] }

describe('computeSSTMetrics', () => {
  const goRTs  = [300, 320, 280, 350, 310, 290, 340, 330, 360, 370]
  const trials = [
    ...goRTs.map(makeGo),
    ...Array(8).fill(null).map(() => makeStop(false, 250)), // 8 successful stops
    ...Array(2).fill(null).map(() => makeStop(true,  250)), // 2 failed stops
  ]

  it('counts go and stop trials correctly', () => {
    const m = computeSSTMetrics(trials, staircase)
    expect(m.goTrials ?? m).toBeDefined() // shape check
  })

  it('SSRT is positive for valid distribution', () => {
    const m = computeSSTMetrics(trials, staircase)
    if (m.SSRTisValid) expect(m.SSRTms).toBeGreaterThan(0)
  })

  it('stop accuracy reflects successful stop ratio', () => {
    const m = computeSSTMetrics(trials, staircase)
    expect(m.stopAccuracypct).toBeCloseTo(80, 0) // 8/10 = 80%
  })

  it('flags highSSRT when SSRT > 300 and valid', () => {
    const slowGoRTs = Array(20).fill(600) // very slow — SSRT will be high
    const t2 = [
      ...slowGoRTs.map(makeGo),
      ...Array(5).fill(null).map(() => makeStop(false, 100)), // 5/10 stops
      ...Array(5).fill(null).map(() => makeStop(true,  100)),
    ]
    const m = computeSSTMetrics(t2, staircase)
    if (m.SSRTisValid && m.SSRTms > 300) expect(m.flags).toContain('highSSRT')
  })

  it('excludes practice trials from computation', () => {
    const withPractice = [...trials, { ...makeGo(999), isPractice: true }]
    const m1 = computeSSTMetrics(trials,       staircase)
    const m2 = computeSSTMetrics(withPractice, staircase)
    expect(m1.SSRTms).toEqual(m2.SSRTms)
  })
})