import { describe, it, expect } from 'vitest'
import { getCPTBand, getSSTBand, getStroopBand, getNBackBand } from '../getBandLabels.js'

describe('getCPTBand', () => {
  it('returns Strong when no flags', () => {
    expect(getCPTBand(10, 20, -1).label).toBe('Strong')
  })
  it('returns Low when 3 flags', () => {
    expect(getCPTBand(30, 40, 5).label).toBe('Low')
  })
})

describe('getSSTBand', () => {
  it('returns Inconclusive for invalid SSRT', () => {
    expect(getSSTBand(200, false, 70).label).toBe('Inconclusive')
  })
  it('returns Typical for SSRT 250-300', () => {
    expect(getSSTBand(280, true, 55).label).toBe('Typical')
  })
})

describe('getStroopBand', () => {
  it('returns Typical for interference 60-130ms', () => {
    expect(getStroopBand(90).label).toBe('Typical')
  })
  it('returns High for interference > 200ms', () => {
    expect(getStroopBand(250).label).toBe('High')
  })
})

describe('getNBackBand', () => {
  it('returns Strong for > 80%', () => {
    expect(getNBackBand(85).label).toBe('Strong')
  })
  it('returns Very Low for < 40%', () => {
    expect(getNBackBand(30).label).toBe('Very Low')
  })
})