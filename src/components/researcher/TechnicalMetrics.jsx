import { CPTMetrics }    from './metrics/CPTMetrics.jsx'
import { SSTMetrics }    from './metrics/SSTMetrics.jsx'
import { StroopMetrics } from './metrics/StroopMetrics.jsx'
import { NBackMetrics }  from './metrics/NBackMetrics.jsx'

const METRICS_COMPONENTS = {
  tapThePulse:     CPTMetrics,
  signalStop:      SSTMetrics,
  wordColourClash: StroopMetrics,
  matchOrPass:     NBackMetrics,
}

export function TechnicalMetrics({ taskKey, overall, config }) {
  const MetricsComponent = METRICS_COMPONENTS[taskKey]
  if (!MetricsComponent) return null

  return (
    <div className="technical-metrics">
      <table className="tm-table">
        <thead>
          <tr>
            <th scope="col">Metric</th>
            <th scope="col">Value</th>
            <th scope="col">Note</th>
          </tr>
        </thead>
        <tbody>
          <MetricsComponent o={overall} />
        </tbody>
      </table>

      {config && (
        <details className="tm-config">
          <summary>Task Config</summary>
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </details>
      )}
    </div>
  )
}