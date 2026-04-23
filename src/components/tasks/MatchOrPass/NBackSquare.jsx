import { COLOUR_HEX } from '../../../utils/generate/generateNBackSchedule.js'
import './MatchOrPass.css'

export function NBackSquare({ colour, visible }) {
  return (
    <div
      className={`nback-square ${visible ? 'nback-square--visible' : 'nback-square--hidden'}`}
      style={{ backgroundColor: visible ? COLOUR_HEX[colour] : 'transparent' }}
      role="img"
      aria-label={visible ? `${colour} square` : 'blank'}
      aria-live="polite"
      aria-atomic="true"
    />
  )
}

// Ghost comparator shown during 1-Back warmup only
export function NBackGhost({ colour }) {
  if (!colour) return null
  return (
    <div className="nback-ghost-wrap" aria-hidden="true">
      <div
        className="nback-square nback-square--visible nback-square--ghost"
        style={{ backgroundColor: COLOUR_HEX[colour] }}
      />
      <span className="nback-ghost-label">1 step back</span>
    </div>
  )
}
