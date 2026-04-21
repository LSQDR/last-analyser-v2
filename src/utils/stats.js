
export function getArrayMean(arr) {
  if (!arr || arr.length === 0) return null
  return arr.reduce((sum, v) => sum + v, 0) / arr.length
}

// Calculates the sample standard deviation of an array of numbers, returning null if input is invalid
export function standardDeviation(arr) {
    if (!arr || arr.length < 2) return null
    const m = getArrayMean(arr)
    const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1)
    return Math.sqrt(variance)
}

export function standardError(arr) {
  if (!arr || arr.length < 2) return null
  return standardDeviation(arr) / Math.sqrt(arr.length)
}

export function getPercentage(numerator, denominator) {
  if (!denominator || denominator === 0) return null
  return (numerator / denominator) * 100
}

// Converts a probability of 0–1 to a z-score for d-prime calculation in Task 4.
// Applies log-linear correction to avoid ±Infinity at 0 or 1.
export function zScore(probability, n) {
  const corrected = (probability * n + 0.5) / (n + 1)
  return inverseNormalCDF(corrected)
}

// Rational approximation of the inverse normal CDF using Abramowitz & Stegun inverse normal CDF approximation
function inverseNormalCDF(p) {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity

  const a = [0, -3.969683028665376e1, 2.209460984245205e2,
    -2.759285104469687e2, 1.383577518672690e2,
    -3.066479806614716e1, 2.506628277459239]
  const b = [0, -5.447609879822406e1, 1.615858368580409e2,
    -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [-7.784894002430293e-3, -3.223964580411365e-1,
    -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783]
  const d = [7.784695709041462e-3, 3.224671290700398e-1,
    2.445134137142996, 3.754408661907416]

  const pLow = 0.02425
  const pHigh = 1 - pLow

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }

  if (p <= pHigh) {
    const q = p - 0.5
    const r = q * q
    return (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q /
      (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1)
  }

  const q = Math.sqrt(-2 * Math.log(1 - p))
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
}