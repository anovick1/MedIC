import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  total: number;
  current: number;
};

export function ProgressBar({ total, current }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < current ? styles.filled : styles.unfilled,
            i === total - 1 && styles.lastSegment,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  filled: {
    backgroundColor: colors.accent,
  },
  unfilled: {
    backgroundColor: colors.border,
  },
  lastSegment: {
    marginRight: 0,
  },
});
