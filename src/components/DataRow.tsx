import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  label: string;
  value: string;
  valueColor?: string;
  isLast?: boolean;
};

export function DataRow({ label, value, valueColor, isLast }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={typography.dataKey}>{label}</Text>
        <Text style={[typography.dataVal, valueColor && { color: valueColor }]}>
          {value}
        </Text>
      </View>
      {!isLast && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
});
