import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { CHART_DEFAULTS } from '../../../styles/theme.js'

export function CPTISIChart({ data }) {
  const chartData = [
    { label: 'Short ISI (<1.75s)', rt: data.overall.shortISImeanRTms },
    { label: 'Long ISI (≥1.75s)', rt: data.overall.longISImeanRTms },
  ]
  return (
    <figure aria-label="Bar chart comparing mean RT for short and long ISI trials">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" unit="ms" domain={[0, 800]} tick={{ fill: CHART_DEFAULTS.tickFill, fontSize: CHART_DEFAULTS.tickFontSize }} />
          <YAxis type="category" dataKey="label" width={130} tick={{ fill: CHART_DEFAULTS.tickFill, fontSize: CHART_DEFAULTS.tickFontSize }} />
          <Tooltip
            formatter={v => `${Math.round(v)}ms`}
            contentStyle={CHART_DEFAULTS.tooltipStyle}
          />
          <Bar dataKey="rt" fill={CHART_DEFAULTS.barFill} name="Mean RT" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </figure>
  )
}