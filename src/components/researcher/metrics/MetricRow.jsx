export function MetricRow({ label, value, note }) {
  return (
    <tr>
      <td className="tm-label">{label}</td>
      <td className="tm-value">{value ?? '—'}</td>
      <td className="tm-note">{note}</td>
    </tr>
  );
}