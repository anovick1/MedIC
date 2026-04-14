import React, { useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { GuidedVoiceBar } from '../components/GuidedVoiceBar';
import { SectionCard } from '../components/SectionCard';
import { useAutoAdvance } from '../hooks/useAutoAdvance';
import { useGuidedVoiceStep } from '../hooks/useGuidedVoiceStep';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = { Home: undefined; MARCH: undefined; MARCH2: undefined };
type NavProp = StackNavigationProp<RootStackParamList, 'MARCH'>;

function MarchOption({ goodLabel, badLabel, selected, onSelect }: {
  goodLabel: string;
  badLabel: string;
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={styles.optionRow}>
      <TouchableOpacity
        style={[styles.optionBtn, selected === goodLabel ? styles.optionGreenActive : styles.optionGreenInactive]}
        onPress={() => onSelect(goodLabel)}
        activeOpacity={0.75}
      >
        <Text style={styles.optionText}>{goodLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.optionBtn, selected === badLabel ? styles.optionRedActive : styles.optionRedInactive]}
        onPress={() => onSelect(badLabel)}
        activeOpacity={0.75}
      >
        <Text style={styles.optionText}>{badLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function MARCHScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    patientId,
    missionId,
    march,
    vitals,
    neuro,
    shootdownRisk,
    voice,
    setMarch,
    saveDraftToStorage,
    setLastPage,
    setVoiceEnabled,
  } = usePatientStore();

  const isComplete = march.hemorrhage !== null && march.airway !== null && march.respiration !== null;
  const handleNext = useCallback(() => navigation.navigate('MARCH2'), [navigation]);

  const { active, countdownMs, cancel } = useAutoAdvance({
    enabled: true,
    isComplete,
    onAdvance: handleNext,
  });

  const { statusText, isSupported, listen } = useGuidedVoiceStep({
    stepId: 'march-1',
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
      (Object.entries(values) as Array<[keyof typeof values, unknown]>).forEach(([key, value]) => {
        if (key === 'hemorrhage' || key === 'airway' || key === 'respiration') {
          setMarch(key, value);
        }
      });
    },
    onCommand: (command) => {
      if (command === 'back') {
        navigation.goBack();
      }
      if (command === 'next' && isComplete) {
        cancel();
        handleNext();
      }
      if (command === 'stop') {
        setVoiceEnabled(false);
      }
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>MARCH CHECK</Text>
        <Text style={styles.subtitle}>Screen 1 of 2 — M · A · R</Text>

        <SectionCard title="M — MASSIVE HEMORRHAGE">
          <MarchOption goodLabel="CONTROLLED" badLabel="UNCONTROLLED"
            selected={march.hemorrhage} onSelect={(value) => setMarch('hemorrhage', value)} />
        </SectionCard>

        <SectionCard title="A — AIRWAY">
          <MarchOption goodLabel="PATENT" badLabel="COMPROMISED"
            selected={march.airway} onSelect={(value) => setMarch('airway', value)} />
        </SectionCard>

        <SectionCard title="R — RESPIRATION">
          <MarchOption goodLabel="NORMAL" badLabel="COMPROMISED"
            selected={march.respiration} onSelect={(value) => setMarch('respiration', value)} />
        </SectionCard>
      </ScrollView>

      <GuidedVoiceBar
        active={voice.enabled}
        supported={isSupported}
        statusText={active && countdownMs != null
          ? `MARCH complete. Auto-advancing in ${(countdownMs / 1000).toFixed(1)} seconds.`
          : statusText || 'Answer by touch or tap the mic for guided capture.'}
        onMicPress={listen}
        onToggleVoice={() => setVoiceEnabled(!voice.enabled)}
      />

      <View style={styles.footer}>
        <View style={styles.btnWrap}>
          <BigButton variant="neutral" label="SAVE DRAFT" size="small"
            onPress={async () => {
              cancel();
              setLastPage(0);
              await saveDraftToStorage();
              navigation.navigate('Home');
            }} />
        </View>
        <View style={styles.btnWrap}>
          <BigButton variant="go" label={active ? 'NEXTING…' : 'NEXT →'} size="small"
            disabled={!isComplete}
            onPress={() => {
              cancel();
              handleNext();
            }} />
        </View>
      </View>
    </View>
  );
}

export const MarchScreen = MARCHScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  backBtn: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md, alignSelf: 'flex-start' },
  backText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.xl, justifyContent: 'center' },
  title: { ...typography.screenTitle, fontSize: 26, textAlign: 'center' },
  subtitle: { ...typography.label, color: colors.textDim, textAlign: 'center', fontSize: 16, marginBottom: 0 },
  optionRow: { flexDirection: 'row', gap: spacing.md },
  optionBtn: { flex: 1, height: sizing.buttonHeight, borderRadius: sizing.borderRadius, justifyContent: 'center', alignItems: 'center' },
  optionGreenActive: { backgroundColor: colors.green, borderWidth: 4, borderColor: colors.white },
  optionGreenInactive: { backgroundColor: colors.green },
  optionRedActive: { backgroundColor: colors.red, borderWidth: 4, borderColor: colors.white },
  optionRedInactive: { backgroundColor: colors.red },
  optionText: { fontSize: 18, fontWeight: '700', color: colors.bg, textTransform: 'uppercase' },
  footer: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  btnWrap: { flex: 1 },
});
