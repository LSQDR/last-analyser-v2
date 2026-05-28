import './MatchOrPass.css'

export function NBackButtons({ onResponse, enabled }) {
  return (
    <div className="nback-buttons" role="group" aria-label="Match response buttons">
      <button
        className="nback-btn nback-btn--match"
        onClick={() => enabled && onResponse('match')}
        disabled={!enabled}
        aria-label="Match, this matches 2 steps back"
        aria-keyshortcuts="M"
      >
        Match
      </button>
      <button
        className="nback-btn nback-btn--pass"
        onClick={() => enabled && onResponse('pass')}
        disabled={!enabled}
        aria-label="Pass, this does not match 2 steps back"
        aria-keyshortcuts="D"
      >
        Pass
      </button>
    </div>
  )
}
