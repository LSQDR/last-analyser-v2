const FLAG_FEEDBACK = {
  // Task 1
  highOmission:    { title: 'Omission rate > 25%',  text: 'Your miss rate on target stimuli was above the typical range. This may reflect variable sustained attention during the task.' },
  attentionDecay:  { title: 'Attention decay detected', text: 'Your attention appeared to decrease over time — more targets were missed in later rounds than earlier ones.' },
  highVariability: { title: 'RT variability CV > 35%',  text: 'Your response times varied considerably across trials. High RT variability is associated with inconsistent attentional engagement.' },
  // Task 2
  highSSRT:             { title: 'SSRT > 300ms',           text: 'Your estimated inhibition speed was above the typical adult range. This suggests the stop process may take longer than average to cancel an initiated response.' },
  lowStopAccuracy:      { title: 'Stop accuracy < 50%',    text: 'You responded on more than half of stop-signal trials. Consistently stopping when signalled is part of controlled inhibition.' },
  convergenceFailure:   { title: 'Estimate reliability note', text: 'The stopping threshold task did not reach a stable estimate in this session. This can happen with very fast or very consistent stopping. The result is shown for reference but should be interpreted cautiously.' },
  // Task 3
  highInterference:         { title: 'True interference > 150ms', text: 'The conflicting word meaningfully slowed your response to the ink colour. A high interference score reflects stronger competition between automatic word-reading and controlled colour-naming.' },
  lowIncongruentAccuracy:   { title: 'Incongruent accuracy < 75%', text: 'You made more errors on colour-conflict trials than is typical. Errors on these trials often reflect moments where the automatic word-reading response won over the intended colour response.' },
  // Task 4
  lowCorrectedHitRate:           { title: 'Corrected hit rate < 60%',  text: 'Your corrected hit rate — accounting for both successful matches and false alarms — was below the typical adult range. This may reflect difficulty updating and holding information in working memory.' },
  severeWorkingMemoryDifficulty: { title: 'Corrected hit rate < 40%',  text: 'Your working memory updating score was considerably below the typical range. Scores at this level may reflect significant difficulty holding and comparing information across sequential items.' },
}

export function FlagSection({ flags, meta }) {
  if (!flags || flags.length === 0) {
    return <p className="no-flags">No performance flags raised for this task.</p>
  }
  return (
    <div className="flag-section">
      <h4>What this may mean</h4>
      {flags.map(flag => {
        const fb = FLAG_FEEDBACK[flag]
        if (!fb) return null
        return (
          <div key={flag} className="flag-item">
            <p className="flag-title">⚠ {fb.title}</p>
            <p className="flag-text">{fb.text}</p>
          </div>
        )
      })}
    </div>
  )
}
