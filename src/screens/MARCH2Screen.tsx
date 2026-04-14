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

type RootStackParamList = { MARCH: undefined; MARCH2: undefined; TriageForm: { page: number } };
type NavProp = StackNavigationProp<RootStackParamList, 'MARCH2'>;

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

export function MARCH2Screen() {
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
    setVoiceEnabled,
  } = usePatientStore();

  const isComplete = march.circulation !== null && march.hypothermia !== null;
  const handleNext = useCallback(() => navigation.navigate('TriageForm', { page: 1 }), [navigation]);

  const { active, countdownMs, cancel } = useAutoAdvance({
    enabled: true,
    isComplete,
    onAdvance: handleNext,
  });

  const { statusText, isSupported, listen } = useGuidedVoiceStep({
    stepId: 'march-2',
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
        if (key === 'circulation' || key === 'hypothermia') {
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
        <Text style={styles.subtitle}>Screen 2 of 2 — C · H</Text>

        <SectionCard title="C — CIRCULATION">
          <MarchOption goodLabel="STABLE" badLabel="UNSTABLE"
            selected={march.circulation} onSelect={(value) => setMarch('circulation', value)} />
        </SectionCard>

        <SectionCard title="H — HYPOTHERMIA">
          <MarchOption goodLabel="NONE" badLabel="PRESENT"
            selected={march.hypothermia} onSelect={(value) => setMarch('hypothermia', value)} />
        </SectionCard>
      </ScrollView>

      <GuidedVoiceBar
        active={voice.enabled}
        supported={isSupported}
        statusText={active && countdownMs != null
          ? `MARCH complete. Auto-advancing in ${(countdownMs / 1000).toFixed(1)} seconds.`
          : statusText || 'Finish C and H by touch or voice.'}
        onMicPress={listen}
        onToggleVoice={() => setVoiceEnabled(!voice.enabled)}
      />

      <View style={styles.footer}>
        <View style={styles.btnWrap}>
          <BigButton variant="neutral" label="← BACK" size="small" onPress={() => {
            cancel();
            navigation.goBack();
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
