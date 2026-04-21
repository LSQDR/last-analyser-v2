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

  return {
    totalTargets:       targets.length,
    hits:               hits.length,
    omissions:          omissions.length,
    commissions:        commissions.length,
    lapseCount:         lapses.length,
    perseverationCount: persevs.length,
    omissionRatepct:    getPercentage(omissions.length, targets.length),
    commissionRatepct:  getPercentage(commissions.length, events.filter(e => e.type === 'non-target').length),
    cleanMeanRTms:      meanRT,
    rtSDms:             sdRT,
    cvpct:              sdRT && meanRT ? (sdRT / meanRT) * 100 : null,
    // Expose for lapse detection in next block
    _meanRT: meanRT,
    _sdRT:   sdRT,
  }
}
