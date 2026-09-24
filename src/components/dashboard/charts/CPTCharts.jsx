import { CPTDecayChart } from './CPTDecayChart.jsx'
import { CPTISIChart } from './CPTISIChart.jsx'

export function CPTCharts({ data }) {
  return (
    <>
      <CPTDecayChart data={data} />
      <CPTISIChart data={data} />
    </>
  )
}
