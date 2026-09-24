import { MetricRow as Row } from './MetricRow.jsx'

export function SSTMetrics({ o }) {
  return (
    <>
      <Row label="Go Trials"          value={o.goTrials} />
      <Row label="Stop Trials"        value={o.stopTrials} />
      <Row label="Mean Go RT"         value={o.goRTms != null ? `${Math.round(o.goRTms)}ms` : null} />
      <Row label="Go RT SD"           value={o.goRTsdMs != null ? `${Math.round(o.goRTsdMs)}ms` : null} />
      <Row label="Go Omissions"       value={o.goOmissions}   note="Threshold 5" />
      <Row label="Failed Stop RT"     value={o.failedStopRTms != null ? `${Math.round(o.failedStopRTms)}ms` : null} note="Should be < Go RT" />
      <Row label="Stop Accuracy"      value={o.stopAccuracypct != null ? o.stopAccuracypct.toFixed(2) : null} note="Threshold 50%" />
      <Row label="pRespond"           value={o.pRespond != null ? o.pRespond.toFixed(3) : null}  note="Valid range 0.20–0.80" />
      <Row label="Mean SSD"           value={o.meanSSDms != null ? `${Math.round(o.meanSSDms)}ms` : null} />
      <Row label="Final SSD"          value={o.finalSSDms != null ? `${o.finalSSDms}ms` : null} />
      <Row label="SSD History Length" value={o.ssdHistory?.length ?? null} note="staircase steps recorded" />
      <Row label="SSRT"               value={o.SSRTms != null ? `${o.SSRTms}ms` : null} note="Verbruggen 2019 integration method" />
      <Row label="SSRT Valid"         value={o.SSRTisValid != null ? (o.SSRTisValid ? 'Yes' : 'No') : null} />
      <Row label="Race Model"         value={o.raceModelHolds == null ? null : (o.raceModelHolds ? 'Holds' : 'Violated')} note="Failed Stop RT vs Go RT" />
      <Row label="Flags"              value={o.flags?.join(', ') || 'None'} />
    </>
  )
}