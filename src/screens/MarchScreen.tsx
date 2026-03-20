import React from 'react';
import { View, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { ProgressBar } from '../components/ProgressBar';
import { AlertBanner } from '../components/AlertBanner';
import { SectionCard } from '../components/SectionCard';
import { SegmentSelector } from '../components/SegmentSelector';
import { NumericStepper } from '../components/NumericStepper';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  March: undefined;
  TBI: undefined;
};

type MarchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'March'>;

export function MarchScreen() {
  const navigation = useNavigation<MarchScreenNavigationProp>();
  const { march, patientId, missionId, setMarch, setPatientId, setMissionId } = usePatientStore();

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
        <ProgressBar total={4} current={1} />

        <AlertBanner
          type="warning"
          message="Assess life threats FIRST"
        />

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Patient ID"
              placeholderTextColor={colors.textDim}
              value={patientId}
              onChangeText={setPatientId}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mission ID"
              placeholderTextColor={colors.textDim}
              value={missionId}
              onChangeText={setMissionId}
            />
          </View>
        </View>

        <SectionCard title="M — MASSIVE HEMORRHAGE">
          <SegmentSelector
            options={[
              { label: 'NO', value: 'NO' },
              { label: 'APPLIED', value: 'APPLIED', sublabel: 'Tourniquet/packing' },
              { label: 'UNCONTROLLED', value: 'UNCONTROLLED' },
            ]}
            selected={march.hemorrhage}
            onSelect={(value) => setMarch('hemorrhage', value)}
            columns={3}
          />
        </SectionCard>

        <SectionCard title="A — AIRWAY">
          <SegmentSelector
            options={[
              { label: 'PATENT', value: 'PATENT' },
              { label: 'MANAGED', value: 'MANAGED', sublabel: 'ETT/NPA' },
              { label: 'COMPROMISED', value: 'COMPROMISED' },
            ]}
            selected={march.airway}
            onSelect={(value) => setMarch('airway', value)}
            columns={3}
          />
        </SectionCard>

        <SectionCard title="R — RESPIRATION">
          <SegmentSelector
            options={[
              { label: 'NORMAL', value: 'NORMAL' },
              { label: 'NEEDLE-D', value: 'NEEDLE-D', sublabel: 'Needle decompression' },
              { label: 'CHEST-SEAL', value: 'CHEST-SEAL' },
              { label: 'COMPROMISED', value: 'COMPROMISED' },
            ]}
            selected={march.respiration}
            onSelect={(value) => setMarch('respiration', value)}
            columns={2}
          />
        </SectionCard>

        <SectionCard title="C — CIRCULATION">
          <NumericStepper
            label="Systolic BP (mmHg)"
            value={march.systolicBP}
            min={0}
            max={250}
            step={5}
            onChange={(value) => setMarch('systolicBP', value)}
          />
          <SegmentSelector
            options={[
              { label: 'NO', value: 'NO' },
              { label: 'MILD', value: 'MILD' },
              { label: 'SEVERE', value: 'SEVERE' },
            ]}
            selected={march.hypothermia}
            onSelect={(value) => setMarch('hypothermia', value)}
            columns={3}
          />
        </SectionCard>

        <SectionCard title="H — HEAD / HYPOTHERMIA">
          <SegmentSelector
            options={[
              { label: 'NONE', value: 'NONE' },
              { label: 'SPINAL', value: 'SPINAL' },
              { label: 'BURNS', value: 'BURNS' },
              { label: 'MULTIPLE', value: 'MULTIPLE' },
            ]}
            selected={march.otherInjuries}
            onSelect={(value) => setMarch('otherInjuries', value)}
            columns={2}
          />
        </SectionCard>

        <View style={styles.buttonRow}>
          <BigButton
            label="CONTINUE → TBI"
            variant="primary"
            onPress={() => navigation.navigate('TBI')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    height: 56,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  buttonRow: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});
