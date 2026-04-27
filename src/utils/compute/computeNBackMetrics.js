import { getArrayMean, getPercentage, zScore } from '../stats.js'

function calcDPrime(hitRate, falseAlarmRate, nTargets, nNonTargets) {
  // Log-linear correction applied inside zScore()
  if (!nTargets || !nNonTargets) return null
  const z_h  = zScore(hitRate / 100,        nTargets)
  const z_fa = zScore(falseAlarmRate / 100,  nNonTargets)
  return parseFloat((z_h - z_fa).toFixed(3))
}

function evaluateFlags(correctedHitRate) {
  const flags = []
  if (correctedHitRate < 60) flags.push('lowCorrectedHitRate')      
  if (correctedHitRate < 40) flags.push('severeWorkingMemoryDifficulty')
  return flags
}

export function computeNBackMetrics(events) {
  const scored = events

  const targets    = scored.filter(e =>  e.isTarget)
  const nonTargets = scored.filter(e => !e.isTarget)

  const hits             = scored.filter(e => e.classification === 'hit')
  const misses           = scored.filter(e => e.classification === 'miss')
  const falseAlarms      = scored.filter(e => e.classification === 'falseAlarm')
  const correctReject    = scored.filter(e => e.classification === 'correctRejection')
  const omissions        = scored.filter(e => e.classification?.startsWith('omission'))

  const hitRate         = getPercentage(hits.length,        targets.length) ?? 0
  const falseAlarmRate  = getPercentage(falseAlarms.length,  nonTargets.length) ?? 0
  const correctedHitRate = Math.max(0, hitRate - falseAlarmRate)

  const hitRTs         = hits.filter(e => e.rtms).map(e => e.rtms)
  const meanResponseRT = hitRTs.length > 0 ? getArrayMean(hitRTs) : null

  const dPrime = calcDPrime(hitRate, falseAlarmRate, targets.length, nonTargets.length)

  return {
    totalScoredTrials:    scored.length,
    targets:              targets.length,
    nonTargets:           nonTargets.length,
    hits:                 hits.length,
    misses:               misses.length,
    falseAlarms:          falseAlarms.length,
    correctRejections:    correctReject.length,
    omissions:            omissions.length,
    hitRatepct:           hitRate,
    falseAlarmRatepct:    falseAlarmRate,
    correctedHitRatepct:  correctedHitRate,
    meanResponseRTms:     meanResponseRT,
    dPrime,
    flags:                evaluateFlags(correctedHitRate),
  }
}
