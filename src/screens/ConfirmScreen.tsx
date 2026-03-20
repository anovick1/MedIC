import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { AlertBanner } from '../components/AlertBanner';
import { SectionCard } from '../components/SectionCard';
import { DataRow } from '../components/DataRow';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  Confirm: undefined;
  Home: undefined;
  March: undefined;
};

type ConfirmScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Confirm'>;

export function ConfirmScreen() {
  const navigation = useNavigation<ConfirmScreenNavigationProp>();
  const { patientId, missionId, risk, dronesNeeded } = usePatientStore();

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
        <View style={sharedStyles.contentGap}>
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.successText}>SQUIRT SENT</Text>
        </View>

        <SectionCard title="TRANSMISSION DETAILS">
          <DataRow label="Mission ID" value={missionId || 'Not set'} />
          <DataRow label="Patient ID" value={patientId || 'Not set'} />
          <DataRow label="Risk Level" value={risk.level} />
          <DataRow label="Drones Needed" value={String(dronesNeeded)} />
          <DataRow label="Time" value={new Date().toISOString().substring(11, 19)} isLast={true} />
        </SectionCard>

        <AlertBanner
          type="info"
          message="Queued for next comms window"
        />

        <View style={styles.buttonRow}>
          <BigButton
            label="HOME"
            variant="neutral"
            onPress={() => navigation.navigate('Home')}
          />
          <BigButton
            label="NEW PATIENT"
            variant="go"
            onPress={() => {
              usePatientStore.getState().reset();
              navigation.navigate('March');
            }}
          />
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checkmark: {
    fontSize: 64,
    color: colors.green,
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.green,
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
