import { describe, it, expect } from 'vitest'
import { TASK_REGISTRY, TASK_ORDER } from '../../config/taskRegistry.js'

const REQUIRED_KEYS = ['id','storageKey','name','shortName','domain','icon',
                       'config','getBand','getMetrics','getInsight',
                       'flagFeedback','columns','ChartComponent']

describe('TASK_REGISTRY structure', () => {
  it('contains exactly 4 tasks', () => {
    expect(TASK_REGISTRY).toHaveLength(4)
  })

  it('TASK_ORDER matches registry IDs in order', () => {
    expect(TASK_ORDER).toEqual(TASK_REGISTRY.map(t => t.id))
  })

  TASK_REGISTRY.forEach(task => {
    describe(`task: ${task.id}`, () => {
      it('has all required fields', () => {
        REQUIRED_KEYS.forEach(k => expect(task).toHaveProperty(k))
      })

      it('config fields are correct types', () => {
        Object.values(task.config).forEach(v => {
          expect(typeof v === 'number' || Array.isArray(v)).toBe(true)
        })
      })

      it('getMetrics returns correct shape', () => {
        const dummy = { omissionRatepct: 10, cvpct: 20, cleanMeanRTms: 310,
                        attentionDecaySlope: 0, SSRTms: 250, SSRTisValid: true,
                        stopAccuracypct: 60, goRTms: 300, trueInterferencems: 90,
                        incongruentAccuracypct: 80, facilitationms: 30,
                        correctedHitRatepct: 65, dPrime: 1.2, falseAlarmRatepct: 10 }
        const metrics = task.getMetrics(dummy)
        expect(Array.isArray(metrics)).toBe(true)
        metrics.forEach(m => {
          expect(m).toHaveProperty('label')
          expect(m).toHaveProperty('value')
          expect(m).toHaveProperty('flagged')
        })
      })

      it('flagFeedback entries have title and text', () => {
        Object.values(task.flagFeedback).forEach(fb => {
          expect(fb).toHaveProperty('title')
          expect(fb).toHaveProperty('text')
          expect(fb.title.length).toBeGreaterThan(0)
          expect(fb.text.length).toBeGreaterThan(0)
        })
      })

      it('columns entries have key and label', () => {
        task.columns.forEach(col => {
          expect(col).toHaveProperty('key')
          expect(col).toHaveProperty('label')
        })
      })
    })
  })
})