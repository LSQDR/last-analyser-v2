export const THEME = {
  // Surfaces
  bg:             '#083359',
  surface:        '#053959',
  surfaceHigh:    '#0a4472',

  // Borders
  border:         '#1a4d6e',
  borderSubtle:   'rgba(102, 98, 85, 0.25)',

  // Text
  text:           '#FAFDE2',
  textSecondary:  '#D9CEB0',
  textMuted:      '#8a8880',

  // Accent
  accent:         '#A5A5D9',
  accentHover:    '#BCBCE6',
  accentDim:      'rgba(165, 165, 217, 0.12)',

  // Semantic 
  green:          '#2ecc71',
  yellow:         '#f1c40f',
  red:            '#e03c31',
  blue:           '#3a7bd5',
};

// Recharts-specific reusable props
export const CHART_DEFAULTS = {
  gridStroke:     THEME.border,
  tickFill:       THEME.textMuted,
  tickFontSize:   12,
  tooltipStyle: {
    background:   THEME.surface,
    border:       `1px solid ${THEME.border}`,
    color:        THEME.text,
    fontFamily:   "'Azeret Mono', monospace",
    fontSize:     '0.82rem',
  },
  lineStroke:     THEME.accent,
  barFill:        THEME.accent,
  radarStroke:    THEME.accent,
  radarFill:      THEME.accent,
  radarFillOpacity: 0.3,
  referenceLineGreen: THEME.green,
  referenceLineRed:   THEME.red,
};