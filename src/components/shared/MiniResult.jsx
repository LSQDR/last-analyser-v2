// Reusable mini results panel used at the end of each task.
// Band label is the primary output; raw metric is secondary.
// Research basis: Schoenberg & Rum 2017 — qualitative labels reduce misinterpretation.

import { AutoAdvance } from './AutoAdvance.jsx'
import './MiniResult.css'

const COLOUR_MAP = {
  green:  { bg: '#1a3d1a', text: '#2ecc71', border: '#2ecc71' },
  blue:   { bg: '#1a2a4a', text: '#3a7bd5', border: '#3a7bd5' },
  yellow: { bg: '#3d3200', text: '#f1c40f', border: '#f1c40f' },
  red:    { bg: '#3d1a1a', text: '#e03c31', border: '#e03c31' },
}

export function MiniResult({ band, metrics, disclaimer, onComplete }) {
  const colours = COLOUR_MAP[band.colour] || COLOUR_MAP.blue

  return (
    <div className="mini-result">
      {/* Primary: band label */}
      <div className="mini-result-band" style={{ background: colours.bg, borderColor: colours.border }}>
        <span className="mini-result-band-label" style={{ color: colours.text }}>{band.label}</span>
        <p className="mini-result-band-desc">{band.description}</p>
      </div>

      {/* Secondary: key metrics */}
      <div className="mini-result-metrics">
        {metrics.map((m, i) => (
          <div key={i} className="mini-result-metric-row">
            <span className="mini-result-metric-label">{m.label}</span>
            <span className="mini-result-metric-value" style={{ color: m.flagged ? '#f1c40f' : '#eee' }}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {disclaimer && (
        <p className="mini-result-disclaimer">{disclaimer}</p>
      )}

      <AutoAdvance onComplete={onComplete} label="See Full Results" seconds={8} />
    </div>
  )
}
