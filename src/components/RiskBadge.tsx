import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskLevel } from '../types';
import { riskColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  level: RiskLevel;
  probability?: string;
};

export function RiskBadge({ level, probability }: Props) {
  const colors = riskColors[level];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[typography.riskLevel, { color: colors.text }]}>
        {level}
      </Text>
      {probability && (
        <Text style={[typography.riskProb, { color: colors.text }]}>
          {probability}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 8,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
