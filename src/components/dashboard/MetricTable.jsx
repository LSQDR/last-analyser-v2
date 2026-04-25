export function MetricTable({ metrics }) {
  return (
    <table className="metric-table">
      <thead>
        <tr>
          <th scope="col">Metric</th>
          <th scope="col">Value</th>
          <th scope="col">Threshold</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {metrics.map((m, i) => (
          <tr key={i} className={m.flagged ? 'metric-row--flagged' : ''}>
            <td>{m.label}</td>
            <td>{m.value}</td>
            <td>{m.threshold ?? '—'}</td>
            <td>
              {m.threshold
                ? <span className={`status-badge ${m.flagged ? 'status-badge--flag' : 'status-badge--ok'}`}>
                    {m.flagged ? '⚠ Above threshold' : '✓ Within range'}
                  </span>
                : <span className="status-badge status-badge--info">Informational</span>
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
