import { describe, it, expect } from 'vitest'
import { computeSessionMetrics } from '../compute/computeCPTSessionMetrics.js'

const blocks = [
  { omissionRatepct: 0, cleanMeanRTms: 300 },
  { omissionRatepct: 0, cleanMeanRTms: 300 },
  { omissionRatepct: 0, cleanMeanRTms: 300 },
]

describe('computeSessionMetrics', () => {
  it('splits hit reaction time into short and long ISI means at 1750ms', () => {
    const events = [
      { type: 'target', classification: 'hit', rtms: 300, isiMs: 1000, isPractice: false },
      { type: 'target', classification: 'hit', rtms: 100, isiMs: 1749, isPractice: false },
      { type: 'target', classification: 'hit', rtms: 500, isiMs: 1750, isPractice: false },
      { type: 'target', classification: 'hit', rtms: 900, isiMs: 1000, isPractice: true },
      { type: 'target', classification: 'hit', rtms: 50, isims: 1000, isPractice: false },
    ]

    const metrics = computeSessionMetrics(blocks, events)

    expect(metrics.shortISImeanRTms).toBe(200)
    expect(metrics.longISImeanRTms).toBe(500)
  })
})
