import { describe, it, expect } from 'vitest'
import { generateCPTSchedule, DEFAULT_CPT_CONFIG } from '../generate/generateCPTSchedule.js'

describe('generateCPTSchedule', () => {
  it('returns practice and blocks', () => {
    const s = generateCPTSchedule()
    expect(s).toHaveProperty('practice')
    expect(s).toHaveProperty('blocks')
  })

  it('blockCount matches config', () => {
    const s = generateCPTSchedule()
    expect(s.blocks).toHaveLength(DEFAULT_CPT_CONFIG.blockCount)
  })

  it('respects custom blockCount', () => {
    const s = generateCPTSchedule({ blockCount: 2 })
    expect(s.blocks).toHaveLength(2)
  })

  it('target ratio is within ±3% of targetRatio', () => {
    const s = generateCPTSchedule()
    s.blocks.forEach(block => {
      const ratio = block.filter(e => e.type === 'target').length / block.length
      expect(ratio).toBeGreaterThanOrEqual(0.22)
      expect(ratio).toBeLessThanOrEqual(0.28)
    })
  })

  it('never exceeds maxConsecutiveTargets in a row', () => {
    const s = generateCPTSchedule()
    s.blocks.forEach(block => {
      let run = 0
      block.forEach(e => {
        run = e.type === 'target' ? run + 1 : 0
        expect(run).toBeLessThanOrEqual(DEFAULT_CPT_CONFIG.maxConsecutiveTargets)
      })
    })
  })

  it('practice events are all marked isPractice', () => {
    const s = generateCPTSchedule()
    s.practice.forEach(e => expect(e.isPractice).toBe(true))
  })

  it('scheduled times are monotonically increasing', () => {
    const s = generateCPTSchedule()
    s.blocks[0].forEach((e, i) => {
      if (i === 0) return
      expect(e.scheduledAtMs).toBeGreaterThan(s.blocks[0][i - 1].scheduledAtMs)
    })
  })
})