import './SignalStop.css'

export function SSTCircle({ goVisible, stopVisible, onClick }) {
  return (
    <div className="sst-shell" onClick={goVisible ? onClick : undefined}>
      <div className={`sst-go-circle ${goVisible ? 'sst-go-circle--visible' : ''}`}
        role="button"
        tabIndex={goVisible ? 0 : -1}
        aria-label={goVisible ? (stopVisible ? 'Stop! Do not click' : 'Green circle, click as fast as you can') : 'waiting'}
        onKeyDown={e => e.key === ' ' || e.key === 'Enter' ? onClick?.() : null}
      >
        {/* Stop signal red ring overlay */}
        {stopVisible && (
          <div
            className="sst-stop-ring"
            aria-label="Stop! Do not click"
            aria-live="assertive"
          />
        )}
      </div>
    </div>
  )
}
