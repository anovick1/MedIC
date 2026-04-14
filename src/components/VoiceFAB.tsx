import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { sizing, spacing } from '../theme/spacing';

type Props = {
  active?: boolean;
  onPress: () => void;
};

export function VoiceFAB({ active, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        active ? styles.active : styles.inactive,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.icon}>🎤</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  active: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  inactive: {
    backgroundColor: colors.surface2,
    borderColor: colors.accent,
    opacity: 0.5,
  },
  icon: {
    fontSize: 24,
  },
});
