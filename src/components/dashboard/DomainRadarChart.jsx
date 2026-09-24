import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts"
import { normaliseDomainScores } from "../../utils/normaliseDomainScores.js"
import { SROnlyTable } from "../shared/SROnlyTable.jsx"

export function DomainRadarChart({ data }) {
  const scores = normaliseDomainScores(data)

  return (
    <figure
      className="radar-figure"
      aria-label="Radar chart showing normalised performance scores across four cognitive domains"
      role="img"
    >
      <p className="radar-scale-note">
        Scores are normalised to <strong>0–100</strong> against published adult
        norms. <strong>100</strong> = performance within or above the typical
        adult range. Scores below <strong>50</strong> fall outside the typical
        range for that domain.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={scores}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="domain" tick={{ fontSize: 13, fill: "#ccc",  fontWeight: "bold"}} />
          <Radar
            name="Your Score"
            dataKey="score"
            stroke="#3a7bd5"
            fill="#3a7bd5"
            fillOpacity={0.35}
          />
         <Tooltip
            formatter={(v) => (v != null ? `${Math.round(v)}/100` : "Not completed")}
          />
        </RadarChart>
      </ResponsiveContainer>
      <SROnlyTable
        caption="Radar chart data"
        data={scores.map((s) => ({
          Domain: s.domain,
          "Score out of 100": s.score ?? "Not completed",
        }))}
      />
    </figure>
  )
}