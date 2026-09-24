import { LineChart, Line, XAxis, YAxis, ReferenceLine, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SROnlyTable } from '../../shared/SROnlyTable.jsx'
import { CHART_DEFAULTS, THEME } from '../../../styles/theme.js'

export function SSTStaircaseChart({ data }) {
  const ssdData = data.overall.ssdHistory.map((ssd, i) => ({ stopTrial: i + 1, ssd }))
  const finalSSD = data.overall.meanSSDms
  return (
    <figure aria-label="Line chart showing stop-signal delay convergence across stop trials">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={ssdData}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} />
          <XAxis
            dataKey="stopTrial"
            label={{ value: 'Stop Trial', position: 'insideBottom', offset: -2, fill: CHART_DEFAULTS.tickFill, fontSize: 11 }}
            tick={{ fill: CHART_DEFAULTS.tickFill, fontSize: CHART_DEFAULTS.tickFontSize }}
          />
          <YAxis domain={[0, 700]} unit="ms" tick={{ fill: CHART_DEFAULTS.tickFill, fontSize: CHART_DEFAULTS.tickFontSize }} />
          <Tooltip
            formatter={v => `${v}ms`}
            contentStyle={CHART_DEFAULTS.tooltipStyle}
          />
          <ReferenceLine
            y={finalSSD}
            stroke={THEME.green}
            strokeDasharray="4 4"
            label={{ value: `Converged: ${finalSSD}ms`, position: 'right', fontSize: 10, fill: THEME.green }}
          />
          <Line
            type="monotone"
            dataKey="ssd"
            stroke={CHART_DEFAULTS.lineStroke}
            strokeWidth={2}
            dot={false}
            name="SSD"
          />
        </LineChart>
      </ResponsiveContainer>
      <SROnlyTable data={ssdData.map(d => ({ 'Stop Trial': d.stopTrial, 'SSD in ms': d.ssd }))} caption="SSD convergence history" />
    </figure>
  )
}