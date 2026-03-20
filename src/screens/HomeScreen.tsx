import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  Home: undefined;
  March: undefined;
  VoiceAssessment: undefined;
  RecentPatients: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { assessmentMode, setAssessmentMode } = usePatientStore();
  const [utcTime, setUtcTime] = useState(new Date().toISOString());

  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNewPatient = () => {
    if (assessmentMode === 'VOICE') {
      navigation.navigate('VoiceAssessment');
    } else {
      navigation.navigate('March');
    }
  };

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
        <View style={sharedStyles.contentGap}>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>● OFFLINE</Text>
            <Text style={styles.statusText}>UTC: {utcTime.substring(11, 19)}</Text>
          </View>

          <SectionCard title="HOW TO ASSESS">
            <View style={styles.modeRow}>
              <View style={styles.modeButtonWrapper}>
                <BigButton
                  label="📋 FORM"
                  variant={assessmentMode === 'FORM' ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => setAssessmentMode('FORM')}
                />
              </View>
              <View style={styles.modeButtonWrapper}>
                <BigButton
                  label="🎤 VOICE"
                  variant={assessmentMode === 'VOICE' ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => setAssessmentMode('VOICE')}
                />
              </View>
            </View>
            <Text style={styles.modeHint}>
              {assessmentMode === 'FORM'
                ? 'Fill out the assessment yourself'
                : 'AI guides you through it hands-free'}
            </Text>
          </SectionCard>

          <BigButton
            label="NEW PATIENT"
            sublabel="Start assessment"
            variant="go"
            onPress={handleNewPatient}
          />

          <BigButton
            label="RECENT PATIENTS"
            variant="neutral"
            size="small"
            onPress={() => navigation.navigate('RecentPatients')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: sizing.borderRadius,
  },
  statusText: {
    fontSize: 12,
    color: colors.textDim,
    fontFamily: 'monospace',
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeButtonWrapper: {
    flex: 1,
  },
  modeHint: {
    ...typography.label,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
