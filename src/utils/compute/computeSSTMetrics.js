import { calcSSRT } from '../calcSSRT.js'
import { getArrayMean, getPercentage } from '../stats.js'


function evaluateFlags(ssrtResult, succStops, totalStops) {
  const flags = []
  const stopAccuracy = getPercentage(succStops, totalStops)
  if (ssrtResult.SSRTisValid && ssrtResult.SSRTms > 300) flags.push('highSSRT')
  if (stopAccuracy != null   && stopAccuracy < 50) flags.push('lowStopAccuracy')
  if (!ssrtResult.SSRTisValid) flags.push('convergenceFailure')
  return flags
}

export function computeSSTMetrics(trials, staircase) {
  const goTrials = trials.filter((t) => t.type === 'go'   && !t.isPractice)
  const stopTrials  = trials.filter((t) => t.type === 'stop' && !t.isPractice)
   const goHits = goTrials.filter(t => t.classification === 'goHit')
  const goOmissions = goTrials.filter(t => t.classification === 'goOmission').length
  const failedStops = stopTrials.filter(t => t.classification === 'failedStop')
  const succStops = stopTrials.filter(t => t.classification === 'successfulStop')
  const goRTs = goHits.map((t) => t.rt)
  const pRespond = stopTrials.length > 0 ? failedStops.length / stopTrials.length : 0
  const meanSSD = stopTrials.length > 0 ? getArrayMean(stopTrials.map(t => t.ssdms ?? t.ssd)) : 0

  const ssrtResult = calcSSRT(goRTs, meanSSD, goOmissions, goHits.length + goOmissions, pRespond)

  const goRTmean = getArrayMean(goRTs)
  const failedStopRTmean = getArrayMean(failedStops.map((t) => t.rt))
  const raceModelHolds = failedStopRTmean != null && goRTmean != null
    ? failedStopRTmean < goRTmean
    : null

  const goRTsdMs = goRTmean != null && goRTs.length > 1
    ? Math.sqrt(goRTs.reduce((s, v) => s + (v - goRTmean) ** 2, 0) / (goRTs.length - 1)) || null
    : null

  const flags = evaluateFlags(ssrtResult, succStops.length, stopTrials.length)

  return {
    goTrials: goTrials.length,
    stopTrials: stopTrials.length,
    SSRTms: ssrtResult.SSRTms,
    SSRTisValid: ssrtResult.SSRTisValid,
    pRespond: ssrtResult.pRespond,
    meanSSDms: ssrtResult.meanSSDms,
    stopAccuracypct: getPercentage(succStops.length, stopTrials.length),
    goRTms: goRTmean,
    goRTsdMs,
    failedStopRTms: failedStopRTmean,
    raceModelHolds,
    goOmissions,
    perseverations: trials.filter((t) => t.classification === 'perseveration').length,
    ssdHistory: staircase.history ?? [],
    finalSSDms: staircase.current ?? null,
    flags,
  }
}