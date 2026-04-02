import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = {
  Home: undefined; PatientInfo: undefined; MARCH: undefined;
};
type NavProp = StackNavigationProp<RootStackParamList, 'PatientInfo'>;

export function PatientInfoScreen() {
  const navigation = useNavigation<NavProp>();
  const { patientId, missionId, setPatientId, setMissionId } = usePatientStore();

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
          />
        </View>
      </View>

      <View style={styles.footer}>
        <BigButton
          variant="go"
          label="NEXT →"
          size="small"
          disabled={!patientId.trim() || !missionId.trim()}
          onPress={() => navigation.navigate('MARCH')}
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
