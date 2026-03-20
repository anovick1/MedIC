import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { SectionCard } from '../components/SectionCard';
import { RiskBadge } from '../components/RiskBadge';
import { DataRow } from '../components/DataRow';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  RecentPatients: undefined;
};

type RecentPatientsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecentPatients'>;

export function RecentPatientsScreen() {
  const navigation = useNavigation<RecentPatientsScreenNavigationProp>();
  const { recentPatients } = usePatientStore();

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
        <Text style={typography.screenTitle}>RECENT PATIENTS</Text>

        {recentPatients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent patients</Text>
          </View>
        ) : (
          recentPatients.map((patient) => (
            <SectionCard key={patient.id} title={`${patient.id} — ${patient.missionId}`}>
              <RiskBadge level={patient.risk.level} probability={patient.risk.probability} />
              <DataRow
                label="Timestamp"
                value={new Date(patient.timestamp).toISOString().substring(0, 19).replace('T', ' ')}
                isLast={true}
              />
            </SectionCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textDim,
    fontSize: 14,
  },
});
