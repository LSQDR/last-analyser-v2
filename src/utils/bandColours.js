

export const BAND_COLOURS = {
  green:  { hex: '#2ecc71', bg: '#1a3d1a', border: '#2ecc71' },
  blue:   { hex: '#3a7bd5', bg: '#1a2a4a', border: '#3a7bd5' },
  yellow: { hex: '#f1c40f', bg: '#3d3200', border: '#f1c40f' },
  red:    { hex: '#e03c31', bg: '#3d1a1a', border: '#e03c31' },
};

export const bandHex = (colour) => BAND_COLOURS[colour]?.hex ?? BAND_COLOURS.blue.hex;