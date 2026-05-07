import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { sizing, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  label: string;
  sublabel?: string;
  variant: 'primary' | 'go' | 'warn' | 'danger' | 'neutral' | 'outline' | 'tan';
  onPress: () => void;
  disabled?: boolean;
  size?: 'large' | 'small';
};

export function BigButton({ label, sublabel, variant, onPress, disabled, size = 'large' }: Props) {
  const height = size === 'large' ? sizing.buttonHeight : sizing.buttonHeightSm;
  const variantStyles = stylesByVariant[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { height },
        variantStyles.button,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <View>
        <Text style={[typography.buttonLabel, size === 'small' && styles.smallLabel, variantStyles.text]}>
          {label}
        </Text>
        {sublabel && (
          <Text style={[typography.buttonSub, variantStyles.text]}>
            {sublabel}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const stylesByVariant = {
  primary: {
    button: { backgroundColor: colors.accent },
    text: { color: colors.bg },
  },
  go: {
    button: { backgroundColor: colors.green },
    text: { color: colors.bg },
  },
  warn: {
    button: { backgroundColor: colors.orange },
    text: { color: colors.bg },
  },
  danger: {
    button: { backgroundColor: colors.red },
    text: { color: colors.white },
  },
  neutral: {
    button: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
    text: { color: colors.text },
  },
  outline: {
    button: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.accent },
    text: { color: colors.accent },
  },
  tan: {
    button: { backgroundColor: colors.yellow },
    text: { color: colors.bg },
  },
};

const styles = StyleSheet.create({
  button: {
    borderRadius: sizing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  smallLabel: {
    fontSize: 18,
  },
});
