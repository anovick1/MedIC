import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { dronesNeeded } from '../engine/droneCalc';
import { encodeSquirt } from '../engine/payloadEncoder';
import { ProgressBar } from '../components/ProgressBar';
import { RiskBadge } from '../components/RiskBadge';
import { AlertBanner } from '../components/AlertBanner';
import { SectionCard } from '../components/SectionCard';
import { DataRow } from '../components/DataRow';
import { SegmentSelector } from '../components/SegmentSelector';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  Review: undefined;
  Confirm: undefined;
  TBI: undefined;
};

type ReviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Review'>;

export function ReviewScreen() {
  const navigation = useNavigation<ReviewScreenNavigationProp>();
  const { risk, march, tbi, patientId, missionId, shootdownTier, setShootdown, setDrones } = usePatientStore();
  const [activeTab, setActiveTab] = useState<'clinical' | 'march'>('clinical');

  const drones = dronesNeeded(shootdownTier);
  const kit: Array<{ name: string; weightLbs: number; priority: 'CRITICAL' | 'STANDARD'; drone: 'A' | 'B' }> = [];
  const squirtPayload = encodeSquirt({
    patientId,
    missionId,
    march,
    tbi,
    risk,
    dronesNeeded: drones,
    kit,
  });

  React.useEffect(() => {
    setDrones(drones);
  }, [shootdownTier]);

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
        <ProgressBar total={4} current={3} />

        {risk.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Calculating risk...</Text>
          </View>
        ) : (
          <>
            <RiskBadge level={risk.level} probability={risk.probability} />

            {risk.recommendations.map((rec, i) => (
              <AlertBanner
                key={i}
                type={risk.level === 'CRITICAL' ? 'critical' : risk.level === 'HIGH' ? 'warning' : 'info'}
                message={rec}
              />
            ))}

            {risk.bpAlert && (
              <AlertBanner type="critical" message={risk.bpAlert} />
            )}

            <View style={styles.tabContainer}>
              <View style={styles.tabs}>
                <View
                  style={[styles.tab, activeTab === 'clinical' && styles.tabActive]}
                  onTouchEnd={() => setActiveTab('clinical')}
                >
                  <Text style={[styles.tabText, activeTab === 'clinical' && styles.tabTextActive]}>
                    CLINICAL
                  </Text>
                </View>
                <View
                  style={[styles.tab, activeTab === 'march' && styles.tabActive]}
                  onTouchEnd={() => setActiveTab('march')}
                >
                  <Text style={[styles.tabText, activeTab === 'march' && styles.tabTextActive]}>
                    MARCH
                  </Text>
                </View>
              </View>

              <SectionCard title={activeTab === 'clinical' ? 'TBI ASSESSMENT' : 'MARCH ASSESSMENT'}>
                {activeTab === 'clinical' ? (
                  <>
                    <DataRow label="GCS Eye" value={String(tbi.gcsEye)} />
                    <DataRow label="GCS Verbal" value={String(tbi.gcsVerbal)} />
                    <DataRow label="GCS Motor" value={String(tbi.gcsMotor)} />
                    <DataRow label="GCS Total" value={String(tbi.gcsEye + tbi.gcsVerbal + tbi.gcsMotor)} />
                    <DataRow label="Pupils" value={tbi.pupils || 'Not set'} />
                    <DataRow label="NPi" value={tbi.npi || 'Not set'} />
                    <DataRow label="MOI" value={tbi.moi || 'Not set'} />
                    <DataRow label="Time Since Injury" value={tbi.timeSinceInjury || 'Not set'} />
                    <DataRow label="Progression" value={tbi.neuroProgression || 'Not set'} />
                    <DataRow label="Motor Asymmetry" value={tbi.motorAsymmetry || 'Not set'} />
                    <DataRow
                      label="Symptoms"
                      value={Array.from(tbi.symptoms).join(', ') || 'None'}
                      isLast={true}
                    />
                  </>
                ) : (
                  <>
                    <DataRow label="Hemorrhage" value={march.hemorrhage || 'Not set'} />
                    <DataRow label="Airway" value={march.airway || 'Not set'} />
                    <DataRow label="Respiration" value={march.respiration || 'Not set'} />
                    <DataRow label="Systolic BP" value={`${march.systolicBP} mmHg`} />
                    <DataRow label="Hypothermia" value={march.hypothermia || 'Not set'} />
                    <DataRow label="Other Injuries" value={march.otherInjuries || 'Not set'} isLast={true} />
                  </>
                )}
              </SectionCard>
            </View>

            <SectionCard title="DRONE REQUIREMENTS">
              <SegmentSelector
                options={[
                  { label: 'LOW', value: 'LOW', sublabel: '10% shootdown' },
                  { label: 'MED', value: 'MED', sublabel: '50% shootdown' },
                  { label: 'HIGH', value: 'HIGH', sublabel: '90% shootdown' },
                ]}
                selected={shootdownTier}
                onSelect={(value) => setShootdown(value as 'LOW' | 'MED' | 'HIGH')}
                columns={3}
              />
              <DataRow label="Drones Needed" value={String(drones)} />
              <DataRow label="Kit Items" value={kit.length > 0 ? kit.map(i => i.name).join(', ') : 'None'} isLast={true} />
            </SectionCard>

            <SectionCard title="SQUIRT PAYLOAD">
              <Text style={typography.mono}>{squirtPayload}</Text>
            </SectionCard>

            <View style={styles.buttonRow}>
              <BigButton
                label="EDIT"
                variant="neutral"
                onPress={() => navigation.navigate('TBI')}
              />
              <BigButton
                label="SQUIRT"
                variant="go"
                onPress={() => navigation.navigate('Confirm')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textDim,
    fontSize: 14,
  },
  tabContainer: {
    gap: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDim,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: colors.accent,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
