import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { sizing, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = {
  title: string;
  children: React.ReactNode;
};

export function SectionCard({ title, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.border} />
        <Text style={typography.sectionLabel}>{title}</Text>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizing.borderRadius,
    padding: sizing.cardPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  border: {
    width: 3,
    height: 16,
    backgroundColor: colors.accent,
    marginRight: spacing.sm,
  },
  content: {
    gap: spacing.lg,
  },
});
