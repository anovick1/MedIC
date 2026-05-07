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
import { formatGcsReview } from './TriageFormScreen';

type RootStackParamList = { TriageForm: { page: number }; ReviewData: undefined; Confirm: undefined };
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
    ? `${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg` : '—';
  const hr = vitals.heartRate != null ? `${vitals.heartRate} bpm` : '—';
  const spo2 = vitals.oxygenSaturation != null ? `${vitals.oxygenSaturation}%` : '—';
  const temp = vitals.temperatureC != null ? `${vitals.temperatureC} °C` : '—';
  const flags = Object.entries(march)
    .filter(([_, v]) => CONCERNING.includes(v as string))
    .map(([k, v]) => `${MARCH_LABELS[k] ?? k}: ${v}`)
    .join(', ') || 'None';
  const boolVal = (v: boolean) => v ? 'YES' : 'NO';
  const seizureVal = {
    NONE: 'None',
    ONE: '1',
    MORE_THAN_ONE: 'More than 1',
    STATUS_EPILEPTICUS: 'Status epilepticus',
  }[neuro.seizure];
  const vomitingVal = {
    NONE: '0',
    ONE: '1',
    MULTIPLE: 'Multiple',
    CONTINUOUS: 'Continuous',
  }[neuro.vomiting];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>REVIEW DATA</Text>

        <SectionCard title="VITALS">
          <DataRow label="GCS" value={formatGcsReview(neuro)} />
          <DataRow label="BP" value={bp} />
          <DataRow label="HR" value={hr} />
          <DataRow label="SpO2" value={spo2} />
          <DataRow label="Temp" value={temp} isLast />
        </SectionCard>

        <SectionCard title="SYMPTOMS">
          <DataRow label="Seizure" value={seizureVal} />
          <DataRow label="Vomiting" value={vomitingVal} />
          <DataRow label="Head Ext. Hemorrhage" value={boolVal(neuro.headExternalHemorrhage)} />
          <DataRow label="Suspected ICP elevation" value={boolVal(neuro.suspectedICP)} isLast />
        </SectionCard>

        <SectionCard title="PUPILS">
          <DataRow label="Right pupil" value={neuro.rightPupil} />
          <DataRow label="Left pupil" value={neuro.leftPupil} isLast />
        </SectionCard>

        <SectionCard title="INJURY + MARCH">
          <DataRow label="Location" value={Array.from(neuro.injuryLocation).join(', ') || '—'} />
          <DataRow label="MARCH Flags" value={flags} isLast />
        </SectionCard>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.btnWrap}>
          <BigButton variant="neutral" label="EDIT FORM" size="small" onPress={() => navigation.navigate('TriageForm', { page: 1 })} />
        </View>
        <View style={styles.btnWrap}>
          <BigButton variant="go" label="CONFIRM SEND" size="small" onPress={() => navigation.navigate('Confirm')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  backBtn: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md, alignSelf: 'flex-start' },
  backText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, gap: spacing.xl, justifyContent: 'center', paddingBottom: spacing.lg },
  title: { ...typography.screenTitle, fontSize: 26, textAlign: 'center' },
  footer: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  btnWrap: { flex: 1 },
});
