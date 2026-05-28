export function FlagSection({ flags, flagFeedback }) {
  if (!flags || flags.length === 0) {
    return <p className="no-flags">No performance flags raised for this task.</p>
  }

  return (
    <div className="flag-section">
      <h4>What this may mean</h4>
      {flags.map((flag) => {
        const fb = flagFeedback?.[flag]
        if (!fb) return null
        return (
          <div key={flag} className="flag-item">
            <p className="flag-title">{fb.title}</p>
            <p className="flag-text">{fb.text}</p>
          </div>
        )
      })}
    </div>
  )
}


