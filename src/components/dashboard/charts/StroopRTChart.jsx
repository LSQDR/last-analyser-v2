import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, LabelList } from 'recharts'
import { SROnlyTable } from '../../shared/SROnlyTable.jsx'

export function StroopRTChart({ data }) {
  const chartData = [
    { condition: 'Congruent',   rt: data.overall.congruentRTms   },
    { condition: 'Neutral',     rt: data.overall.neutralRTms     },
    { condition: 'Incongruent', rt: data.overall.incongruentRTms },
  ]
  return (
    <figure aria-label="Bar chart comparing mean reaction time across congruent, neutral, and incongruent conditions">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
          <XAxis dataKey="condition" tick={{ fill: '#aaa', fontSize: 12 }} />
          <YAxis unit="ms" domain={[300, 'auto']} tick={{ fill: '#aaa', fontSize: 12 }} />
          <Tooltip formatter={v => `${Math.round(v)}ms`} contentStyle={{ background: '#16213e', border: '1px solid #333' }} />
          <Bar dataKey="rt" fill="#3a7bd5" name="Mean RT">
            <LabelList dataKey="rt" position="top" fontSize={12} fill="#aaa" formatter={v => `${Math.round(v)}`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <SROnlyTable data={chartData.map(d => ({ Condition: d.condition, 'Mean RT (ms)': Math.round(d.rt) }))} caption="Stroop mean RT by condition" />
    </figure>
  )
}
