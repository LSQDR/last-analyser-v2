import { useState } from 'react'

const PAGE_SIZE = 30

export function EventLogTable({ columns, events }) {
  const [page, setPage] = useState(0)

  if (!events || events.length === 0) {
    return <p className="researcher-empty">No event log available.</p>
  }

  const pageCount = Math.ceil(events.length / PAGE_SIZE)
  const slice     = events.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function formatCell(col, event, i) {
    if (col.key === 'index') return i + page * PAGE_SIZE + 1
    const val = event[col.key]
    if (val == null) return '—'
    if (typeof val === 'boolean') return val ? '✓' : '✗'
    if (typeof val === 'number' && col.key.toLowerCase().includes('rt')) return Math.round(val)
    return String(val)
  }

  return (
    <div className="event-log-wrap">
      <div className="event-log-scroll" role="region" aria-label="Trial-level event log" tabIndex={0}>
        <table className="event-log-table">
          <thead>
            <tr>{columns.map((c) => <th key={c.key} scope="col">{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {slice.map((event, i) => (
              <tr
                key={i}
                className={
                  event.classification === 'omission' || event.classification === 'miss'
                    ? 'row--flag'
                    : ''
                }
              >
                {columns.map((c) => (
                  <td key={c.key}>{formatCell(c, event, i)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="event-log-pagination">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Prev
          </button>
          <span>Page {page + 1} of {pageCount} — {events.length} trials</span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
