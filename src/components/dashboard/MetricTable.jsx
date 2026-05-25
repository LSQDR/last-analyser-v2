import { useState } from "react";

function MetricInfo({ definition }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="metric-info-wrap">
      <button
        className="metric-info-btn"
        type="button"
        aria-label={`What does this mean? ${definition}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open && (
        <span className="metric-info-tooltip" role="tooltip">
          {definition}
        </span>
      )}
    </span>
  );
}

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
          <tr key={i} className={m.flagged ? "metric-row--flagged" : ""}>
            <td>
              <span className="metric-label-text">{m.label}</span>
              {m.definition && <MetricInfo definition={m.definition} />}
            </td>
            <td>{m.value ?? "—"}</td>
            <td>{m.threshold ?? "—"}</td>
            <td>
              {m.threshold ? (
                <span
                  className={`status-badge ${
                    m.flagged ? "status-badge--flag" : "status-badge--ok"
                  }`}
                >
                  {m.flagged ? "Above threshold" : "Within range"}
                </span>
              ) : (
                <span className="status-badge status-badge--info">
                  Informational
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}