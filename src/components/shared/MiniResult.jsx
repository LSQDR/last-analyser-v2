
import { AutoAdvance } from './AutoAdvance.jsx';
import { BAND_COLOURS } from '../../utils/bandColours.js';
import './MiniResult.css';

export function MiniResult({ band, metrics, disclaimer, onComplete }) {
  const colours = BAND_COLOURS[band?.colour] ?? BAND_COLOURS.blue;

  return (
    <div className="mini-result">
      <div
        className="mini-result-band"
        style={{ background: colours.bg, borderColor: colours.border }}
      >
        <span className="mini-result-band-label" style={{ color: colours.hex }}>
          {band.label}
        </span>
        <p className="mini-result-band-desc">{band.description}</p>
      </div>

      <div className="mini-result-metrics">
        {metrics.map((m, i) => (
          <div key={i} className="mini-result-metric-row">
            <span className="mini-result-metric-label">{m.label}</span>
            <span
              className="mini-result-metric-value"
              style={{ color: m.flagged ? '#f1c40f' : '#eee' }}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {disclaimer && <p className="mini-result-disclaimer">{disclaimer}</p>}
      <AutoAdvance onComplete={onComplete} label="Continue" seconds={8} />
    </div>
  );
}