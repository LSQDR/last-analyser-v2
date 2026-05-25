import { getPercentage } from "../../../utils/stats.js"
import { SROnlyTable } from "../../shared/SROnlyTable.jsx"
import "./NBackSDTMatrix.css"

function formatPct(n, d) {
  return getPercentage(n, d) != null ? `${getPercentage(n, d).toFixed(1)}%` : "—"
}

export function NBackSDTMatrix({ data }) {
  const { hits, misses, falseAlarms, correctRejections, targets, nonTargets } = data.overall

  return (
    <figure className="sdt-matrix" role="img" aria-label="Signal detection matrix showing hits, misses, false alarms and correct rejections">
      <div className="sdt-grid">

        <div className="sdt-cell sdt-cell--hit">
          <span className="sdt-cell-count">{hits} </span>
          <span className="sdt-cell-pct">{formatPct(hits, targets)}</span>
          <span className="sdt-cell-label">Hits</span>
          <span className="sdt-cell-desc">You pressed Match and it was a match ✓</span>
        </div>

        <div className="sdt-cell sdt-cell--miss">
          <span className="sdt-cell-count">{misses} </span>
          <span className="sdt-cell-pct">{formatPct(misses, targets)}</span>
          <span className="sdt-cell-label">Misses</span>
          <span className="sdt-cell-desc">You pressed Pass but it was a match ✗</span>
        </div>

        <div className="sdt-cell sdt-cell--fa">
          <span className="sdt-cell-count">{falseAlarms} </span>
          <span className="sdt-cell-pct">{formatPct(falseAlarms, nonTargets)}</span>
          <span className="sdt-cell-label">False Alarms</span>
          <span className="sdt-cell-desc">You pressed Match but it wasn't ✗</span>
        </div>

        <div className="sdt-cell sdt-cell--cr">
          <span className="sdt-cell-count">{correctRejections} </span>
          <span className="sdt-cell-pct">{formatPct(correctRejections, nonTargets)}</span>
          <span className="sdt-cell-label">Correct Passes</span>
          <span className="sdt-cell-desc">You pressed Pass and it wasn't a match ✓</span>
        </div>

      </div>

      <SROnlyTable
        caption="Signal Detection Matrix for 2-Back Task"
        data={[
          { "": "Was a match", "You pressed Match": hits, "You pressed Pass": misses },
          { "": "Was not a match", "You pressed Match": falseAlarms, "You pressed Pass": correctRejections },
        ]}
      />
    </figure>
  )
}