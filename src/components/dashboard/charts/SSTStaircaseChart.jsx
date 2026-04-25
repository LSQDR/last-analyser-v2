import { LineChart, Line, XAxis, YAxis, ReferenceLine, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SROnlyTable } from '../../shared/SROnlyTable.jsx'

export function SSTStaircaseChart({ data }) {
  const ssdData  = data.overall.ssdHistory.map((ssd, i) => ({ stopTrial: i + 1, ssd }))
  const finalSSD = data.overall.meanSSDms
  return (
    <figure aria-label="Line chart showing stop-signal delay convergence across stop trials">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={ssdData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
          <XAxis dataKey="stopTrial" label={{ value: 'Stop Trial', position: 'insideBottom', offset: -2, fill: '#aaa', fontSize: 11 }} tick={{ fill: '#aaa', fontSize: 11 }} />
          <YAxis domain={[0, 700]} unit="ms" tick={{ fill: '#aaa', fontSize: 11 }} />
          <Tooltip formatter={v => `${v}ms`} contentStyle={{ background: '#16213e', border: '1px solid #333' }} />
          <ReferenceLine y={finalSSD} stroke="#2ecc71" strokeDasharray="4 4" label={{ value: `Converged: ${finalSSD}ms`, position: 'right', fontSize: 10, fill: '#2ecc71' }} />
          <Line type="monotone" dataKey="ssd" stroke="#3a7bd5" strokeWidth={2} dot={false} name="SSD" />
        </LineChart>
      </ResponsiveContainer>
      <SROnlyTable data={ssdData.map(d => ({ 'Stop Trial': d.stopTrial, 'SSD (ms)': d.ssd }))} caption="SSD convergence history" />
    </figure>
  )
}
