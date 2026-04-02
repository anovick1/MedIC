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

type RootStackParamList = { TriageForm: { page: number }; ReviewData: undefined; ReviewSend: undefined };
type NavProp = StackNavigationProp<RootStackParamList, 'ReviewData'>;

const CONCERNING = ['UNCONTROLLED', 'COMPROMISED', 'UNSTABLE', 'PRESENT'];
const MARCH_LABELS: Record<string, string> = {
  hemorrhage: 'Hemorrhage', airway: 'Airway', respiration: 'Respiration',
  circulation: 'Circulation', hypothermia: 'Hypothermia',
};

export function ReviewDataScreen() {
  const navigation = useNavigation<NavProp>();
  const { vitals, neuro, march } = usePatientStore();

  const gcsTotal = (neuro.gcsEye ?? 0) + (neuro.gcsVerbal ?? 0) + (neuro.gcsMotor ?? 0);
  const bp = vitals.bpSystolic != null && vitals.bpDiastolic != null
    ? `${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg` : '—';
  const hr = vitals.heartRate != null ? `${vitals.heartRate} bpm` : '—';
  const spo2 = vitals.oxygenSaturation != null ? `${vitals.oxygenSaturation}%` : '—';
  const temp = vitals.temperatureC != null ? `${vitals.temperatureC} °C` : '—';
  const flags = Object.entries(march)
    .filter(([_, v]) => CONCERNING.includes(v as string))
    .map(([k, v]) => `${MARCH_LABELS[k] ?? k}: ${v}`)
    .join(', ') || 'None';
  const boolVal = (v: boolean | null) => v === null ? '—' : v ? 'YES' : 'NO';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>REVIEW DATA</Text>

        <SectionCard title="VITALS">
          <DataRow label="GCS" value={`${gcsTotal} (E${neuro.gcsEye ?? '?'} V${neuro.gcsVerbal ?? '?'} M${neuro.gcsMotor ?? '?'})`} />
          <DataRow label="BP" value={bp} />
          <DataRow label="HR" value={hr} />
          <DataRow label="SpO2" value={spo2} />
          <DataRow label="Temp" value={temp} isLast />
        </SectionCard>

        <SectionCard title="SYMPTOMS">
          <DataRow label="Seizure" value={boolVal(neuro.seizure)} />
          <DataRow label="Vomiting" value={boolVal(neuro.vomiting)} />
          <DataRow label="Head Ext. Hemorrhage" value={boolVal(neuro.headExternalHemorrhage)} />
          <DataRow label="Suspected ICP" value={boolVal(neuro.suspectedICP)} isLast />
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
          <BigButton variant="go" label="CONFIRM" size="small" onPress={() => navigation.navigate('ReviewSend')} />
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
