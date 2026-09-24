import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { SROnlyTable } from '../../shared/SROnlyTable.jsx'
import { CHART_DEFAULTS } from '../../../styles/theme.js'

export function StroopRTChart({ data }) {
  const chartData = [
    { condition: 'Congruent',   rt: data.overall.congruentRTms },
    { condition: 'Neutral',     rt: data.overall.neutralRTms },
    { condition: 'Incongruent', rt: data.overall.incongruentRTms },
  ]
  return (
    <figure aria-label="Bar chart comparing mean reaction time across congruent, neutral, and incongruent conditions">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} />
          <XAxis dataKey="condition" tick={{ fill: CHART_DEFAULTS.tickFill, fontSize: CHART_DEFAULTS.tickFontSize }} />
          <YAxis unit="ms" domain={[300, 'auto']} tick={{ fill: CHART_DEFAULTS.tickFill, fontSize: CHART_DEFAULTS.tickFontSize }} />
          <Tooltip
            formatter={v => `${Math.round(v)}ms`}
            contentStyle={CHART_DEFAULTS.tooltipStyle}
          />
          <Bar dataKey="rt" fill={CHART_DEFAULTS.barFill} name="Mean RT" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="rt" position="top" fontSize={12} fill={CHART_DEFAULTS.tickFill} formatter={v => Math.round(v)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <SROnlyTable data={chartData.map(d => ({ Condition: d.condition, 'Mean RT in ms': Math.round(d.rt) }))} caption="Stroop mean RT by condition" />
    </figure>
  )
}