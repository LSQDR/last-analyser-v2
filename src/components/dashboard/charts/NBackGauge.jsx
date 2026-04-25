export function NBackGauge({ correctedHitRate }) {
  const clampedRate = Math.max(0, Math.min(100, correctedHitRate))
  return (
    <div className="nback-gauge" role="meter" aria-label={`Corrected hit rate: ${clampedRate?.toFixed(1)}%`}
      aria-valuenow={clampedRate} aria-valuemin={0} aria-valuemax={100}>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${clampedRate}%` }} aria-hidden="true" />
        <div className="gauge-threshold" style={{ left: '60%' }} aria-hidden="true" />
      </div>
      <div className="gauge-labels" aria-hidden="true">
        <span>0</span>
        <span className="gauge-threshold-label">60% threshold</span>
        <span>100</span>
      </div>
      <p className="gauge-value">{clampedRate?.toFixed(1)}%</p>
    </div>
  )
}
