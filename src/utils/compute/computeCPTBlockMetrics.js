import { getArrayMean, standardDeviation, getPercentage } from '../stats'

export function computeBlockMetrics(events) {
  const targets       = events.filter(e => e.type === 'target')
  const hits          = events.filter(e => e.classification === 'hit')
  const omissions     = events.filter(e => e.classification === 'omission')
  const commissions   = events.filter(e => e.classification === 'commission')
  const lapses        = events.filter(e => e.classification === 'lapse')
  const persevs       = events.filter(e => e.classification === 'perseveration')

  const cleanRTs  = hits.map(e => e.rtms)
  const meanRT    = getArrayMean(cleanRTs)
  const sdRT      = standardDeviation(cleanRTs)

  const omissionRatepct   = getPercentage(omissions.length, targets.length)
  const commissionRatepct = getPercentage(commissions.length, events.filter(e => e.type === 'non-target').length)
  const cvpct             = sdRT && meanRT ? (sdRT / meanRT) * 100 : null

  const flags = []
  if (omissionRatepct > 25) flags.push('highOmission')
  if (cvpct > 35)           flags.push('highVariability')


  return {
    totalTargets: targets.length,
    hits: hits.length,
    omissions: omissions.length,
    commissions: commissions.length,
    lapseCount: lapses.length,
    perseverationCount: persevs.length,
    omissionRatepct,
    commissionRatepct,
    cleanMeanRTms: meanRT,
    rtSDms: sdRT,
    cvpct,
    flags,              
    _meanRT: meanRT,
    _sdRT: sdRT,
  }
}
