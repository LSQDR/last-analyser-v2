import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { normaliseDomainScores } from '../../utils/normaliseDomainScores.js'
import { SROnlyTable } from '../shared/SROnlyTable.jsx'

export function DomainRadarChart({ data }) {
  const scores = normaliseDomainScores(data)
  return (
    <figure aria-label="Radar chart showing normalised performance scores across four cognitive domains" role="img">
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={scores}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="domain" tick={{ fontSize: 13, fill: '#ccc' }} />
          <Radar name="Your Score" dataKey="score" stroke="#3a7bd5" fill="#3a7bd5" fillOpacity={0.35} />
          <Tooltip formatter={v => v != null ? `${v}/100` : 'Not completed'} />
        </RadarChart>
      </ResponsiveContainer>
      <SROnlyTable
        caption="Radar chart data"
        data={scores.map(s => ({ Domain: s.domain, 'Score (out of 100)': s.score ?? 'Not completed' }))}
      />
    </figure>
  )
}
