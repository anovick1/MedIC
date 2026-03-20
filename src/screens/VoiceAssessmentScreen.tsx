// TODO: Phase 2 — connect Qwen3-ASR to drive assessment via voice
// When active, Qwen asks each MARCH + TBI question verbally,
// extracts answers, confirms, and populates the store hands-free.
// Medic never looks at screen — audio only.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  VoiceAssessment: undefined;
  Home: undefined;
};

type VoiceAssessmentNavigationProp = StackNavigationProp<RootStackParamList, 'VoiceAssessment'>;

export function VoiceAssessmentScreen() {
  const navigation = useNavigation<VoiceAssessmentNavigationProp>();
  const reset = usePatientStore((s) => s.reset);

  const handleStop = () => {
    reset();
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.micIcon}>🎤</Text>
        <Text style={styles.title}>AI is guiding you</Text>
        <Text style={styles.subtitle}>
          Speak naturally. Say &apos;stop&apos; to exit.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <BigButton
          label="STOP"
          variant="danger"
          onPress={handleStop}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.screenTitle,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.label,
    color: colors.textDim,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: spacing.xl,
  },
});
