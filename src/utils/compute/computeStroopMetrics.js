import { getArrayMean, getPercentage } from '../stats.js'

export function getInterferenceBand(trueInterferenceMs) {
  if (trueInterferenceMs < 50)  return { band: 'minimal',  label: 'Minimal Interference',  description: 'Very strong interference control — the word meaning had little effect.', flag: false }
  if (trueInterferenceMs < 100) return { band: 'typical',  label: 'Typical Range',          description: 'Interference control within the typical adult range.',                   flag: false }
  if (trueInterferenceMs < 150) return { band: 'elevated', label: 'Somewhat Elevated',      description: 'Slightly elevated interference — upper range of typical adult performance.', flag: false }
  return                               { band: 'high',     label: 'High Interference',      description: 'Elevated cognitive interference — the conflicting word meaningfully slowed colour-naming.', flag: true }
}

function evaluateFlags(trueInterference, incongruentAccuracy) {
  const flags = []
  const band = getInterferenceBand(trueInterference)
  if (band.flag) flags.push('highInterference')
  if (incongruentAccuracy < 75) flags.push('lowIncongruentAccuracy')
  return flags
}

export function computeStroopMetrics(events) {
  const congruent   = events.filter(e => e.type === 'congruent')
  const incongruent = events.filter(e => e.type === 'incongruent')
  const neutral     = events.filter(e => e.type === 'neutral')

  const meanRT  = arr => getArrayMean(arr.filter(e => e.correct).map(e => e.rtms))
  const accuracy = arr => getPercentage(arr.filter(e => e.correct).length, arr.length)

  const congruentRT   = meanRT(congruent)
  const incongruentRT = meanRT(incongruent)
  const neutralRT     = meanRT(neutral)

  const classicInterference = incongruentRT - congruentRT   // incongruent − congruent
  const trueInterference    = incongruentRT - neutralRT     // incongruent − neutral (primary)
  const facilitation        = neutralRT     - congruentRT   // neutral − congruent

  const wordInterferenceErrors = incongruent.filter(e => e.errorType === 'wordInterference').length
  const wordInterferenceRate   = getPercentage(wordInterferenceErrors, incongruent.length)

  const congruentAccuracy   = accuracy(congruent)
  const incongruentAccuracy = accuracy(incongruent)
  const neutralAccuracy     = accuracy(neutral)

  const interferenceBand = getInterferenceBand(trueInterference).band
  const omissions        = events.filter(e => e.classification === 'omission').length
  const flags            = evaluateFlags(trueInterference, incongruentAccuracy)

  return {
    congruentRTms:          congruentRT,
    incongruentRTms:        incongruentRT,
    neutralRTms:            neutralRT,
    classicInterferencems:  classicInterference,
    trueInterferencems:     trueInterference,
    facilitationms:         facilitation,
    congruentAccuracypct:   congruentAccuracy,
    incongruentAccuracypct: incongruentAccuracy,
    neutralAccuracypct:     neutralAccuracy,
    wordInterferenceRatepct: wordInterferenceRate,
    interferenceBand,
    omissions,
    flags,
  }
}
