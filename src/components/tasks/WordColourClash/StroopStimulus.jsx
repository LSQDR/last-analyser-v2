import { COLOUR_HEX } from '../../../utils/generate/generateStroopSchedule.js'
import './WordColourClash.css'

export function StroopStimulus({ word, inkColour, visible }) {
  if (!visible || !word) {
    return <div className="stroop-stimulus stroop-stimulus--blank" aria-hidden="true" />
  }

  return (
    <div
      className="stroop-stimulus"
      style={{ color: COLOUR_HEX[inkColour] }}
      aria-label={`The word ${word} printed in ${inkColour}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {word}
    </div>
  )
}
