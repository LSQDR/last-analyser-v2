import { MetricRow as Row } from './MetricRow.jsx';

export function NBackMetrics({ o }) {
  return (
    <>
      <Row label="Total Trials"       value={o.totalTrials} />
      <Row label="Targets"            value={o.targets} />
      <Row label="Non-Targets"        value={o.nonTargets} />
      <Row label="Hits"               value={o.hits} />
      <Row label="Misses"             value={o.misses} />
      <Row label="False Alarms"       value={o.falseAlarms} />
      <Row label="Correct Rejections" value={o.correctRejections} />
      <Row label="Hit Rate"           value={o.hitRatepct != null ? o.hitRatepct.toFixed(2) : null} />
      <Row label="False Alarm Rate"   value={o.falseAlarmRatepct != null ? o.falseAlarmRatepct.toFixed(2) : null} />
      <Row label="Corrected Hit Rate" value={o.correctedHitRatepct != null ? o.correctedHitRatepct.toFixed(2) : null} note="Hit Rate − False Alarm Rate | Threshold 60%" />
      <Row label="d′ (d-prime)"       value={o.dPrime != null ? o.dPrime.toFixed(3) : null}  note="Log-linear corrected (suppressed in casual view)" />
      <Row label="Response Bias (c)"  value={o.biasc != null ? o.biasc.toFixed(3) : null}    note="Criterion (suppressed in casual view)" />
      <Row label="Mean Response RT"   value={o.meanResponseRTms != null ? `${Math.round(o.meanResponseRTms)}ms` : null} />
      <Row label="Omissions"          value={o.omissions} note="Threshold 5" />
      <Row label="Flags"              value={o.flags?.join(', ') || 'None'} />
    </>
  );
}