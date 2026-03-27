import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { SectionCard } from '../components/SectionCard';
import { DataRow } from '../components/DataRow';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  TriageForm: { page: number }; ReviewData: undefined; ReviewSend: undefined;
};
type NavProp = StackNavigationProp<RootStackParamList, 'ReviewData'>;

const CONCERNING = ['UNCONTROLLED', 'COMPROMISED', 'UNSTABLE', 'PRESENT'];
const MARCH_LABELS: Record<string, string> = {
  hemorrhage: 'Hemorrhage', airway: 'Airway', respiration: 'Respiration',
  circulation: 'Circulation', hypothermia: 'Hypothermia',
};

export function ReviewDataScreen() {
  const navigation = useNavigation<NavProp>();
  const { vitals, neuro, march } = usePatientStore();

  const bp = vitals.bpSystolic != null && vitals.bpDiastolic != null
    ? `${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg` : 'Not set';
  const hr = vitals.heartRate != null ? `${vitals.heartRate} bpm` : 'Not set';
  const spo2 = vitals.oxygenSaturation != null ? `${vitals.oxygenSaturation}%` : 'Not set';
  const temp = vitals.temperature != null ? `${vitals.temperature} °F` : 'Not set';
  const flags = Object.entries(march)
    .filter(([_, v]) => CONCERNING.includes(v as string))
    .map(([k, v]) => `${MARCH_LABELS[k] ?? k}: ${v}`)
    .join(', ') || 'None';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>REVIEW DATA</Text>
        <Text style={styles.subtitle}>Review Patient Data</Text>

        <SectionCard title="PATIENT DATA">
          <DataRow label="GCS" value={neuro.gcs?.toString() ?? 'Not set'} />
          <DataRow label="BP" value={bp} />
          <DataRow label="HR" value={hr} />
          <DataRow label="SpO2" value={spo2} />
          <DataRow label="Temp" value={temp} />
          <DataRow label="Consciousness" value={neuro.consciousness ?? 'Not set'} />
          <DataRow label="Location" value={Array.from(neuro.injuryLocation).join(', ') || 'Not set'} />
          <DataRow label="MARCH Flags" value={flags} isLast />
        </SectionCard>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.btnWrap}>
          <BigButton variant="neutral" label="EDIT FORM" size="small" onPress={() => navigation.navigate('TriageForm', { page: 1 })} />
        </View>
        <View style={styles.btnWrap}>
          <BigButton variant="go" label="CONFIRM" size="small" onPress={() => navigation.navigate('ReviewSend')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  backBtn: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    ...typography.screenTitle,
    fontSize: 26,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.label,
    color: colors.textDim,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 0,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  btnWrap: {
    flex: 1,
  },
});
