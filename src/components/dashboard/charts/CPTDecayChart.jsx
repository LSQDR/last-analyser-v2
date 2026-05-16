import { LineChart, Line, XAxis, YAxis, ReferenceLine, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SROnlyTable } from '../../shared/SROnlyTable.jsx'
import { CHART_DEFAULTS, THEME } from '../../../styles/theme.js'

export function CPTDecayChart({ data }) {
  const blockData = data.blocks.map(b => ({ block: `Block ${b.block}`, omissionRate: b.omissionRatepct }))
  return (
    <figure aria-label="Line chart showing omission rate across 3 blocks">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={blockData}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} />
          <XAxis dataKey="block" tick={{ fill: CHART_DEFAULTS.tickFill, fontSize: CHART_DEFAULTS.tickFontSize }} />
          <YAxis domain={[0, 60]} unit="%" tick={{ fill: CHART_DEFAULTS.tickFill, fontSize: CHART_DEFAULTS.tickFontSize }} />
          <Tooltip
            formatter={v => `${v?.toFixed(1)}%`}
            contentStyle={CHART_DEFAULTS.tooltipStyle}
          />
          <ReferenceLine
            y={25}
            stroke={THEME.red}
            strokeDasharray="4 4"
            label={{ value: '25% threshold', position: 'right', fontSize: 11, fill: THEME.red }}
          />
          <Line
            type="monotone"
            dataKey="omissionRate"
            stroke={CHART_DEFAULTS.lineStroke}
            strokeWidth={2}
            dot={{ r: 5, fill: CHART_DEFAULTS.lineStroke }}
            name="Omission Rate"
          />
        </LineChart>
      </ResponsiveContainer>
      <SROnlyTable data={blockData} caption="Omission rate by block" />
    </figure>
  )
}