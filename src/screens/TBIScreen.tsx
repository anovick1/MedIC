import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { assessRisk } from '../ai/qwenBridge';
import { ProgressBar } from '../components/ProgressBar';
import { SectionCard } from '../components/SectionCard';
import { SegmentSelector } from '../components/SegmentSelector';
import { NumericStepper } from '../components/NumericStepper';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  TBI: undefined;
  Review: undefined;
};

type TBIScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TBI'>;

export function TBIScreen() {
  const navigation = useNavigation<TBIScreenNavigationProp>();
  const { tbi, march, setTBI, toggleSymptom, setRisk } = usePatientStore();

  const gcsTotal = tbi.gcsEye + tbi.gcsVerbal + tbi.gcsMotor;

  const handleCalculateRisk = async () => {
    setRisk({ ...usePatientStore.getState().risk, loading: true });
    const result = await assessRisk(tbi, march);
    setRisk(result);
    navigation.navigate('Review');
  };

  return (
    <View style={sharedStyles.screen}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
        <View style={sharedStyles.contentGap}>
        <ProgressBar total={4} current={2} />

        <SectionCard title="GLASGOW COMA SCALE">
          <View style={styles.gcsRow}>
            <NumericStepper
              label="Eye"
              value={tbi.gcsEye}
              min={1}
              max={4}
              step={1}
              onChange={(value) => setTBI('gcsEye', value)}
            />
            <NumericStepper
              label="Verbal"
              value={tbi.gcsVerbal}
              min={1}
              max={5}
              step={1}
              onChange={(value) => setTBI('gcsVerbal', value)}
            />
            <NumericStepper
              label="Motor"
              value={tbi.gcsMotor}
              min={1}
              max={6}
              step={1}
              onChange={(value) => setTBI('gcsMotor', value)}
            />
          </View>
          <View style={styles.gcsTotal}>
            <Text style={styles.gcsTotalLabel}>GCS Total: {gcsTotal}</Text>
          </View>
        </SectionCard>

        <SectionCard title="PUPILS">
          <SegmentSelector
            options={[
              { label: 'BOTH REACTIVE', value: 'BOTH-REACTIVE' },
              { label: 'ONE SLUGGISH', value: 'ONE-SLUGGISH' },
              { label: 'ONE FIXED', value: 'ONE-FIXED' },
              { label: 'BOTH FIXED', value: 'BOTH-FIXED' },
            ]}
            selected={tbi.pupils}
            onSelect={(value) => setTBI('pupils', value)}
            columns={2}
          />
          <SegmentSelector
            options={[
              { label: 'N/A', value: 'NA' },
              { label: 'NORMAL', value: 'NORMAL', sublabel: '≥3.0' },
              { label: 'ABNORMAL', value: 'ABNORMAL', sublabel: '1-3' },
              { label: 'CRITICAL', value: 'CRITICAL', sublabel: '<1.0' },
            ]}
            selected={tbi.npi}
            onSelect={(value) => setTBI('npi', value)}
            columns={4}
          />
        </SectionCard>

        <SectionCard title="MECHANISM OF INJURY">
          <SegmentSelector
            options={[
              { label: 'BLAST', value: 'BLAST' },
              { label: 'GSW', value: 'GSW' },
              { label: 'BLUNT', value: 'BLUNT' },
              { label: 'FALL', value: 'FALL' },
              { label: 'CRUSH', value: 'CRUSH' },
              { label: 'UNKNOWN', value: 'UNKNOWN' },
            ]}
            selected={tbi.moi}
            onSelect={(value) => setTBI('moi', value)}
            columns={2}
          />
        </SectionCard>

        <SectionCard title="TIME SINCE INJURY">
          <SegmentSelector
            options={[
              { label: '<15 MIN', value: 'LT15' },
              { label: '15-60 MIN', value: '15-60' },
              { label: '1-4 HRS', value: '1-4H' },
              { label: '>4 HRS', value: 'GT4H' },
            ]}
            selected={tbi.timeSinceInjury}
            onSelect={(value) => setTBI('timeSinceInjury', value)}
            columns={4}
          />
        </SectionCard>

        <SectionCard title="NEUROLOGICAL PROGRESSION">
          <SegmentSelector
            options={[
              { label: 'STABLE', value: 'STABLE' },
              { label: 'IMPROVING', value: 'IMPROVING' },
              { label: 'DECLINING', value: 'DECLINING' },
            ]}
            selected={tbi.neuroProgression}
            onSelect={(value) => setTBI('neuroProgression', value)}
            columns={3}
          />
        </SectionCard>

        <SectionCard title="MOTOR ASYMMETRY">
          <SegmentSelector
            options={[
              { label: 'NONE', value: 'NONE' },
              { label: 'MILD', value: 'MILD' },
              { label: 'HEMIPLEGIA', value: 'HEMIPLEGIA' },
            ]}
            selected={tbi.motorAsymmetry}
            onSelect={(value) => setTBI('motorAsymmetry', value)}
            columns={3}
          />
        </SectionCard>

        <SectionCard title="SYMPTOMS">
          <SegmentSelector
            options={[
              { label: 'LOC', value: 'LOC', sublabel: 'Loss of consciousness' },
              { label: 'VOMIT', value: 'VOMIT' },
              { label: 'SEIZURE', value: 'SEIZURE' },
              { label: 'POSTURING', value: 'POSTURING' },
              { label: 'HEADACHE', value: 'HEADACHE' },
            ]}
            selected={tbi.symptoms}
            onSelect={toggleSymptom}
            columns={2}
            multiSelect={true}
          />
        </SectionCard>

        <View style={styles.buttonRow}>
          <BigButton
            label="CALCULATE RISK →"
            variant="primary"
            onPress={handleCalculateRisk}
          />
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  gcsRow: {
    gap: spacing.sm,
  },
  gcsTotal: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  gcsTotalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  buttonRow: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});
