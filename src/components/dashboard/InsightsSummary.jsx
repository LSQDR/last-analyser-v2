// One insight sentence per domain at the bottom of the dashboard.
// Not diagnostic — framed as reflection on task performance only.
// Research basis: PMC 2023 neuropsychological feedback survey — "implications for
// daily functioning" rated most important feedback component by clinicians and patients.

import {
  getSustainedAttentionInsight,
  getInhibitionInsight,
  getInterferenceInsight,
  getWorkingMemoryInsight,
} from '../../utils/getDomainInsights.js'
import { normaliseDomainScores } from '../../utils/normaliseDomainScores.js'
import { getCPTBand, getSSTBand, getStroopBand, getNBackBand } from '../../utils/getBandLabels.js'

const DOMAIN_META = [
  { key: 'task1', label: 'Sustained Attention',  icon: '🔵' },
  { key: 'task2', label: 'Inhibition Control',   icon: '🟢' },
  { key: 'task3', label: 'Interference Control', icon: '🟡' },
  { key: 'task4', label: 'Working Memory',        icon: '🔴' },
]

function getInsight(key, score, overall) {
  if (score == null) return null
  switch (key) {
    case 'task1': return getSustainedAttentionInsight(score, overall)
    case 'task2': return getInhibitionInsight(score, overall)
    case 'task3': return getInterferenceInsight(score, overall)
    case 'task4': return getWorkingMemoryInsight(score, overall)
    default:      return null
  }
}

function getBand(key, data) {
  if (!data) return null
  const o = data.overall
  switch (key) {
    case 'task1': return getCPTBand(o.omissionRatepct, o.cvpct, o.attentionDecaySlope)
    case 'task2': return getSSTBand(o.SSRTms, o.SSRTisValid, o.stopAccuracypct)
    case 'task3': return getStroopBand(o.trueInterferencems)
    case 'task4': return getNBackBand(o.correctedHitRatepct)
    default:      return null
  }
}

const BAND_COLOURS = {
  green:  '#2ecc71',
  blue:   '#3a7bd5',
  yellow: '#f1c40f',
  red:    '#e03c31',
}

export function InsightsSummary({ data }) {
  const scores      = normaliseDomainScores(data)
  const scoresByKey = Object.fromEntries(scores.map((s, i) => [`task${i + 1}`, s.score]))

  const rows = DOMAIN_META.map(({ key, label, icon }) => {
    const taskData = data?.[key]
    const score    = scoresByKey[key]
    const band     = getBand(key, taskData)
    const insight  = getInsight(key, score, taskData?.overall)
    return { key, label, icon, band, insight, attempted: !!taskData }
  })

  const attempted = rows.filter(r => r.attempted)
  if (attempted.length === 0) return null

  return (
    <section className="insights-summary" aria-labelledby="insights-heading">
      <h2 id="insights-heading">Your Session at a Glance</h2>
      <p className="insights-subtitle">
        One observation per domain — for reflection only, not a clinical interpretation.
      </p>

      <div className="insights-grid">
        {rows.map(({ key, label, icon, band, insight, attempted }) => (
          <div key={key} className={`insight-card ${!attempted ? 'insight-card--pending' : ''}`}>
            <div className="insight-card-header">
              <span className="insight-domain-label">{label}</span>
              {band && (
                <span className="insight-band-chip"
                  style={{ color: BAND_COLOURS[band.colour], borderColor: BAND_COLOURS[band.colour] }}>
                  {band.label}
                </span>
              )}
            </div>
            <p className="insight-text">
              {attempted
                ? insight
                : 'Complete this task to see your insight.'}
            </p>
          </div>
        ))}
      </div>

      <p className="insights-disclaimer">
        These observations reflect your performance on this session only. Cognitive performance
        varies with sleep, mood, and environment. None of this constitutes a clinical assessment.
      </p>
    </section>
  )
}
