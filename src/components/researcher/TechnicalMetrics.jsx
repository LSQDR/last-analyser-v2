// Shows ALL metrics including those suppressed on the casual dashboard.
// d′, race model, go omissions, SSD history, facilitation, pRespond, etc.

function Row({ label, value, note }) {
  return (
    <tr>
      <td className="tm-label">{label}</td>
      <td className="tm-value">{value ?? '—'}</td>
      {note && <td className="tm-note">{note}</td>}
    </tr>
  )
}

export function TechnicalMetrics({ taskKey, overall, config }) {
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
          {taskKey === 'tapThePulse' && <CPTMetrics o={overall} />}
          {taskKey === 'signalStop'  && <SSTMetrics  o={overall} />}
          {taskKey === 'wordColourClash' && <StroopMetrics o={overall} />}
          {taskKey === 'matchOrPass' && <NBackMetrics  o={overall} />}
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

function CPTMetrics({ o }) {
  return <>
    <Row label="Total Targets"           value={o.totalTargets} />
    <Row label="Total Non-targets"       value={o.totalNonTargets} />
    <Row label="Hits"                    value={o.hits} />
    <Row label="Omissions"              value={o.omissions} />
    <Row label="Omission Rate"          value={o.omissionRatepct != null ? `${o.omissionRatepct.toFixed(2)}%` : null} note="Threshold: 25%" />
    <Row label="Commissions"            value={o.commissions} />
    <Row label="Commission Rate"        value={o.commissionRatepct != null ? `${o.commissionRatepct.toFixed(2)}%` : null} note="Threshold: 10%" />
    <Row label="Perseverations"         value={o.perseverationCount} note="RT < 100ms after non-target" />
    <Row label="Lapse Count"            value={o.lapseCount} note="RT > Mean + 2SD of prior block" />
    <Row label="Clean Mean RT"          value={o.cleanMeanRTms != null ? `${Math.round(o.cleanMeanRTms)}ms` : null} note="Excluding lapses & perseverations" />
    <Row label="RT SD"                  value={o.rtSDms != null ? `${Math.round(o.rtSDms)}ms` : null} />
    <Row label="RT CV"                  value={o.cvpct != null ? `${o.cvpct.toFixed(2)}%` : null} note="Threshold: 35%" />
    <Row label="Short ISI Mean RT"      value={o.shortISImeanRTms != null ? `${Math.round(o.shortISImeanRTms)}ms` : null} note="ISI < 1750ms" />
    <Row label="Long ISI Mean RT"       value={o.longISImeanRTms != null ? `${Math.round(o.longISImeanRTms)}ms` : null} note="ISI ≥ 1750ms" />
    <Row label="Attention Decay Slope"  value={o.attentionDecaySlope != null ? o.attentionDecaySlope.toFixed(3) : null} note="Block 3 − Block 1 omission rate" />
    <Row label="Flags"                  value={o.flags?.join(', ') || 'None'} />
  </>
}

function SSTMetrics({ o }) {
  return <>
    <Row label="Go Trials"              value={o.goTrials} />
    <Row label="Stop Trials"            value={o.stopTrials} />
    <Row label="Go RT (mean)"           value={o.goRTms != null ? `${Math.round(o.goRTms)}ms` : null} />
    <Row label="Go RT (SD)"             value={o.goRTsdMs != null ? `${Math.round(o.goRTsdMs)}ms` : null} />
    <Row label="Go Omissions"           value={o.goOmissions} note="Threshold: > 5" />
    <Row label="Failed Stop RT"         value={o.failedStopRTms != null ? `${Math.round(o.failedStopRTms)}ms` : null} note="Should be < Go RT" />
    <Row label="Stop Accuracy"          value={o.stopAccuracypct != null ? `${o.stopAccuracypct.toFixed(2)}%` : null} note="Threshold: ≥ 50%" />
    <Row label="pRespond"               value={o.pRespond != null ? o.pRespond.toFixed(3) : null} note="Valid range: 0.20–0.80" />
    <Row label="Mean SSD"               value={o.meanSSDms != null ? `${Math.round(o.meanSSDms)}ms` : null} />
    <Row label="Final SSD"              value={o.finalSSDms != null ? `${o.finalSSDms}ms` : null} />
    <Row label="SSD History Length"     value={o.ssdHistory?.length ?? null} note="# staircase steps recorded" />
    <Row label="SSRT"                   value={o.SSRTms != null ? `${o.SSRTms}ms` : null} note="Verbruggen 2019 integration method" />
    <Row label="SSRT Valid"             value={o.SSRTisValid != null ? (o.SSRTisValid ? 'Yes' : 'No') : null} />
    <Row label="Race Model"             value={o.raceModelHolds == null ? '—' : o.raceModelHolds ? 'Holds' : 'Violated'} note="Failed Stop RT vs Go RT" />
    <Row label="Flags"                  value={o.flags?.join(', ') || 'None'} />
  </>
}

function StroopMetrics({ o }) {
  return <>
    <Row label="Congruent Trials"       value={o.congruentTrials} />
    <Row label="Incongruent Trials"     value={o.incongruentTrials} />
    <Row label="Neutral Trials"         value={o.neutralTrials} />
    <Row label="Congruent Mean RT"      value={o.congruentRTms != null ? `${Math.round(o.congruentRTms)}ms` : null} />
    <Row label="Incongruent Mean RT"    value={o.incongruentRTms != null ? `${Math.round(o.incongruentRTms)}ms` : null} />
    <Row label="Neutral Mean RT"        value={o.neutralRTms != null ? `${Math.round(o.neutralRTms)}ms` : null} />
    <Row label="True Interference"      value={o.trueInterferencems != null ? `${Math.round(o.trueInterferencems)}ms` : null} note="Incongruent − Neutral" />
    <Row label="Classic Interference"   value={o.classicInterferencems != null ? `${Math.round(o.classicInterferencems)}ms` : null} note="Incongruent − Congruent" />
    <Row label="Facilitation"           value={o.facilitationms != null ? `${Math.round(o.facilitationms)}ms` : null} note="Neutral − Congruent (suppressed in casual view)" />
    <Row label="Congruent Accuracy"     value={o.congruentAccuracypct != null ? `${o.congruentAccuracypct.toFixed(2)}%` : null} note="Threshold: ≥ 90%" />
    <Row label="Incongruent Accuracy"   value={o.incongruentAccuracypct != null ? `${o.incongruentAccuracypct.toFixed(2)}%` : null} note="Threshold: ≥ 75%" />
    <Row label="Neutral Accuracy"       value={o.neutralAccuracypct != null ? `${o.neutralAccuracypct.toFixed(2)}%` : null} />
    <Row label="Word-Interference Errors" value={o.wordInterferenceRatepct != null ? `${o.wordInterferenceRatepct.toFixed(2)}%` : null} note="Errors where named word colour instead of ink" />
    <Row label="Flags"                  value={o.flags?.join(', ') || 'None'} />
  </>
}

function NBackMetrics({ o }) {
  return <>
    <Row label="Total Trials"           value={o.totalTrials} />
    <Row label="Targets"                value={o.targets} />
    <Row label="Non-Targets"            value={o.nonTargets} />
    <Row label="Hits"                   value={o.hits} />
    <Row label="Misses"                 value={o.misses} />
    <Row label="False Alarms"           value={o.falseAlarms} />
    <Row label="Correct Rejections"     value={o.correctRejections} />
    <Row label="Hit Rate"               value={o.hitRatepct != null ? `${o.hitRatepct.toFixed(2)}%` : null} />
    <Row label="False Alarm Rate"       value={o.falseAlarmRatepct != null ? `${o.falseAlarmRatepct.toFixed(2)}%` : null} />
    <Row label="Corrected Hit Rate"     value={o.correctedHitRatepct != null ? `${o.correctedHitRatepct.toFixed(2)}%` : null} note="Hit Rate − False Alarm Rate; Threshold: ≥ 60%" />
    <Row label="d′ (d-prime)"           value={o.dPrime != null ? o.dPrime.toFixed(3) : null} note="Log-linear corrected; suppressed in casual view" />
    <Row label="Response Bias (c)"      value={o.biasc != null ? o.biasc.toFixed(3) : null} note="Criterion; suppressed in casual view" />
    <Row label="Mean Response RT"       value={o.meanResponseRTms != null ? `${Math.round(o.meanResponseRTms)}ms` : null} />
    <Row label="Omissions"              value={o.omissions} note="Threshold: > 5" />
    <Row label="Flags"                  value={o.flags?.join(', ') || 'None'} />
  </>
}
