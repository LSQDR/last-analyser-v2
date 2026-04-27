// Verbruggen et al. (2019) integration method with go omission replacement.
// Accepts pre-computed values from computeSSTMetrics
// https://pure.knaw.nl/ws/files/10334634/verbruggen2019.pdf

export function calcSSRT(goRTs, meanSSD, goOmissions, totalGoTrials, pRespond = 0.5) {

  // Step 1: Go omission replacement — pad with max RT
  const maxGoRT       = goRTs.length > 0 ? Math.max(...goRTs) : 0
  const replacedGoRTs = [
    ...goRTs,
    ...Array(goOmissions).fill(maxGoRT),
  ].sort((a, b) => a - b)

  // Step 2: Validity gate — pRespond must be within 0.20–0.80
  const SSRTisValid = pRespond >= 0.20 && pRespond <= 0.80

  if (!SSRTisValid) {
    return {
      SSRTms:      null,
      SSRTisValid: false,
      pRespond,
      meanSSDms:   Math.round(meanSSD),
    }
  }

  // Step 3: nth percentile of augmented Go RT distribution
  const nthIndex = Math.round(replacedGoRTs.length * pRespond) - 1
  const nthGoRT  = replacedGoRTs[Math.max(0, nthIndex)]

  // Step 4: SSRT = nth Go RT − mean SSD
  const SSRTms = Math.round(nthGoRT - meanSSD)

  return {
    SSRTms,
    SSRTisValid: SSRTms > 0,
    pRespond,
    meanSSDms:          Math.round(meanSSD),
    nthGoRTms:          Math.round(nthGoRT),
    goOmissionCount:    goOmissions,
    replacementApplied: goOmissions > 0,
  }
}
