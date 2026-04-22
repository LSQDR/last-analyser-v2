
import { getArrayMean, standardDeviation, standardError, getPercentage } from '../stats.js'

export function computeSessionMetrics(blockMetrics, allEvents) {
  const scoredEvents = allEvents.filter(e => !e.isPractice)

  const allHits     = scoredEvents.filter(e => e.classification === 'hit')
  const allCleanRTs = allHits.map(e => e.rtms)

  const sessionMeanRT = getArrayMean(allCleanRTs)
  const sessionSD     = standardDeviation(allCleanRTs)
  const sessionCV     = sessionSD && sessionMeanRT ? (sessionSD / sessionMeanRT) * 100 : null

  // ISI split at 1750ms
  const shortISIHits = allHits.filter(e => e.isims <  1750)
  const longISIHits  = allHits.filter(e => e.isims >= 1750)

  // Decay slope: Block 3 omission rate, Block 1 omission rate
  const decaySlope = blockMetrics[2].omissionRatepct - blockMetrics[0].omissionRatepct

  // Hit RT standard error block-to-block consistency
  const blockMeans = blockMetrics.map(b => b.cleanMeanRTms).filter(v => v != null)
  const hitRTSE    = standardError(blockMeans)

  // Overall omission and commission counts
  const totalTargets    = scoredEvents.filter(e => e.type === 'target').length
  const totalNonTargets = scoredEvents.filter(e => e.type === 'non-target').length
  const totalOmissions  = scoredEvents.filter(e => e.classification === 'omission').length
  const totalCommissions= scoredEvents.filter(e => e.classification === 'commission').length

  const flags = evaluateFlags(
    getPercentage(totalOmissions, totalTargets),
    decaySlope,
    sessionCV
  )

  return {
    omissionRatepct:      getPercentage(totalOmissions, totalTargets),
    commissionRatepct:    getPercentage(totalCommissions, totalNonTargets),
    cleanMeanRTms:        sessionMeanRT,
    rtSDms:               sessionSD,
    cvpct:                sessionCV,
    hitRTStandardErrorms: hitRTSE,
    shortISImeanRTms:     getArrayMean(shortISIHits.map(e => e.rtms)),
    longISImeanRTms:      getArrayMean(longISIHits.map(e => e.rtms)),
    attentionDecaySlope:  decaySlope,
    lapseCount:           scoredEvents.filter(e => e.classification === 'lapse').length,
    perseverationCount:   scoredEvents.filter(e => e.classification === 'perseveration').length,
    flags,
  }
}

function evaluateFlags(omissionRate, decaySlope, cv) {
  const flags = []
  if (omissionRate > 25) flags.push('highOmission')
  if (decaySlope    > 0) flags.push('attentionDecay')
  if (cv            > 35) flags.push('highVariability')
  return flags
}
