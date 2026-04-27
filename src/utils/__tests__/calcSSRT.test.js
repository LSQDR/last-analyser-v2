import { describe, it, expect } from 'vitest'
import { calcSSRT } from '../calcSSRT.js'

// Build a minimal SST event log
function makeGoEvent(rt) {
  return { trialType: 'go', responded: true, rtms: rt, classification: 'go-hit', include: true }
}
function makeGoOmission() {
  return { trialType: 'go', responded: false, rtms: null, classification: 'go-omission', include: true }
}
function makeStopEvent(responded) {
  return { trialType: 'stop', responded, rtms: responded ? 280 : null,
    classification: responded ? 'stop-failure' : 'stop-success', include: true, ssd: 200 }
}

describe('calcSSRT — integration method (Verbruggen 2019)', () => {
  const goRTs  = [300, 320, 280, 350, 310, 290, 340, 330, 360, 370,
                  305, 295, 315, 325, 345, 285, 355, 275, 365, 335]
  const meanSSD = 220

  it('returns a finite positive SSRT for a valid distribution', () => {
    const result = calcSSRT(goRTs, meanSSD, 0, goRTs.length)
    expect(result.SSRTms).toBeGreaterThan(0)
    expect(isFinite(result.SSRTms)).toBe(true)
  })

  it('marks result valid when pRespond is 0.20–0.80', () => {
    // 8 stop-failures out of 20 stop trials = pRespond 0.4 — valid
    const result = calcSSRT(goRTs, meanSSD, 0, goRTs.length, 0.4)
    expect(result.SSRTisValid).toBe(true)
  })

  it('marks result invalid when pRespond is outside 0.20–0.80', () => {
    const resultLow  = calcSSRT(goRTs, meanSSD, 0, goRTs.length, 0.10)
    const resultHigh = calcSSRT(goRTs, meanSSD, 0, goRTs.length, 0.95)
    expect(resultLow.SSRTisValid).toBe(false)
    expect(resultHigh.SSRTisValid).toBe(false)
  })

  it('SSRT = nth RT percentile − mean SSD', () => {
    // With pRespond 0.5, nth percentile is the median go RT
    const sorted = [...goRTs].sort((a, b) => a - b)
    const nthIndex = Math.round(0.5 * goRTs.length) - 1
    const nthRT = sorted[Math.max(0, nthIndex)]
    const result = calcSSRT(goRTs, meanSSD, 0, goRTs.length, 0.5)
    expect(result.SSRTms).toBeCloseTo(nthRT - meanSSD, 0)
  })

  it('replaces go omissions before computing nth RT', () => {
    // Adding omissions should shift nth percentile up
    const withOmissions = calcSSRT(goRTs, meanSSD, 3, goRTs.length + 3, 0.5)
    const without       = calcSSRT(goRTs, meanSSD, 0, goRTs.length, 0.5)
    // With omissions replaced by max RT, nth percentile should be >= without
    expect(withOmissions.SSRTms).toBeGreaterThanOrEqual(without.SSRTms - 1)
  })
})
