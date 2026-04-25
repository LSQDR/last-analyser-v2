function pct(n, d) { return d ? ((n / d) * 100).toFixed(1) : '—' }

export function NBackSDTMatrix({ data }) {
  const { hits, misses, falseAlarms, correctRejections, targets, nonTargets } = data.overall
  const cells = [
    { label: 'Hits',              count: hits,             pct: pct(hits,             targets),    colour: '#2ecc71' },
    { label: 'Misses',            count: misses,           pct: pct(misses,           targets),    colour: '#e03c31' },
    { label: 'False Alarms',      count: falseAlarms,      pct: pct(falseAlarms,      nonTargets), colour: '#e03c31' },
    { label: 'Correct Rejections',count: correctRejections,pct: pct(correctRejections,nonTargets), colour: '#2ecc71' },
  ]
  return (
    <figure className="sdt-matrix" role="img" aria-label="Signal detection matrix showing hits, misses, false alarms and correct rejections">
      <div className="sdt-grid">
        {cells.map(cell => (
          <div key={cell.label} className="sdt-cell" style={{ borderTop: `3px solid ${cell.colour}` }}>
            <span className="sdt-count">{cell.count}</span>
            <span className="sdt-pct">{cell.pct}%</span>
            <span className="sdt-label">{cell.label}</span>
          </div>
        ))}
      </div>
      <table className="sr-only"><caption>Signal Detection Matrix for 2-Back Task</caption>
        <thead><tr><th /><th>Responded Same</th><th>Responded Different</th></tr></thead>
        <tbody>
          <tr><td>Was a target</td><td>Hits: {hits}</td><td>Misses: {misses}</td></tr>
          <tr><td>Was not a target</td><td>False Alarms: {falseAlarms}</td><td>Correct Rejections: {correctRejections}</td></tr>
        </tbody>
      </table>
    </figure>
  )
}

