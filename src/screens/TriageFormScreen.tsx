import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { AlertBanner } from '../components/AlertBanner';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';
import { GcsValue, NeuroData, PupilReactivity, SeizureStatus, VomitingStatus } from '../types';

type RootStackParamList = {
  MARCH2: undefined; TriageForm: { page: number }; ReviewData: undefined; Home: undefined;
};
type NavProp = StackNavigationProp<RootStackParamList, 'TriageForm'>;
type RoutePropType = RouteProp<RootStackParamList, 'TriageForm'>;

const TOTAL_PAGES = 9;

/* ── GCS option data ─────────────────────────────────────────── */

type GcsOption = {
  v: GcsValue;
  label: string;
  description: string;
  color: string;
  textColor?: string;
  descriptionColor?: string;
};

const GCS_EYE: GcsOption[] = [
  { v: 4, label: '4 - Spontaneous', description: 'Eyes open on their own', color: colors.green },
  { v: 3, label: '3 - To voice', description: 'Opens eyes when spoken to', color: colors.yellow },
  { v: 2, label: '2 - To pain', description: 'Opens eyes only to painful stimulus', color: colors.orange },
  { v: 1, label: '1 - None', description: 'No eye opening', color: colors.red },
  { v: 'UNTESTABLE', label: 'Untestable', description: 'Swelling, chemical paralysis, or other barrier', color: colors.accentDim, textColor: colors.text, descriptionColor: colors.text },
];
const GCS_VERBAL: GcsOption[] = [
  { v: 5, label: '5 - Oriented', description: 'Appropriate, oriented speech', color: colors.green },
  { v: 4, label: '4 - Confused', description: 'Conversation present but confused', color: colors.yellow },
  { v: 3, label: '3 - Words', description: 'Inappropriate words', color: colors.yellow },
  { v: 2, label: '2 - Sounds', description: 'Incomprehensible sounds', color: colors.orange },
  { v: 1, label: '1 - None', description: 'No verbal response', color: colors.red },
  { v: 'UNTESTABLE', label: 'Untestable', description: 'Intubated, chemically paralyzed, or unable to test', color: colors.accentDim, textColor: colors.text, descriptionColor: colors.text },
];
const GCS_MOTOR: GcsOption[] = [
  { v: 6, label: '6 - Obeys commands', description: 'Follows commands', color: colors.green },
  { v: 5, label: '5 - Localizes pain', description: 'Purposeful movement toward pain', color: colors.green },
  { v: 4, label: '4 - Withdraws', description: 'Pulls away from pain', color: colors.yellow },
  { v: 3, label: '3 - Flexion', description: 'Abnormal flexion to pain', color: colors.orange },
  { v: 2, label: '2 - Extension', description: 'Abnormal extension to pain', color: colors.red },
  { v: 1, label: '1 - None', description: 'No motor response', color: colors.red },
  { v: 'UNTESTABLE', label: 'Untestable', description: 'Chemical paralysis or other barrier', color: colors.accentDim, textColor: colors.text, descriptionColor: colors.text },
];

function GCSPage({ title, options, selected, onSelect }: {
  title: string;
  options: GcsOption[];
  selected: GcsValue | null;
  onSelect: (v: GcsValue) => void;
}) {
  return (
    <>
      <Text style={styles.pageTitle}>{title}</Text>
      <View style={styles.gcsOptions}>
        {options.map((opt) => (
          <TouchableOpacity
            key={String(opt.v)}
            style={[styles.gcsOption, { backgroundColor: opt.color }, selected === opt.v && styles.gcsSelected]}
            onPress={() => onSelect(opt.v)} activeOpacity={0.75}
          >
            <Text style={[styles.gcsText, opt.textColor ? { color: opt.textColor } : undefined]}>
              {opt.label}
            </Text>
            <Text style={[styles.gcsDescription, opt.descriptionColor ? { color: opt.descriptionColor } : undefined]}>
              {opt.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

/* ── Option rows ──────────────────────────────────────────────── */

function ChoiceRow<T extends string | boolean>({ label, value, options, onSelect }: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; color: string }>;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.choiceLabel}>{label}</Text>
      <View style={styles.choiceBtns}>
        {options.map((opt) => (
          <TouchableOpacity
            key={String(opt.value)}
            style={[
              styles.choiceBtn,
              { backgroundColor: opt.color },
              value === opt.value && styles.choiceSelected,
            ]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.75}
          >
            <Text style={styles.choiceBtnText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function PupilRow({ label, value, onSelect }: {
  label: string; value: PupilReactivity; onSelect: (v: PupilReactivity) => void;
}) {
  return (
    <ChoiceRow
      label={label}
      value={value}
      onSelect={onSelect}
      options={[
        { value: 'NORMAL', label: 'Normal', color: colors.green },
        { value: 'SLUGGISH', label: 'Sluggish', color: colors.orange },
        { value: 'UNREACTIVE', label: 'Unreactive', color: colors.red },
      ]}
    />
  );
}

function BinaryRow({ label, value, onSelect }: {
  label: string; value: boolean; onSelect: (v: boolean) => void;
}) {
  return (
    <ChoiceRow
      label={label}
      value={value}
      onSelect={onSelect}
      options={[
        { value: false, label: 'No', color: colors.green },
        { value: true, label: 'Yes', color: colors.red },
      ]}
    />
  );
}

function SeizureRow({ value, onSelect }: {
  value: SeizureStatus; onSelect: (v: SeizureStatus) => void;
}) {
  return (
    <ChoiceRow
      label="Seizure"
      value={value}
      onSelect={onSelect}
      options={[
        { value: 'NONE', label: 'None', color: colors.green },
        { value: 'ONE', label: '1', color: colors.yellow },
        { value: 'MORE_THAN_ONE', label: '>1', color: colors.orange },
        { value: 'STATUS_EPILEPTICUS', label: 'Status epilepticus', color: colors.red },
      ]}
    />
  );
}

function VomitingRow({ value, onSelect }: {
  value: VomitingStatus; onSelect: (v: VomitingStatus) => void;
}) {
  return (
    <ChoiceRow
      label="Vomiting"
      value={value}
      onSelect={onSelect}
      options={[
        { value: 'NONE', label: '0', color: colors.green },
        { value: 'ONE', label: '1', color: colors.yellow },
        { value: 'MULTIPLE', label: 'Multiple', color: colors.orange },
        { value: 'CONTINUOUS', label: 'Continuous', color: colors.red },
      ]}
    />
  );
}

function gcsNumber(value: GcsValue | null): number | null {
  return typeof value === 'number' ? value : null;
}

function calculateGcs(neuro: Pick<NeuroData, 'gcsEye' | 'gcsVerbal' | 'gcsMotor'>): number | null {
  const eye = gcsNumber(neuro.gcsEye);
  const verbal = gcsNumber(neuro.gcsVerbal);
  const motor = gcsNumber(neuro.gcsMotor);
  return eye != null && verbal != null && motor != null ? eye + verbal + motor : null;
}

function formatGcsPart(value: GcsValue | null): string {
  if (value === 'UNTESTABLE') return 'UT';
  return value != null ? String(value) : '?';
}

function formatGcsTotal(neuro: Pick<NeuroData, 'gcsEye' | 'gcsVerbal' | 'gcsMotor'>): string {
  const total = calculateGcs(neuro);
  if (total != null) return String(total);
  if ([neuro.gcsEye, neuro.gcsVerbal, neuro.gcsMotor].includes('UNTESTABLE')) return 'Untestable';
  return 'Incomplete';
}

function formatGcsReview(neuro: Pick<NeuroData, 'gcsEye' | 'gcsVerbal' | 'gcsMotor'>): string {
  return `${formatGcsTotal(neuro)} (E${formatGcsPart(neuro.gcsEye)} V${formatGcsPart(neuro.gcsVerbal)} M${formatGcsPart(neuro.gcsMotor)})`;
}

export { calculateGcs, formatGcsReview, formatGcsTotal };

/* ── Main screen ─────────────────────────────────────────────── */

export function TriageFormScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const [currentPage, setCurrentPage] = useState(route.params?.page ?? 1);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [tempText, setTempText] = useState('');

  const {
    patientId, missionId, vitals, neuro, shootdownRisk,
    setVitals, setNeuro, toggleInjuryLocation, setShootdownRisk,
    saveDraftToStorage, setLastPage,
  } = usePatientStore();

  React.useEffect(() => { setLastPage(currentPage); }, [currentPage, setLastPage]);

  /* ── Validation ─────────────────────────────────────────────── */

  const isPageComplete = useCallback((): boolean => {
    switch (currentPage) {
      case 1: return vitals.bpSystolic !== null && vitals.bpDiastolic !== null && vitals.heartRate !== null;
      case 2: return vitals.oxygenSaturation !== null && vitals.temperatureC !== null;
      case 3: return neuro.gcsEye !== null;
      case 4: return neuro.gcsVerbal !== null;
      case 5: return neuro.gcsMotor !== null;
      case 6: return true;
      case 7: return true;
      case 8: return neuro.injuryLocation.size > 0;
      case 9: return shootdownRisk !== null;
      default: return true;
    }
  }, [currentPage, vitals, neuro, shootdownRisk]);

  /* ── Handlers ───────────────────────────────────────────────── */

  const handleSaveDraft = useCallback(async () => {
    setLastPage(currentPage);
    await saveDraftToStorage();
    setShowDraftBanner(true);
    setTimeout(() => setShowDraftBanner(false), 2000);
  }, [currentPage, saveDraftToStorage, setLastPage]);

  const handleBack = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
    else navigation.goBack();
  }, [currentPage, navigation]);

  const handleNext = useCallback(() => {
    if (currentPage < TOTAL_PAGES) setCurrentPage(currentPage + 1);
    else navigation.navigate('ReviewData');
  }, [currentPage, navigation]);

  const nextLabel = currentPage === TOTAL_PAGES ? 'SEND SQUIRT' : 'NEXT →';

  const handleGcsSelect = useCallback((field: 'gcsEye' | 'gcsVerbal' | 'gcsMotor', value: GcsValue) => {
    const nextNeuro = { ...neuro, [field]: value };
    setNeuro(field, value);
    setNeuro('gcs', calculateGcs(nextNeuro));
  }, [neuro, setNeuro]);

  /* ── Location helper ────────────────────────────────────────── */

  const locBtn = (label: string, value: 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'TOP') => {
    const sel = neuro.injuryLocation.has(value);
    return (
      <TouchableOpacity key={value}
        style={[styles.locationBtn, sel ? styles.locSelected : styles.locUnselected]}
        onPress={() => toggleInjuryLocation(value)} activeOpacity={0.75}>
        <Text style={[typography.segmentLabel, sel ? styles.locTextOn : styles.locTextOff]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  /* ── Pages ──────────────────────────────────────────────────── */

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <>
            <View>
              <Text style={typography.label}>BLOOD PRESSURE:</Text>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.flex1]} value={vitals.bpSystolic?.toString() ?? ''}
                  onChangeText={(t) => { const n = parseInt(t, 10); setVitals('bpSystolic', isNaN(n) ? null : n); }}
                  keyboardType="numeric" returnKeyType="next" placeholder="SYS" placeholderTextColor={colors.textDim} />
                <Text style={styles.unit}>/</Text>
                <TextInput style={[styles.input, styles.flex1]} value={vitals.bpDiastolic?.toString() ?? ''}
                  onChangeText={(t) => { const n = parseInt(t, 10); setVitals('bpDiastolic', isNaN(n) ? null : n); }}
                  keyboardType="numeric" returnKeyType="next" placeholder="DIA" placeholderTextColor={colors.textDim} />
                <Text style={styles.unit}>mmHg</Text>
              </View>
            </View>
            <View>
              <Text style={typography.label}>HEART RATE:</Text>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.flex1]} value={vitals.heartRate?.toString() ?? ''}
                  onChangeText={(t) => { const n = parseInt(t, 10); setVitals('heartRate', isNaN(n) ? null : n); }}
                  keyboardType="numeric" returnKeyType="done" placeholder="BPM" placeholderTextColor={colors.textDim} />
                <Text style={styles.unit}>bpm</Text>
              </View>
            </View>
          </>
        );

      case 2:
        return (
          <>
            <View>
              <Text style={typography.label}>OXYGEN SATURATION:</Text>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.flex1]} value={vitals.oxygenSaturation?.toString() ?? ''}
                  onChangeText={(t) => { const n = parseInt(t, 10); setVitals('oxygenSaturation', isNaN(n) ? null : n); }}
                  keyboardType="numeric" returnKeyType="next" placeholder="SpO2" placeholderTextColor={colors.textDim} />
                <Text style={styles.unit}>%</Text>
              </View>
            </View>
            <View>
              <Text style={typography.label}>TEMPERATURE:</Text>
              <View style={styles.row}>
                <TextInput style={[styles.input, styles.flex1]}
                  value={tempText !== '' ? tempText : vitals.temperatureC?.toString() ?? ''}
                  onChangeText={(t) => {
                    const f = t.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                    setTempText(f);
                    const n = parseFloat(f);
                    if (!isNaN(n)) setVitals('temperatureC', n);
                    else if (f === '') setVitals('temperatureC', null);
                  }}
                  onBlur={() => setTempText('')}
                  keyboardType="decimal-pad" returnKeyType="done" placeholder="Temp" placeholderTextColor={colors.textDim} />
                <Text style={styles.unit}>°C</Text>
              </View>
            </View>
          </>
        );

      case 3:
        return <GCSPage title="GCS: EYE OPENING" options={GCS_EYE} selected={neuro.gcsEye} onSelect={(v) => handleGcsSelect('gcsEye', v)} />;

      case 4:
        return <GCSPage title="GCS: VERBAL RESPONSE" options={GCS_VERBAL} selected={neuro.gcsVerbal} onSelect={(v) => handleGcsSelect('gcsVerbal', v)} />;

      case 5:
        return <GCSPage title="GCS: MOTOR RESPONSE" options={GCS_MOTOR} selected={neuro.gcsMotor} onSelect={(v) => handleGcsSelect('gcsMotor', v)} />;

      case 6:
        return (
          <>
            <Text style={styles.pageTitle}>SYMPTOMS</Text>
            <SeizureRow value={neuro.seizure} onSelect={(v) => setNeuro('seizure', v)} />
            <VomitingRow value={neuro.vomiting} onSelect={(v) => setNeuro('vomiting', v)} />
            <BinaryRow label="Head External Hemorrhage" value={neuro.headExternalHemorrhage} onSelect={(v) => setNeuro('headExternalHemorrhage', v)} />
            <BinaryRow label="Suspected ICP elevation" value={neuro.suspectedICP} onSelect={(v) => setNeuro('suspectedICP', v)} />
          </>
        );

      case 7:
        return (
          <>
            <Text style={styles.pageTitle}>PUPIL REACTIVITY</Text>
            <PupilRow label="Right pupil" value={neuro.rightPupil} onSelect={(v) => setNeuro('rightPupil', v)} />
            <PupilRow label="Left pupil" value={neuro.leftPupil} onSelect={(v) => setNeuro('leftPupil', v)} />
          </>
        );

      case 8:
        return (
          <>
            <Text style={styles.pageTitle}>INJURY LOCATION</Text>
            <View style={styles.locGrid}>
              <View style={styles.locRow}>{locBtn('FRONT', 'FRONT')}{locBtn('BACK', 'BACK')}</View>
              <View style={styles.locRow}>{locBtn('LEFT', 'LEFT')}{locBtn('RIGHT', 'RIGHT')}</View>
              <View style={styles.locCenter}>{locBtn('TOP', 'TOP')}</View>
            </View>
            <Text style={typography.label}>NOTES:</Text>
            <TextInput style={styles.notesInput} value={neuro.notes}
              onChangeText={(t) => setNeuro('notes', t)}
              multiline placeholder="Additional notes..." placeholderTextColor={colors.textDim} returnKeyType="default" />
          </>
        );

      case 9: {
        const VALS: Array<0 | 10 | 25 | 50 | 75 | 90> = [0, 10, 25, 50, 75, 90];
        const rc = (v: number) => v <= 10 ? styles.bgGreen : v <= 50 ? styles.bgYellow : styles.bgRed;
        return (
          <>
            <Text style={styles.pageTitle}>DRONE SHOOTDOWN RISK</Text>
            <View style={styles.riskGrid}>
              {VALS.map((v) => (
                <TouchableOpacity key={v}
                  style={[styles.riskBtn, rc(v), shootdownRisk === v && styles.selectedBorder]}
                  onPress={() => setShootdownRisk(v)} activeOpacity={0.75}>
                  <Text style={styles.riskBtnText}>{v}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      }

      default: return null;
    }
  };

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <KeyboardAvoidingView
      style={sharedStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TRIAGE FORM</Text>
        <Text style={styles.headerPage}>{currentPage}/{TOTAL_PAGES}</Text>
      </View>

      {currentPage >= 3 && currentPage <= 5 && (
        <View style={styles.gcsTotalBar}>
          <Text style={styles.gcsTotalText}>GCS Total: {formatGcsTotal(neuro)}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.pageContent} keyboardShouldPersistTaps="handled">
        {renderPage()}
      </ScrollView>

      {showDraftBanner && (
        <View style={styles.bannerWrapper}>
          <AlertBanner type="info" message="Draft saved" />
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.footerBtn}>
          <BigButton variant="neutral" label="SAVE DRAFT" size="small" onPress={handleSaveDraft} />
        </View>
        <View style={styles.footerBtn}>
          <BigButton variant="go" label={nextLabel} size="small"
            disabled={!isPageComplete()} onPress={handleNext} />
        </View>
      </View>

      <Text style={styles.watermark}>{patientId} {missionId}</Text>
    </KeyboardAvoidingView>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  pageContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, gap: spacing.xxxl, justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md },
  backBtn: { paddingVertical: spacing.xs },
  backText: { fontSize: 18, fontWeight: '600', color: colors.accent },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: 1, textTransform: 'uppercase' },
  headerPage: { fontSize: 22, fontWeight: '700', color: colors.textDim },
  gcsTotalBar: { alignItems: 'center', paddingBottom: spacing.sm },
  gcsTotalText: { fontSize: 28, fontWeight: '900', color: colors.accent },
  footer: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  footerBtn: { flex: 1 },
  bannerWrapper: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  watermark: { position: 'absolute', bottom: spacing.xs, right: spacing.sm, fontSize: 11, fontFamily: 'monospace', color: colors.textDim },
  pageTitle: { fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  input: { height: sizing.buttonHeight, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: sizing.borderRadius, color: colors.text, paddingHorizontal: spacing.lg, fontSize: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex1: { flex: 1 },
  unit: { fontSize: 22, fontWeight: '600', color: colors.textDim },
  gcsOptions: { gap: spacing.lg },
  gcsOption: { minHeight: sizing.buttonHeight, borderRadius: sizing.borderRadius, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'transparent', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  gcsSelected: { borderColor: colors.white },
  gcsText: { fontSize: 22, fontWeight: '800', color: colors.bg, textAlign: 'center' },
  gcsDescription: { fontSize: 15, fontWeight: '600', color: colors.bg, opacity: 0.82, textAlign: 'center', marginTop: spacing.xs },
  choiceGroup: { gap: spacing.sm },
  choiceLabel: { fontSize: 22, fontWeight: '700', color: colors.text },
  choiceBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  choiceBtn: { flexGrow: 1, flexBasis: '45%', minHeight: sizing.buttonHeightSm, borderRadius: sizing.borderRadius, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.sm, borderWidth: 3, borderColor: 'transparent' },
  choiceSelected: { borderColor: colors.white },
  choiceBtnText: { fontSize: 18, fontWeight: '800', color: colors.bg, textAlign: 'center' },
  notesInput: { minHeight: 160, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: sizing.borderRadius, color: colors.text, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, fontSize: 20, textAlignVertical: 'top' },
  locGrid: { gap: spacing.lg },
  locRow: { flexDirection: 'row', gap: spacing.lg },
  locCenter: { flexDirection: 'row', justifyContent: 'center' },
  locationBtn: { flex: 1, height: sizing.buttonHeight, borderRadius: sizing.borderRadius, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  locSelected: { backgroundColor: colors.accent, borderColor: colors.white, borderWidth: 3 },
  locUnselected: { backgroundColor: colors.surface2, borderColor: colors.border, borderWidth: 2 },
  locTextOn: { color: colors.bg, fontWeight: '700' },
  locTextOff: { color: colors.textDim },
  riskGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  riskBtn: { flexGrow: 1, flexBasis: '45%', height: sizing.buttonHeight, borderRadius: sizing.borderRadius, justifyContent: 'center', alignItems: 'center' },
  riskBtnText: { fontSize: 28, fontWeight: '700', color: colors.bg },
  bgGreen: { backgroundColor: colors.green },
  bgYellow: { backgroundColor: colors.yellow },
  bgRed: { backgroundColor: colors.red },
  selectedBorder: { borderWidth: 3, borderColor: colors.white },
});
