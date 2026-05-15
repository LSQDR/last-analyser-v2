import { BAND_COLOURS } from '../../utils/bandColours.js';

export function FlagSummary({ flags }) {
  const flagCount = flags?.length ?? 0;
  const colour =
    flagCount === 0
      ? BAND_COLOURS.green.hex
      : flagCount <= 2
      ? BAND_COLOURS.yellow.hex
      : BAND_COLOURS.red.hex;

  const bgVar =
    flagCount === 0
      ? 'var(--colour-green-bg)'
      : flagCount <= 2
      ? 'var(--colour-yellow-bg)'
      : 'var(--colour-red-bg)';

  return (
    <div
      className="flag-summary"
      aria-label={`${flagCount} flag${flagCount !== 1 ? 's' : ''} raised`}
    >
      <div
        className="flag-summary__callout"
        style={{ background: bgVar, borderColor: colour }}
      >
        <span className="flag-summary__icon" aria-hidden="true">&#9873;</span>
        <span className="flag-count" style={{ color: colour }}>{flagCount}</span>
        <span className="flag-label">
          {`flag${flagCount !== 1 ? 's' : ''} raised`}
        </span>
      </div>
      {flagCount === 0 && (
        <p className="flag-note">No performance flags across all tasks.</p>
      )}
    </div>
  );
}