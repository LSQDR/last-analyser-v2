import { normaliseDomainScores } from '../../utils/normaliseDomainScores.js'

const DESCRIPTIONS = {
  'Sustained Attention':  score => score == null ? null : score >= 70 ? 'Omission rate, variability, and decay all within range.' : 'One or more attention flags were raised — see your Task 1 card below.',
  'Inhibition Control':   score => score == null ? null : score >= 70 ? 'Stop-signal performance within the typical adult range.' : 'Inhibition performance flags raised — see your Task 2 card below.',
  'Interference Control': score => score == null ? null : score >= 70 ? 'Interference from conflicting words was well controlled.' : 'Elevated interference detected — see your Task 3 card below.',
  'Working Memory':       score => score == null ? null : score >= 60 ? 'Working memory updating performance within range.' : 'Working memory flags raised — see your Task 4 card below.',
}

export function DomainSummaryGrid({ data }) {
  const scores = normaliseDomainScores(data)
  return (
    <div className="domain-summary-grid">
      {scores.map(({ domain, score }) => (
        <div key={domain} className="domain-summary-cell">
          <p className="domain-name">{domain}</p>
          {score != null
            ? <p className="domain-desc">{DESCRIPTIONS[domain]?.(score)}</p>
            : <p className="domain-desc domain-desc--pending">Not yet attempted</p>
          }
        </div>
      ))}
    </div>
  )
}
