export const colors = {
  bg:         '#0a0c0f',
  surface:    '#12161c',
  surface2:   '#1a2030',
  border:     '#2a3545',
  text:       '#d4e0f0',
  textDim:    '#6a8099',
  textMono:   '#8ab4c4',
  white:      '#ffffff',
  accent:     '#00c4ff',
  accentDim:  '#1a4a5a',
  green:      '#00e676',
  greenDim:   '#003320',
  yellow:     '#ffd600',
  yellowDim:  '#3a3000',
  orange:     '#ff6d00',
  orangeDim:  '#3a1800',
  red:        '#ff1744',
  redDim:     '#3a0010',
} as const;

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export const riskColors: Record<RiskLevel, { bg: string; border: string; text: string }> = {
  LOW:      { bg: colors.greenDim,  border: colors.green,  text: colors.green },
  MODERATE: { bg: colors.yellowDim, border: colors.yellow, text: colors.yellow },
  HIGH:     { bg: colors.orangeDim, border: colors.orange, text: colors.orange },
  CRITICAL: { bg: colors.redDim,    border: colors.red,    text: colors.red },
};
