import { LineChart, Line, XAxis, YAxis, ReferenceLine, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SROnlyTable } from '../../shared/SROnlyTable.jsx'

export function CPTDecayChart({ data }) {
  const blockData = data.blocks.map(b => ({ block: `Block ${b.block}`, omissionRate: b.omissionRatepct }))
  return (
    <figure aria-label="Line chart showing omission rate across 3 blocks">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={blockData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
          <XAxis dataKey="block" tick={{ fill: '#aaa', fontSize: 12 }} />
          <YAxis domain={[0, 60]} unit="%" tick={{ fill: '#aaa', fontSize: 12 }} />
          <Tooltip formatter={v => `${v?.toFixed(1)}%`} contentStyle={{ background: '#16213e', border: '1px solid #333' }} />
          <ReferenceLine y={25} stroke="#e03c31" strokeDasharray="4 4" label={{ value: '25% threshold', position: 'right', fontSize: 11, fill: '#e03c31' }} />
          <Line type="monotone" dataKey="omissionRate" stroke="#3a7bd5" strokeWidth={2} dot={{ r: 5 }} name="Omission Rate" />
        </LineChart>
      </ResponsiveContainer>
      <SROnlyTable data={blockData} caption="Omission rate by block" />
    </figure>
  )
}

