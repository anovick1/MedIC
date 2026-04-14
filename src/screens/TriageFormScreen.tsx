import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { AlertBanner } from '../components/AlertBanner';
import { GuidedVoiceBar } from '../components/GuidedVoiceBar';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';
import { getTriageStepId } from '../assessment/definitions';
import { useGuidedVoiceStep } from '../hooks/useGuidedVoiceStep';
import { useAutoAdvance } from '../hooks/useAutoAdvance';

type RootStackParamList = {
  MARCH2: undefined;
  TriageForm: { page: number };
  ReviewData: undefined;
  Home: undefined;
};
type NavProp = StackNavigationProp<RootStackParamList, 'TriageForm'>;
type RoutePropType = RouteProp<RootStackParamList, 'TriageForm'>;

const TOTAL_PAGES = 8;

const GCS_EYE = [
  { v: 4, label: '4', color: colors.green },
  { v: 3, label: '3', color: colors.yellow },
  { v: 2, label: '2', color: colors.orange },
  { v: 1, label: '1', color: colors.red },
];
const GCS_VERBAL = [
  { v: 5, label: '5', color: colors.green },
  { v: 4, label: '4', color: colors.yellow },
  { v: 3, label: '3', color: colors.yellow },
  { v: 2, label: '2', color: colors.orange },
  { v: 1, label: '1', color: colors.red },
];
const GCS_MOTOR = [
  { v: 6, label: '6', color: colors.green },
  { v: 5, label: '5', color: colors.green },
  { v: 4, label: '4', color: colors.yellow },
  { v: 3, label: '3', color: colors.orange },
  { v: 2, label: '2', color: colors.red },
  { v: 1, label: '1', color: colors.red },
];

function GCSPage({ title, options, selected, onSelect }: {
  title: string;
  options: Array<{ v: number; label: string; color: string }>;
  selected: number | null;
  onSelect: (v: number) => void;
}) {
  return (
    <>
      <Text style={styles.pageTitle}>{title}</Text>
      <View style={styles.gcsOptions}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.v}
            style={[styles.gcsOption, { backgroundColor: opt.color }, selected === opt.v && styles.gcsSelected]}
            onPress={() => onSelect(opt.v)}
            activeOpacity={0.75}
          >
            <Text style={styles.gcsText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

function SymptomRow({ label, value, onSelect }: {
  label: string;
  value: boolean | null;
  onSelect: (v: boolean) => void;
}) {
  return (
    <View style={styles.symptomRow}>
      <Text style={styles.symptomLabel}>{label}</Text>
      <View style={styles.symptomBtns}>
        <TouchableOpacity
          style={[styles.symptomBtn, value === true ? styles.symYesOn : styles.symYesOff]}
          onPress={() => onSelect(true)}
          activeOpacity={0.75}
        >
          <Text style={styles.symptomBtnText}>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.symptomBtn, value === false ? styles.symNoOn : styles.symNoOff]}
          onPress={() => onSelect(false)}
          activeOpacity={0.75}
        >
          <Text style={styles.symptomBtnText}>NO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function TriageFormScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const [currentPage, setCurrentPage] = useState(route.params?.page ?? 1);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [tempText, setTempText] = useState('');

  const {
    patientId,
    missionId,
    march,
    vitals,
    neuro,
    shootdownRisk,
    voice,
    setVitals,
    setNeuro,
    toggleInjuryLocation,
    setShootdownRisk,
    saveDraftToStorage,
    setLastPage,
    setVoiceEnabled,
  } = usePatientStore();

  useEffect(() => {
    if (route.params?.page && route.params.page !== currentPage) {
      setCurrentPage(route.params.page);
    }
  }, [currentPage, route.params?.page]);

  useEffect(() => {
    setLastPage(currentPage);
  }, [currentPage, setLastPage]);

  const gcsTotal = (neuro.gcsEye ?? 0) + (neuro.gcsVerbal ?? 0) + (neuro.gcsMotor ?? 0);
  const currentStepId = useMemo(() => getTriageStepId(currentPage), [currentPage]);

  const isPageComplete = useCallback((): boolean => {
    switch (currentPage) {
      case 1:
        return vitals.bpSystolic !== null && vitals.bpDiastolic !== null && vitals.heartRate !== null;
      case 2:
        return vitals.oxygenSaturation !== null && vitals.temperatureC !== null;
      case 3:
        return neuro.gcsEye !== null;
      case 4:
        return neuro.gcsVerbal !== null;
      case 5:
        return neuro.gcsMotor !== null;
      case 6:
        return neuro.seizure !== null && neuro.vomiting !== null &&
          neuro.headExternalHemorrhage !== null && neuro.suspectedICP !== null;
      case 7:
        return neuro.injuryLocation.size > 0;
      case 8:
        return shootdownRisk !== null;
      default:
        return true;
    }
  }, [currentPage, vitals, neuro, shootdownRisk]);

  const handleSaveDraft = useCallback(async () => {
    setLastPage(currentPage);
    await saveDraftToStorage();
    setShowDraftBanner(true);
    setTimeout(() => setShowDraftBanner(false), 2000);
  }, [currentPage, saveDraftToStorage, setLastPage]);

  const handleBack = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      navigation.goBack();
    }
  }, [currentPage, navigation]);

  const handleNext = useCallback(() => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.navigate('ReviewData');
    }
  }, [currentPage, navigation]);

  const { active, countdownMs, cancel } = useAutoAdvance({
    enabled: true,
    isComplete: isPageComplete(),
    onAdvance: handleNext,
    resetKey: currentPage,
  });

  const { statusText, isSupported, listen } = useGuidedVoiceStep({
    stepId: currentStepId,
    enabled: voice.enabled,
    snapshot: {
      patientId,
      missionId,
      march,
      vitals,
      neuro,
      shootdownRisk,
    },
    applyValues: (values) => {
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'bpSystolic' || key === 'bpDiastolic' || key === 'heartRate' || key === 'oxygenSaturation' || key === 'temperatureC') {
          setVitals(key, value);
          return;
        }
        if (key === 'shootdownRisk') {
          setShootdownRisk(value as 0 | 10 | 25 | 50 | 75 | 90);
          return;
        }
        if (key === 'injuryLocation' && value instanceof Set) {
          setNeuro('injuryLocation', value);
          return;
        }
        if (
          key === 'gcsEye' || key === 'gcsVerbal' || key === 'gcsMotor' ||
          key === 'seizure' || key === 'vomiting' || key === 'headExternalHemorrhage' ||
          key === 'suspectedICP' || key === 'notes'
        ) {
          setNeuro(key, value);
        }
      });
    },
    onCommand: (command) => {
      if (command === 'back') {
        cancel();
        handleBack();
      }
      if (command === 'next' && isPageComplete()) {
        cancel();
        handleNext();
      }
      if (command === 'stop') {
        setVoiceEnabled(false);
      }
    },
  });

  const nextLabel = currentPage === TOTAL_PAGES ? 'REVIEW →' : 'NEXT →';

  const locBtn = (label: string, value: 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'TOP') => {
    const sel = neuro.injuryLocation.has(value);
    return (
      <TouchableOpacity key={value}
        style={[styles.locationBtn, sel ? styles.locSelected : styles.locUnselected]}
        onPress={() => toggleInjuryLocation(value)}
        activeOpacity={0.75}>
        <Text style={[typography.segmentLabel, sel ? styles.locTextOn : styles.locTextOff]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <>
            <View>
              <Text style={typography.label}>BLOOD PRESSURE:</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  value={vitals.bpSystolic?.toString() ?? ''}
                  onChangeText={(text) => {
                    const n = parseInt(text, 10);
                    setVitals('bpSystolic', Number.isNaN(n) ? null : n);
                  }}
                  keyboardType="numeric"
                  placeholder="SYS"
                  placeholderTextColor={colors.textDim}
                />
                <Text style={styles.unit}>/</Text>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  value={vitals.bpDiastolic?.toString() ?? ''}
                  onChangeText={(text) => {
                    const n = parseInt(text, 10);
                    setVitals('bpDiastolic', Number.isNaN(n) ? null : n);
                  }}
                  keyboardType="numeric"
                  placeholder="DIA"
                  placeholderTextColor={colors.textDim}
                />
                <Text style={styles.unit}>mmHg</Text>
              </View>
            </View>
            <View>
              <Text style={typography.label}>HEART RATE:</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  value={vitals.heartRate?.toString() ?? ''}
                  onChangeText={(text) => {
                    const n = parseInt(text, 10);
                    setVitals('heartRate', Number.isNaN(n) ? null : n);
                  }}
                  keyboardType="numeric"
                  placeholder="BPM"
                  placeholderTextColor={colors.textDim}
                />
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
                <TextInput
                  style={[styles.input, styles.flex1]}
                  value={vitals.oxygenSaturation?.toString() ?? ''}
                  onChangeText={(text) => {
                    const n = parseInt(text, 10);
                    setVitals('oxygenSaturation', Number.isNaN(n) ? null : n);
                  }}
                  keyboardType="numeric"
                  placeholder="SpO2"
                  placeholderTextColor={colors.textDim}
                />
                <Text style={styles.unit}>%</Text>
              </View>
            </View>
            <View>
              <Text style={typography.label}>TEMPERATURE:</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  value={tempText !== '' ? tempText : vitals.temperatureC?.toString() ?? ''}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                    setTempText(filtered);
                    const n = parseFloat(filtered);
                    if (!Number.isNaN(n)) {
                      setVitals('temperatureC', n);
                    } else if (filtered === '') {
                      setVitals('temperatureC', null);
                    }
                  }}
                  onBlur={() => setTempText('')}
                  keyboardType="decimal-pad"
                  placeholder="Temp"
                  placeholderTextColor={colors.textDim}
                />
                <Text style={styles.unit}>°C</Text>
              </View>
            </View>
          </>
        );
      case 3:
        return <GCSPage title="GCS: EYE OPENING" options={GCS_EYE} selected={neuro.gcsEye} onSelect={(value) => setNeuro('gcsEye', value)} />;
      case 4:
        return <GCSPage title="GCS: VERBAL RESPONSE" options={GCS_VERBAL} selected={neuro.gcsVerbal} onSelect={(value) => setNeuro('gcsVerbal', value)} />;
      case 5:
        return <GCSPage title="GCS: MOTOR RESPONSE" options={GCS_MOTOR} selected={neuro.gcsMotor} onSelect={(value) => setNeuro('gcsMotor', value)} />;
      case 6:
        return (
          <>
            <Text style={styles.pageTitle}>SYMPTOMS</Text>
            <SymptomRow label="Seizure" value={neuro.seizure} onSelect={(value) => setNeuro('seizure', value)} />
            <SymptomRow label="Vomiting" value={neuro.vomiting} onSelect={(value) => setNeuro('vomiting', value)} />
            <SymptomRow label="Head External Hemorrhage" value={neuro.headExternalHemorrhage} onSelect={(value) => setNeuro('headExternalHemorrhage', value)} />
            <SymptomRow label="Suspected ICP" value={neuro.suspectedICP} onSelect={(value) => setNeuro('suspectedICP', value)} />
          </>
        );
      case 7:
        return (
          <>
            <Text style={styles.pageTitle}>INJURY LOCATION</Text>
            <View style={styles.locGrid}>
              <View style={styles.locRow}>{locBtn('FRONT', 'FRONT')}{locBtn('BACK', 'BACK')}</View>
              <View style={styles.locRow}>{locBtn('LEFT', 'LEFT')}{locBtn('RIGHT', 'RIGHT')}</View>
              <View style={styles.locCenter}>{locBtn('TOP', 'TOP')}</View>
            </View>
            <Text style={typography.label}>NOTES:</Text>
            <TextInput
              style={styles.notesInput}
              value={neuro.notes}
              onChangeText={(text) => setNeuro('notes', text)}
              multiline
              placeholder="Additional notes..."
              placeholderTextColor={colors.textDim}
            />
          </>
        );
      case 8: {
        const values: Array<0 | 10 | 25 | 50 | 75 | 90> = [0, 10, 25, 50, 75, 90];
        const riskColor = (value: number) => value <= 10 ? styles.bgGreen : value <= 50 ? styles.bgYellow : styles.bgRed;
        return (
          <>
            <Text style={styles.pageTitle}>DRONE SHOOTDOWN RISK</Text>
            <View style={styles.riskGrid}>
              {values.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.riskBtn, riskColor(value), shootdownRisk === value && styles.selectedBorder]}
                  onPress={() => setShootdownRisk(value)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.riskBtnText}>{value}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <View style={sharedStyles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TRIAGE FORM</Text>
        <Text style={styles.headerPage}>{currentPage}/{TOTAL_PAGES}</Text>
      </View>

      {currentPage >= 3 && currentPage <= 5 && (
        <View style={styles.gcsTotalBar}>
          <Text style={styles.gcsTotalText}>GCS Total: {gcsTotal}</Text>
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

      <GuidedVoiceBar
        active={voice.enabled}
        supported={isSupported}
        statusText={active && countdownMs != null
          ? `Page complete. Auto-advancing in ${(countdownMs / 1000).toFixed(1)} seconds.`
          : statusText || 'Guided voice can fill the current missing field while touch input stays available.'}
        onMicPress={listen}
        onToggleVoice={() => setVoiceEnabled(!voice.enabled)}
      />

      <View style={styles.footer}>
        <View style={styles.footerBtn}>
          <BigButton variant="neutral" label="SAVE DRAFT" size="small" onPress={async () => {
            cancel();
            await handleSaveDraft();
          }} />
        </View>
        <View style={styles.footerBtn}>
          <BigButton
            variant="go"
            label={active ? 'NEXTING…' : nextLabel}
            size="small"
            disabled={!isPageComplete()}
            onPress={() => {
              cancel();
              handleNext();
            }}
          />
        </View>
      </View>

      <Text style={styles.watermark}>{patientId} {missionId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, gap: spacing.xxl, justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md },
  backBtn: { paddingVertical: spacing.xs },
  backText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: 1, textTransform: 'uppercase' },
  headerPage: { fontSize: 20, fontWeight: '700', color: colors.textDim },
  gcsTotalBar: { alignItems: 'center', paddingBottom: spacing.sm },
  gcsTotalText: { fontSize: 24, fontWeight: '900', color: colors.accent },
  footer: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  footerBtn: { flex: 1 },
  bannerWrapper: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  watermark: { position: 'absolute', bottom: spacing.xs, right: spacing.sm, fontSize: 11, fontFamily: 'monospace', color: colors.textDim },
  pageTitle: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  input: { height: sizing.buttonHeight, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: sizing.borderRadius, color: colors.text, paddingHorizontal: spacing.lg, fontSize: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex1: { flex: 1 },
  unit: { fontSize: 22, fontWeight: '600', color: colors.textDim },
  gcsOptions: { gap: spacing.md },
  gcsOption: { height: sizing.buttonHeight, borderRadius: sizing.borderRadius, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
  gcsSelected: { borderColor: colors.white },
  gcsText: { fontSize: 20, fontWeight: '700', color: colors.bg },
  symptomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  symptomLabel: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.text },
  symptomBtns: { flexDirection: 'row', gap: spacing.sm },
  symptomBtn: { width: 80, height: sizing.buttonHeightSm, borderRadius: sizing.borderRadius, justifyContent: 'center', alignItems: 'center' },
  symYesOn: { backgroundColor: colors.green, borderWidth: 4, borderColor: colors.white },
  symYesOff: { backgroundColor: colors.green },
  symNoOn: { backgroundColor: colors.red, borderWidth: 4, borderColor: colors.white },
  symNoOff: { backgroundColor: colors.red },
  symptomBtnText: { fontSize: 15, fontWeight: '700', color: colors.bg },
  notesInput: { minHeight: 140, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: sizing.borderRadius, color: colors.text, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, fontSize: 18, textAlignVertical: 'top' },
  locGrid: { gap: spacing.md },
  locRow: { flexDirection: 'row', gap: spacing.md },
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
