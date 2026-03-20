import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { sizing, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

export function NumericStepper({ label, value, min, max, step = 1, onChange }: Props) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  return (
    <View style={styles.container}>
      <Text style={typography.label}>{label}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={handleDecrement}
          disabled={value <= min}
          activeOpacity={0.75}
        >
          <Text style={[styles.buttonText, value <= min && styles.buttonTextDisabled]}>−</Text>
        </TouchableOpacity>
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={handleIncrement}
          disabled={value >= max}
          activeOpacity={0.75}
        >
          <Text style={[styles.buttonText, value >= max && styles.buttonTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  button: {
    width: 64,
    height: sizing.stepperHeight,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  buttonTextDisabled: {
    color: colors.textDim,
  },
  valueContainer: {
    flex: 1,
    height: sizing.stepperHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
});
