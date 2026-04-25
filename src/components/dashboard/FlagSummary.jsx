export function FlagSummary({ flagCount, totalPossible }) {
  const colour = flagCount === 0 ? '#2ecc71' : flagCount <= 2 ? '#f1c40f' : '#e03c31'
  return (
    <div className="flag-summary" aria-label={`${flagCount} of ${totalPossible} flags raised`}>
      <span className="flag-count" style={{ color: colour }}>{flagCount}</span>
      <span className="flag-label"> / {totalPossible} flags raised</span>
      {flagCount === 0 && <p className="flag-note">No performance flags across all tasks.</p>}
    </div>
  )
}
