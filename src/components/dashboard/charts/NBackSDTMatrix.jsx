import { getPercentage } from '../../../utils/stats.js';
import { BAND_COLOURS }  from '../../../utils/bandColours.js';
import { SROnlyTable }   from '../../shared/SROnlyTable.jsx';

function formatPct(n, d) {
  return getPercentage(n, d)?.toFixed(1) ?? '—';
}

export function NBackSDTMatrix({ data }) {
  const { hits, misses, falseAlarms, correctRejections, targets, nonTargets } = data.overall;

  const cells = [
    { label: 'Hits',               count: hits,              pct: formatPct(hits,              targets),    colour: BAND_COLOURS.green.hex },
    { label: 'Misses',             count: misses,            pct: formatPct(misses,            targets),    colour: BAND_COLOURS.red.hex   },
    { label: 'False Alarms',       count: falseAlarms,       pct: formatPct(falseAlarms,       nonTargets), colour: BAND_COLOURS.red.hex   },
    { label: 'Correct Rejections', count: correctRejections, pct: formatPct(correctRejections, nonTargets), colour: BAND_COLOURS.green.hex },
  ];

  return (
    <figure className="sdt-matrix" role="img" aria-label="Signal detection matrix showing hits, misses, false alarms and correct rejections">
      <div className="sdt-grid">
        {cells.map((cell) => (
          <div key={cell.label} className="sdt-cell" style={{ borderTop: `3px solid ${cell.colour}` }}>
            <span className="sdt-count">{cell.count}</span>
            <span className="sdt-pct">{cell.pct}</span>
            <span className="sdt-label">{cell.label}</span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>Signal Detection Matrix for 2-Back Task</caption>
        <thead>
          <tr><th></th><th>Responded Same</th><th>Responded Different</th></tr>
        </thead>
        <tbody>
          <tr><td>Was a target</td><td>Hits {hits}</td><td>Misses {misses}</td></tr>
          <tr><td>Was not a target</td><td>False Alarms {falseAlarms}</td><td>Correct Rejections {correctRejections}</td></tr>
        </tbody>
      </table>
    </figure>
  );
}