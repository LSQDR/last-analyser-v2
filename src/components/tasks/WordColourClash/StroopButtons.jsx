import { COLOUR_HEX } from '../../../utils/generate/generateStroopSchedule.js'
import './WordColourClash.css'

const BUTTONS = [
  { colour: 'red',    label: 'Red',    key: '1' },
  { colour: 'blue',   label: 'Blue',   key: '2' },
  { colour: 'green',  label: 'Green',  key: '3' },
  { colour: 'yellow', label: 'Yellow', key: '4' },
]

export function StroopButtons({ onSelect, enabled }) {
  return (
    <div className="stroop-buttons" role="group" aria-label="Colour response buttons">
      {BUTTONS.map(({ colour, label, key }) => (
        <button
          key={colour}
          className="stroop-btn"
          style={{ backgroundColor: COLOUR_HEX[colour] }}
          onClick={() => enabled && onSelect(colour)}
          disabled={!enabled}
          aria-label={label}
          aria-keyshortcuts={key}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
