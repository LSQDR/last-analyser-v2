// src/components/shared/SROnlyTable.jsx
export function SROnlyTable({ data, caption }) {
  if (!data || data.length === 0) return null
  const columns = Object.keys(data[0])
  return (
    <table className="sr-only">
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>{columns.map(col => <th key={col}>{col}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map(col => <td key={col}>{row[col]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
