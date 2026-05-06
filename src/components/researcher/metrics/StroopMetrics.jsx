import { MetricRow as Row } from './MetricRow.jsx';

export function StroopMetrics({ o }) {
  return (
    <>
      <Row label="Congruent Trials"         value={o.congruentTrials} />
      <Row label="Incongruent Trials"       value={o.incongruentTrials} />
      <Row label="Neutral Trials"           value={o.neutralTrials} />
      <Row label="Congruent Mean RT"        value={o.congruentRTms != null ? `${Math.round(o.congruentRTms)}ms` : null} />
      <Row label="Incongruent Mean RT"      value={o.incongruentRTms != null ? `${Math.round(o.incongruentRTms)}ms` : null} />
      <Row label="Neutral Mean RT"          value={o.neutralRTms != null ? `${Math.round(o.neutralRTms)}ms` : null} />
      <Row label="True Interference"        value={o.trueInterferencems != null ? `${Math.round(o.trueInterferencems)}ms` : null}     note="Incongruent − Neutral" />
      <Row label="Classic Interference"     value={o.classicInterferencems != null ? `${Math.round(o.classicInterferencems)}ms` : null} note="Incongruent − Congruent" />
      <Row label="Facilitation"             value={o.facilitationms != null ? `${Math.round(o.facilitationms)}ms` : null}             note="Neutral − Congruent (suppressed in casual view)" />
      <Row label="Congruent Accuracy"       value={o.congruentAccuracypct != null ? o.congruentAccuracypct.toFixed(2) : null}     note="Threshold 90%" />
      <Row label="Incongruent Accuracy"     value={o.incongruentAccuracypct != null ? o.incongruentAccuracypct.toFixed(2) : null} note="Threshold 75%" />
      <Row label="Neutral Accuracy"         value={o.neutralAccuracypct != null ? o.neutralAccuracypct.toFixed(2) : null} />
      <Row label="Word-Interference Errors" value={o.wordInterferenceRatepct != null ? o.wordInterferenceRatepct.toFixed(2) : null} note="Errors where named word colour instead of ink" />
      <Row label="Flags"                    value={o.flags?.join(', ') || 'None'} />
    </>
  );
}