import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { SectionCard } from '../components/SectionCard';
import { AlertBanner } from '../components/AlertBanner';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = {
  Home: undefined; MARCH: undefined; TriageForm: { page: number };
};
type NavProp = StackNavigationProp<RootStackParamList, 'MARCH'>;

function hasLifeThreat(m: { hemorrhage: string | null; airway: string | null; respiration: string | null; circulation: string | null; hypothermia: string | null }): boolean {
  return m.hemorrhage === 'UNCONTROLLED' || m.airway === 'COMPROMISED' || m.respiration === 'COMPROMISED' || m.circulation === 'UNSTABLE' || m.hypothermia === 'PRESENT';
}

function MarchOption({ goodLabel, badLabel, selected, onSelect }: {
  goodLabel: string; badLabel: string; selected: string | null; onSelect: (v: string) => void;
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
  const { march, setMarch, saveDraftToStorage, setLastPage } = usePatientStore();
  const showCritical = hasLifeThreat(march);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>MARCH CHECK</Text>
        <Text style={styles.subtitle}>Confirm life threats before proceeding</Text>

        {showCritical && (
          <AlertBanner type="critical" message="Life threat detected — address before proceeding. Qwen will prioritize this in recommendations." />
        )}

        <SectionCard title="M — MASSIVE HEMORRHAGE">
          <MarchOption goodLabel="CONTROLLED" badLabel="UNCONTROLLED" selected={march.hemorrhage} onSelect={(v) => setMarch('hemorrhage', v)} />
        </SectionCard>

        <SectionCard title="A — AIRWAY">
          <MarchOption goodLabel="PATENT" badLabel="COMPROMISED" selected={march.airway} onSelect={(v) => setMarch('airway', v)} />
        </SectionCard>

        <SectionCard title="R — RESPIRATION">
          <MarchOption goodLabel="NORMAL" badLabel="COMPROMISED" selected={march.respiration} onSelect={(v) => setMarch('respiration', v)} />
        </SectionCard>

        <SectionCard title="C — CIRCULATION">
          <MarchOption goodLabel="STABLE" badLabel="UNSTABLE" selected={march.circulation} onSelect={(v) => setMarch('circulation', v)} />
        </SectionCard>

        <SectionCard title="H — HYPOTHERMIA">
          <MarchOption goodLabel="NONE" badLabel="PRESENT" selected={march.hypothermia} onSelect={(v) => setMarch('hypothermia', v)} />
        </SectionCard>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.btnWrap}>
          <BigButton variant="neutral" label="SAVE DRAFT" size="small" onPress={async () => { setLastPage(0); await saveDraftToStorage(); navigation.navigate('Home'); }} />
        </View>
        <View style={styles.btnWrap}>
          <BigButton variant="go" label="NEXT →" size="small" onPress={() => navigation.navigate('TriageForm', { page: 1 })} />
        </View>
      </View>
    </View>
  );
}

export const MarchScreen = MARCHScreen;

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
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 26,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.label,
    color: colors.textDim,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 0,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  optionBtn: {
    flex: 1,
    height: sizing.buttonHeight,
    borderRadius: sizing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionGreenActive: {
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.white,
  },
  optionGreenInactive: {
    backgroundColor: colors.green,
  },
  optionRedActive: {
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.white,
  },
  optionRedInactive: {
    backgroundColor: colors.red,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.bg,
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  btnWrap: {
    flex: 1,
  },
});
