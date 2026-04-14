import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';

// Voice Form navigates to VoiceAssessment (Phase 2 — Qwen3-ASR)

type RootStackParamList = {
  Home: undefined; AssessmentMode: undefined; PatientInfo: undefined; VoiceAssessment: undefined;
};
type NavProp = StackNavigationProp<RootStackParamList, 'AssessmentMode'>;

export function AssessmentModeScreen() {
  const navigation = useNavigation<NavProp>();
  const setAssessmentMode = usePatientStore((s) => s.setAssessmentMode);
  const setVoiceEnabled = usePatientStore((s) => s.setVoiceEnabled);
  const reset = usePatientStore((s) => s.reset);

  useFocusEffect(
    useCallback(() => { reset(); }, [reset]),
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.bigBtnWrap}>
          <BigButton
            variant="go"
            label="TYPE FORM"
            onPress={() => {
              setAssessmentMode('FORM');
              setVoiceEnabled(true);
              navigation.navigate('PatientInfo');
            }}
          />
        </View>
        <View style={styles.bigBtnWrap}>
          <BigButton
            variant="neutral"
            label="VOICE FORM"
            onPress={() => {
              setAssessmentMode('VOICE');
              setVoiceEnabled(true);
              navigation.navigate('PatientInfo');
            }}
          />
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
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
    justifyContent: 'center',
  },
  bigBtnWrap: {
    minHeight: sizing.buttonHeight * 1.6,
    justifyContent: 'center',
  },
});
