import React, { useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { GuidedVoiceBar } from '../components/GuidedVoiceBar';
import { useAutoAdvance } from '../hooks/useAutoAdvance';
import { useGuidedVoiceStep } from '../hooks/useGuidedVoiceStep';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = {
  Home: undefined;
  PatientInfo: undefined;
  MARCH: undefined;
};
type NavProp = StackNavigationProp<RootStackParamList, 'PatientInfo'>;

export function PatientInfoScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    patientId,
    missionId,
    march,
    vitals,
    neuro,
    shootdownRisk,
    voice,
    setPatientId,
    setMissionId,
    setVoiceEnabled,
  } = usePatientStore();

  const isComplete = patientId.trim().length > 0 && missionId.trim().length > 0;
  const handleNext = useCallback(() => navigation.navigate('MARCH'), [navigation]);

  const { active, countdownMs, cancel } = useAutoAdvance({
    enabled: true,
    isComplete,
    onAdvance: handleNext,
  });

  const { statusText, isSupported, listen } = useGuidedVoiceStep({
    stepId: 'patient-info',
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
      if (typeof values.patientId === 'string') {
        setPatientId(values.patientId);
      }
      if (typeof values.missionId === 'string') {
        setMissionId(values.missionId);
      }
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

      <View style={styles.body}>
        <Text style={styles.title}>PATIENT INFO</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>PATIENT:</Text>
          <TextInput
            style={styles.input}
            value={patientId}
            onChangeText={setPatientId}
            placeholder="Patient ID"
            placeholderTextColor={colors.textDim}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>MISSION ID:</Text>
          <TextInput
            style={styles.input}
            value={missionId}
            onChangeText={setMissionId}
            placeholder="Mission ID"
            placeholderTextColor={colors.textDim}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <GuidedVoiceBar
        active={voice.enabled}
        supported={isSupported}
        statusText={active && countdownMs != null
          ? `Fields complete. Auto-advancing in ${(countdownMs / 1000).toFixed(1)} seconds.`
          : statusText || 'The app reads the next question and keeps touch input available.'}
        onMicPress={listen}
        onToggleVoice={() => setVoiceEnabled(!voice.enabled)}
      />

      <View style={styles.footer}>
        <BigButton
          variant="go"
          label={active ? 'NEXTING…' : 'NEXT →'}
          size="small"
          disabled={!isComplete}
          onPress={() => {
            cancel();
            handleNext();
          }}
        />
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
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 26,
    textAlign: 'center',
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.label,
    fontSize: 16,
    marginBottom: 0,
  },
  input: {
    height: sizing.segmentHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizing.borderRadius,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: 20,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
