import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VoiceFAB } from './VoiceFAB';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';

type Props = {
  active: boolean;
  supported: boolean;
  statusText: string;
  onMicPress: () => void;
  onToggleVoice: () => void;
};

export function GuidedVoiceBar({
  active,
  supported,
  statusText,
  onMicPress,
  onToggleVoice,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.body}>
        <Text style={styles.label}>Guided Voice</Text>
        <Text style={styles.status}>{statusText}</Text>
      </View>
      <TouchableOpacity
        style={[styles.toggle, active ? styles.toggleOn : styles.toggleOff]}
        onPress={onToggleVoice}
        activeOpacity={0.75}
      >
        <Text style={[styles.toggleText, active ? styles.toggleTextOn : styles.toggleTextOff]}>
          {active ? 'VOICE ON' : 'VOICE OFF'}
        </Text>
      </TouchableOpacity>
      <VoiceFAB active={active && supported} onPress={onMicPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    minHeight: sizing.buttonHeightSm + spacing.md,
  },
  body: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizing.borderRadius,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingRight: 160,
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  status: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  toggle: {
    position: 'absolute',
    right: 78,
    top: spacing.md,
    borderRadius: sizing.borderRadiusSm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  toggleOff: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleTextOn: {
    color: colors.accent,
  },
  toggleTextOff: {
    color: colors.textDim,
  },
});
