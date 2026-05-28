import './TapThePulse.css'

export function CPTCircle({ state, onClick }) {
  const isTarget = state === 'red'

  return (
    <div className="cpt-shell">
      <button
        className={`cpt-circle ${isTarget ? 'red' : 'blue'}`}
        onClick={onClick}
        aria-label={isTarget ? 'Circle is red, click now' : 'Circle is blue, do not click'}
      >
        
        {isTarget && <span className="cpt-inner-dot" aria-hidden="true" />}
      </button>
      
      <div className="cpt-prompt" aria-live="assertive" aria-atomic="true">
        {isTarget ? 'Click now!' : ''}
      </div>
    </div>
  )
}
