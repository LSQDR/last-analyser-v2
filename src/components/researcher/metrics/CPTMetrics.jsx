import { MetricRow as Row } from './MetricRow.jsx';

export function CPTMetrics({ o }) {
  return (
    <>
      <Row label="Total Targets"         value={o.totalTargets} />
      <Row label="Total Non-targets"     value={o.totalNonTargets} />
      <Row label="Hits"                  value={o.hits} />
      <Row label="Omissions"             value={o.omissions} />
      <Row label="Omission Rate"         value={o.omissionRatepct != null ? o.omissionRatepct.toFixed(2) : null}    note="Threshold 25%" />
      <Row label="Commissions"           value={o.commissions} />
      <Row label="Commission Rate"       value={o.commissionRatepct != null ? o.commissionRatepct.toFixed(2) : null} note="Threshold 10%" />
      <Row label="Perseverations"        value={o.perseverationCount}  note="RT < 100ms after non-target" />
      <Row label="Lapse Count"           value={o.lapseCount}          note="RT > Mean + 2SD of prior block" />
      <Row label="Clean Mean RT"         value={o.cleanMeanRTms != null ? `${Math.round(o.cleanMeanRTms)}ms` : null} note="Excluding lapses & perseverations" />
      <Row label="RT SD"                 value={o.rtSDms != null ? `${Math.round(o.rtSDms)}ms` : null} />
      <Row label="RT CV"                 value={o.cvpct != null ? o.cvpct.toFixed(2) : null}             note="Threshold 35%" />
      <Row label="Short ISI Mean RT"     value={o.shortISImeanRTms != null ? `${Math.round(o.shortISImeanRTms)}ms` : null} note="ISI ≤ 1750ms" />
      <Row label="Long ISI Mean RT"      value={o.longISImeanRTms  != null ? `${Math.round(o.longISImeanRTms)}ms`  : null} note="ISI > 1750ms" />
      <Row label="Attention Decay Slope" value={o.attentionDecaySlope != null ? o.attentionDecaySlope.toFixed(3) : null} note="Block 3 − Block 1 omission rate" />
      <Row label="Flags"                 value={o.flags?.join(', ') || 'None'} />
    </>
  );
}