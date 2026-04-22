import { calcSSRT } from "../calcSSRT"

function mean(arr) {
  if (!arr || arr.length === 0) return null
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function pct(n, d) {
  if (!d || d === 0) return null
  return (n / d) * 100
}

function evaluateFlags(ssrtResult, succStops, totalStops) {
  const flags         = []
  const stopAccuracy  = pct(succStops, totalStops)
  if (ssrtResult.isValid && ssrtResult.SSRTms > 300) flags.push('highSSRT')
  if (stopAccuracy < 50)                              flags.push('lowStopAccuracy')
  if (!ssrtResult.isValid)                            flags.push('convergenceFailure')
  return flags
}

export function computeSSTMetrics(trials, staircase) {
  const goTrials    = trials.filter(t => t.type === 'go'   && !t.isPractice)
  const stopTrials  = trials.filter(t => t.type === 'stop' && !t.isPractice)

  const goHits       = goTrials.filter(t => t.classification === 'goHit')
  const failedStops  = stopTrials.filter(t => t.classification === 'failedStop')
  const succStops    = stopTrials.filter(t => t.classification === 'successfulStop')

  const ssrtResult   = calcSSRT(goTrials, stopTrials, staircase)

  // Race model check: failed stop RT should be shorter than Go RT
  const goRTmean         = mean(goHits.map(t => t.rt))
  const failedStopRTmean = mean(failedStops.map(t => t.rt))
  const raceModelHolds   = failedStopRTmean !== null && goRTmean !== null
    ? failedStopRTmean < goRTmean
    : null

  const flags = evaluateFlags(ssrtResult, succStops.length, stopTrials.length)

  return {
    SSRTms:               ssrtResult.SSRTms,
    SSRTisValid:          ssrtResult.isValid,
    pRespondGivenSignal:  ssrtResult.pRespondGivenSignal,
    meanSSDms:            ssrtResult.meanSSDms,
    stopAccuracypct:      pct(succStops.length, stopTrials.length),
    goRTms:               goRTmean,
    failedStopRTms:       failedStopRTmean,
    raceModelHolds,
    goOmissions:          goTrials.filter(t => t.classification === 'goOmission').length,
    perseverations:       trials.filter(t => t.classification === 'perseveration').length,
    ssdHistory:           staircase.history,
    flags,
  }
}
