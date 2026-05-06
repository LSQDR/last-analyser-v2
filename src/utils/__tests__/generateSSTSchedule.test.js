import { describe, it, expect } from 'vitest'
import { generateSSTSchedule, generatePracticeSchedule, DEFAULT_SST_CONFIG } from '../generate/generateSSTSchedule.js'

describe('generateSSTSchedule', () => {
  it('returns correct total trial count', () => {
    const s = generateSSTSchedule()
    expect(s).toHaveLength(DEFAULT_SST_CONFIG.totalTrials)
  })

  it('stop ratio is within ±4% of target', () => {
    const s = generateSSTSchedule()
    const stops = s.filter(t => t.type === 'stop').length
    const ratio = stops / s.length
    expect(ratio).toBeGreaterThanOrEqual(0.21)
    expect(ratio).toBeLessThanOrEqual(0.29)
  })

  it('no 3 consecutive stop trials', () => {
    const s = generateSSTSchedule()
    let run = 0
    s.forEach(t => {
      run = t.type === 'stop' ? run + 1 : 0
      expect(run).toBeLessThanOrEqual(2)
    })
  })

  it('no stop trial in first or last 4 positions', () => {
    const s = generateSSTSchedule()
    s.slice(0, 4).forEach(t  => expect(t.type).toBe('go'))
    s.slice(-4).forEach(t    => expect(t.type).toBe('go'))
  })

  it('respects custom totalTrials', () => {
    const s = generateSSTSchedule({ totalTrials: 64 })
    expect(s).toHaveLength(64)
  })
})

describe('generatePracticeSchedule', () => {
  it('returns only go trials', () => {
    const s = generatePracticeSchedule()
    s.forEach(t => expect(t.type).toBe('go'))
  })

  it('marks trials as isPractice', () => {
    const s = generatePracticeSchedule()
    s.forEach(t => expect(t.isPractice).toBe(true))
  })
})