import { BAND_COLOURS } from '../../utils/bandColours.js';

export function FlagSummary({ flags }) {
  const flagCount = flags?.length ?? 0;

  const colour =
    flagCount === 0  ? BAND_COLOURS.green.hex
    : flagCount <= 2 ? BAND_COLOURS.yellow.hex
    : BAND_COLOURS.red.hex;

  return (
    <div className="flag-summary" aria-label={`${flagCount} flag${flagCount !== 1 ? 's' : ''} raised`}>
      <span className="flag-count" style={{ color: colour }}>{flagCount}</span>
      <span className="flag-label"> flag{flagCount !== 1 ? 's' : ''} raised</span>
      {flagCount === 0 && (
        <p className="flag-note">No performance flags across all tasks.</p>
      )}
    </div>
  );
}