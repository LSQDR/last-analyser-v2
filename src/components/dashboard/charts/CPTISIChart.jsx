import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer as RC2 } from 'recharts'

export function CPTISIChart({ data }) {
  const chartData = [
    { label: 'Short ISI (<1.75s)', rt: data.overall.shortISImeanRTms },
    { label: 'Long ISI (≥1.75s)',  rt: data.overall.longISImeanRTms  },
  ]
  return (
    <figure aria-label="Bar chart comparing mean RT for short and long ISI trials">
      <RC2 width="100%" height={200}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" unit="ms" domain={[0, 800]} tick={{ fill: '#aaa', fontSize: 12 }} />
          <YAxis type="category" dataKey="label" width={130} tick={{ fill: '#aaa', fontSize: 12 }} />
          <Tooltip formatter={v => `${Math.round(v)}ms`} contentStyle={{ background: '#16213e', border: '1px solid #333' }} />
          <Bar dataKey="rt" fill="#3a7bd5" name="Mean RT" />
        </BarChart>
      </RC2>
    </figure>
  )
}
