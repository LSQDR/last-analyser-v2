// Verbruggen et al. (2019) integration method with go omission replacement.
// https://pure.knaw.nl/ws/files/10334634/verbruggen2019.pdf

export function calcSSRT(goTrials, stopTrials, staircase) {
  // Step 1: Collect Go RTs from hits only 
  const observedGoRTs = goTrials
    .filter(t => t.classification === 'goHit')
    .map(t => t.rt)

  // Step 2: Count Go omissions
  const goOmissions = goTrials.filter(t => t.classification === 'goOmission')

  // Step 3: Go omission replacement
  // Replace each omission with the maximum observed Go RT 
  // prevents omissions from artificially truncating the RT distribution
  const maxGoRT       = Math.max(...observedGoRTs)
  const replacedGoRTs = [
    ...observedGoRTs,
    ...goOmissions.map(() => maxGoRT),
  ].sort((a, b) => a - b)

  // Step 4: pRespond — proportion of stop trials where the user responded
  const failedStops = stopTrials.filter(t => t.classification === 'failedStop').length
  const pRespond    = failedStops / stopTrials.length

  // Step 5: nth percentile of Go RT distribution
  const nthIndex = Math.round(replacedGoRTs.length * pRespond)
  const nthGoRT  = replacedGoRTs[Math.min(nthIndex, replacedGoRTs.length - 1)]

  // Step 6: Mean SSD from staircase history
  const meanSSD = staircase.getMeanSSD()

  // Step 7: SSRT = nth Go RT − mean SSD
  const SSRT = nthGoRT - meanSSD

  // Step 8: Validity check
  // SSRT must be positive AND pRespond must be within 0.20–0.80
  // Outside this range means the staircase failed to converge
  const isValid = SSRT > 0 && pRespond >= 0.20 && pRespond <= 0.80

  return {
    SSRTms:               Math.round(SSRT),
    isValid,
    pRespondGivenSignal:  pRespond,
    meanSSDms:            Math.round(meanSSD),
    nthGoRTms:            Math.round(nthGoRT),
    goOmissionCount:      goOmissions.length,
    replacementApplied:   goOmissions.length > 0,
  }
}
