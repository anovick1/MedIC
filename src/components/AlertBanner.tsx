import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  type: 'info' | 'warning' | 'critical';
  message: string;
  icon?: string;
};

export function AlertBanner({ type, message, icon }: Props) {
  const variantStyles = stylesByType[type];

  return (
    <View style={[styles.banner, variantStyles.banner]}>
      {icon && <Text style={[styles.icon, variantStyles.text]}>{icon}</Text>}
      <Text style={[styles.message, variantStyles.text]}>{message}</Text>
    </View>
  );
}

const stylesByType = {
  info: {
    banner: { backgroundColor: colors.accentDim, borderColor: colors.accent },
    text: { color: colors.accent },
  },
  warning: {
    banner: { backgroundColor: colors.orangeDim, borderColor: colors.orange },
    text: { color: colors.orange },
  },
  critical: {
    banner: { backgroundColor: colors.redDim, borderColor: colors.red },
    text: { color: colors.red },
  },
};

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
