import './MatchOrPass.css'

export function NBackButtons({ onResponse, enabled }) {
  return (
    <div className="nback-buttons" role="group" aria-label="Match response buttons">
      <button
        className="nback-btn nback-btn--match"
        onClick={() => enabled && onResponse('match')}
        disabled={!enabled}
        aria-label="Same — this matches 2 steps back"
        aria-keyshortcuts="M"
      >
        Same
      </button>
      <button
        className="nback-btn nback-btn--pass"
        onClick={() => enabled && onResponse('pass')}
        disabled={!enabled}
        aria-label="Different — this does not match 2 steps back"
        aria-keyshortcuts="D"
      >
        Different
      </button>
    </div>
  )
}
