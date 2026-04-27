import { calcSSRT } from '../calcSSRT.js'

function mean(arr) {
  if (!arr || arr.length === 0) return null
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function pct(n, d) {
  if (!d || d === 0) return null
  return (n / d) * 100
}

function evaluateFlags(ssrtResult, succStops, totalStops) {
  const flags        = []
  const stopAccuracy = pct(succStops, totalStops)
  if (ssrtResult.SSRTisValid && ssrtResult.SSRTms > 300) flags.push('highSSRT')
  if (stopAccuracy !== null && stopAccuracy < 50)        flags.push('lowStopAccuracy')
  if (!ssrtResult.SSRTisValid)                           flags.push('convergenceFailure')
  return flags
}

export function computeSSTMetrics(trials, staircase) {
  const goTrials   = trials.filter(t => t.type === 'go'   && !t.isPractice)
  const stopTrials = trials.filter(t => t.type === 'stop' && !t.isPractice)

  const goHits      = goTrials.filter(t => t.classification === 'go-hit')
  const goOmissions = goTrials.filter(t => t.classification === 'go-omission').length
  const failedStops = stopTrials.filter(t => t.classification === 'stop-failure')
  const succStops   = stopTrials.filter(t => t.classification === 'stop-success')

  // Pre-compute values for calcSSRT
  const goRTs    = goHits.map(t => t.rt)
  const pRespond = stopTrials.length > 0 ? failedStops.length / stopTrials.length : 0
  const meanSSD  = stopTrials.length > 0
    ? mean(stopTrials.map(t => t.ssd))
    : 0

 
  const ssrtResult = calcSSRT(
    goRTs,
    meanSSD,
    goOmissions,
    goHits.length + goOmissions,
    pRespond
  )

  const goRTmean         = mean(goRTs)
  const failedStopRTmean = mean(failedStops.map(t => t.rt))
  const raceModelHolds   = failedStopRTmean !== null && goRTmean !== null
    ? failedStopRTmean < goRTmean
    : null

  const flags = evaluateFlags(ssrtResult, succStops.length, stopTrials.length)

  return {
    SSRTms:              ssrtResult.SSRTms,
    SSRTisValid:         ssrtResult.SSRTisValid,  
    pRespond:            ssrtResult.pRespond,       
    meanSSDms:           ssrtResult.meanSSDms,
    stopAccuracypct:     pct(succStops.length, stopTrials.length),
    goRTms:              goRTmean,
    goRTsdMs:            mean(goRTs) !== null ? Math.sqrt(
      goRTs.reduce((s, v) => s + (v - goRTmean) ** 2, 0) / (goRTs.length - 1 || 1)
    ) : null,
    failedStopRTms:      failedStopRTmean,
    raceModelHolds,
    goOmissions,
    perseverations:      trials.filter(t => t.classification === 'perseveration').length,
    ssdHistory:          staircase.history ?? [],
    flags,
  }
}