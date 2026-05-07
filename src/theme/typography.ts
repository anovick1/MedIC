import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.text,
    textTransform: 'uppercase',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.textDim,
    textTransform: 'uppercase',
  },
  buttonLabel: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  buttonSub: {
    fontSize: 15,
    fontWeight: '400',
    marginTop: 4,
  },
  segmentLabel: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  segmentSub: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  riskLevel: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  riskProb: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
  },
  dataKey: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.textDim,
    textTransform: 'uppercase',
  },
  dataVal: {
    fontSize: 18,
    color: colors.text,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: colors.textMono,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.textDim,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
});
