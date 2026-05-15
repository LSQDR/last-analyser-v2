import { BAND_COLOURS } from '../../../utils/bandColours' 
import './MatchOrPass.css'

export function NBackSquare({ colour, visible }) {
  return (
    <div
      className={`nback-square ${visible ? 'nback-square--visible' : 'nback-square--hidden'}`}
      style={{ backgroundColor: visible ? BAND_COLOURS[colour]?.hex : 'transparent' }}
      role="img"
      aria-label={visible ? `${colour} square` : 'blank'}
      aria-live="polite"
      aria-atomic="true"
    >
      {visible && colour && (
        <span className="nback-square-label" aria-hidden="true">
          {colour.toUpperCase()}
        </span>
      )}
    </div>
  )
}

export function NBackGhost({ colour }) {
  if (!colour) return null
  return (
    <div className="nback-ghost-wrap" aria-hidden="true">
      <div
        className="nback-square nback-square--visible nback-square--ghost"
        style={{ backgroundColor: BAND_COLOURS[colour]?.hex }}
      />
      <span className="nback-ghost-label">1 step back</span>
    </div>
  )
}