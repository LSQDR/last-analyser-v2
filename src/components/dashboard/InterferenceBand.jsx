import { getInterferenceBand } from '../../utils/getBandLabels.js'
import './InterferenceBand.css'

const BANDS = ['minimal', 'typical', 'elevated', 'high']
const BAND_LABELS = {
  minimal:  'Minimal',
  typical:  'Typical',
  elevated: 'Somewhat Elevated',
  high:     'High',
}

export function InterferenceBand({ trueInterference }) {
  const band = getInterferenceBand(trueInterference)

  return (
    <div className="interference-band" role="img" aria-label={`Interference band: ${band.label}`}>
      <div className="band-track">
        {BANDS.map((b) => (
          <div
            key={b}
            className={`band-segment band-segment--${b}${b === band.band ? ' band-segment--active' : ''}`}
            aria-hidden="true"
          >
            <span className="band-segment-label">{BAND_LABELS[b]}</span>
          </div>
        ))}
      </div>
      <p className="band-description">{band.description}</p>
    </div>
  )
}