// Each function returns a plain-English insight sentence for the overall summary.
// Framing follows PMC 2023 neuropsychological feedback survey:
// "implications for daily functioning" rated most important feedback component.

export function getSustainedAttentionInsight(score, overall) {
  if (score == null) return null
  if (score >= 75) return "Your attention appeared to stay consistent across the full task — you responded reliably to targets even as the rounds progressed."
  if (score >= 55) {
    if (overall?.attentionDecaySlope > 0)
      return "Your accuracy was solid early on but tended to dip toward the end of rounds — a pattern sometimes linked to mental fatigue over longer tasks."
    return "Your sustained attention was broadly in range, though some variability in response speed was noted across the three rounds."
  }
  return "Your scores suggest attention may have been inconsistent during this session — this can reflect fatigue, distraction, or simply an off day rather than a fixed trait."
}

export function getInhibitionInsight(score, overall) {
  if (score == null) return null
  if (!overall?.SSRTisValid)
    return "The stopping threshold task didn't fully converge this session, so this score is best treated as approximate — try retaking for a clearer picture."
  if (score >= 75) return "Your brain appeared to cancel unwanted responses quickly — the kind of rapid inhibition that helps with tasks requiring self-control or switching focus."
  if (score >= 50) return "Your inhibition speed was within the typical adult range — you were generally able to stop yourself when signalled, though there was some room for improvement in speed."
  return "Stopping an already-started response took longer than typical in this session — this can be influenced by tiredness or task unfamiliarity as much as underlying inhibition ability."
}

export function getInterferenceInsight(score, overall) {
  if (score == null) return null
  const ms = overall?.trueInterferencems ? Math.round(overall.trueInterferencems) : null
  if (score >= 75) return `Conflicting word meanings added very little delay to your responses${ms ? ` (${ms}ms)` : ''} — your focus on ink colour was strong.`
  if (score >= 50) return `You showed a typical interference effect${ms ? ` of ${ms}ms` : ''} — automatic word-reading competed with your intended response, which is normal for this task.`
  return `The word meanings notably slowed your responses${ms ? ` (${ms}ms additional delay)` : ''} — this suggests automatic reading had a stronger pull than typical, which can vary with concentration levels.`
}

export function getWorkingMemoryInsight(score, overall) {
  if (score == null) return null
  const chr = overall?.correctedHitRatepct?.toFixed(0)
  if (score >= 80) return `Your working memory score was ${chr ? chr + '% ' : ''}— above the typical range, suggesting strong ability to hold and update information across a short sequence.`
  if (score >= 60) return `Your working memory updating score${chr ? ' of ' + chr + '%' : ''} was within the typical adult range for a 2-back task.`
  return `Your score${chr ? ' of ' + chr + '%' : ''} was below the typical threshold — 2-back tasks are genuinely demanding, and scores can be sensitive to sleep, stress, and practice effects.`
}
