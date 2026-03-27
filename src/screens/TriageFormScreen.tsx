import React, { useState, useCallback } from 'react';
import {
  View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { AlertBanner } from '../components/AlertBanner';
import { assessRisk } from '../ai/qwenBridge';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { sharedStyles } from '../theme/styles';

type RootStackParamList = {
  Home: undefined;
  MARCH: undefined;
  TriageForm: { page: number };
  ReviewData: undefined;
  ReviewSend: undefined;
  Confirm: undefined;
};

type NavProp = StackNavigationProp<RootStackParamList, 'TriageForm'>;
type RoutePropType = RouteProp<RootStackParamList, 'TriageForm'>;

/* ── Local: GCS Grid ─────────────────────────────────────────── */

const GCS_VALUES = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3];

function gcsColorStyle(v: number) {
  if (v >= 13) return styles.bgGreen;
  if (v >= 9) return styles.bgYellow;
  if (v >= 6) return styles.bgOrange;
  return styles.bgRed;
}

function GCSGrid({ selected, onSelect }: { selected: number | null; onSelect: (v: number) => void }) {
  return (
    <View style={styles.gcsGrid}>
      {GCS_VALUES.map((v) => (
        <TouchableOpacity
          key={v}
          style={[
            styles.gcsBtn,
            v === 3 && styles.gcsBtnWide,
            gcsColorStyle(v),
            selected === v && styles.selectedBorder,
          ]}
          onPress={() => onSelect(v)}
          activeOpacity={0.75}
        >
          <Text style={styles.gcsBtnText}>{v}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ── Local: Consciousness Button ─────────────────────────────── */

function ConsciousnessButton(
  { label, colorStyle, selected, onPress }: {
    label: string; colorStyle: object; selected: boolean; onPress: () => void;
  },
) {
  return (
    <TouchableOpacity
      style={[styles.consciousnessBtn, colorStyle, selected && styles.selectedBorder]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[typography.buttonLabel, styles.darkText]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ── Shootdown Risk color helper ─────────────────────────────── */

function riskColorStyle(v: number) {
  if (v <= 10) return styles.bgGreen;
  if (v <= 50) return styles.bgYellow;
  return styles.bgRed;
}

/* ── Main Screen ─────────────────────────────────────────────── */

export function TriageFormScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const [currentPage, setCurrentPage] = useState(route.params?.page ?? 1);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  const {
    patientId, missionId, vitals, neuro, march, shootdownRisk, risk,
    setVitals, setNeuro, toggleInjuryLocation,
    setShootdownRisk, setRisk, setPayloadItems, saveDraftToStorage, setLastPage,
  } = usePatientStore();

  React.useEffect(() => {
    setLastPage(currentPage);
  }, [currentPage, setLastPage]);

  const handleSaveDraft = useCallback(async () => {
    setLastPage(currentPage);
    await saveDraftToStorage();
    setShowDraftBanner(true);
    setTimeout(() => setShowDraftBanner(false), 2000);
  }, [currentPage, saveDraftToStorage, setLastPage]);

  const handleBack = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
    else navigation.goBack();
  }, [currentPage, navigation]);

  const handleNext = useCallback(async () => {
    if (currentPage < 6) {
      setCurrentPage(currentPage + 1);
      return;
    }
    setRisk({ ...risk, loading: true, error: null });
    try {
      const result = await assessRisk(vitals, neuro, march, shootdownRisk);
      setRisk(result);
      setPayloadItems(result.payloadItems);
      navigation.navigate('ReviewData');
    } catch (err: any) {
      setRisk({ ...risk, loading: false, error: err?.message ?? 'Assessment failed' });
    }
  }, [currentPage, vitals, neuro, march, shootdownRisk, risk, setRisk, setPayloadItems, navigation]);

  const nextLabel = currentPage >= 5 ? 'SEND SQUIRT' : 'Next \u2192';

  /* ── Location button helper ────────────────────────────────── */

  const renderLocationBtn = (label: string, value: 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'TOP') => {
    const selected = neuro.injuryLocation.has(value);
    return (
      <TouchableOpacity
        key={value}
        style={[
          styles.locationBtn,
          selected ? styles.locationSelected : styles.locationUnselected,
        ]}
        onPress={() => toggleInjuryLocation(value)}
        activeOpacity={0.75}
      >
        <Text
          style={[
            typography.segmentLabel,
            selected ? styles.locationTextSelected : styles.locationTextUnselected,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  /* ── Page renderers ────────────────────────────────────────── */

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <>
            <View>
              <Text style={typography.label}>Blood Pressure:</Text>
              <View style={styles.rowCenter}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  value={vitals.bpSystolic?.toString() ?? ''}
                  onChangeText={(t) => setVitals('bpSystolic', t ? Number(t) : null)}
                  keyboardType="numeric"
                  placeholder="SYS"
                  placeholderTextColor={colors.textDim}
                />
                <Text style={styles.unitText}>/</Text>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  value={vitals.bpDiastolic?.toString() ?? ''}
                  onChangeText={(t) => setVitals('bpDiastolic', t ? Number(t) : null)}
                  keyboardType="numeric"
                  placeholder="DIA"
                  placeholderTextColor={colors.textDim}
                />
                <Text style={styles.unitText}>mmHg</Text>
              </View>
            </View>
            <View>
              <Text style={typography.label}>Heart Rate:</Text>
              <View style={styles.rowCenter}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  value={vitals.heartRate?.toString() ?? ''}
                  onChangeText={(t) => setVitals('heartRate', t ? Number(t) : null)}
                  keyboardType="numeric"
                  placeholder="HR"
                  placeholderTextColor={colors.textDim}
                />
                <Text style={styles.unitText}>bpm</Text>
              </View>
            </View>
          </>
        );

      case 2:
        return (
          <>
            <View>
              <Text style={typography.label}>Oxygen Saturation:</Text>
              <View style={styles.rowCenter}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  value={vitals.oxygenSaturation?.toString() ?? ''}
                  onChangeText={(t) => setVitals('oxygenSaturation', t ? Number(t) : null)}
                  keyboardType="numeric"
                  placeholder="SpO2"
                  placeholderTextColor={colors.textDim}
                />
                <Text style={styles.unitText}>%</Text>
              </View>
            </View>
            <View>
              <Text style={typography.label}>Temperature:</Text>
              <View style={styles.rowCenter}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  value={vitals.temperature?.toString() ?? ''}
                  onChangeText={(t) => setVitals('temperature', t ? Number(t) : null)}
                  keyboardType="numeric"
                  placeholder="Temp"
                  placeholderTextColor={colors.textDim}
                />
                <Text style={styles.unitText}>{'\u00B0F'}</Text>
              </View>
            </View>
          </>
        );

      case 3:
        return (
          <>
            <Text style={typography.label}>GCS Score:</Text>
            <GCSGrid selected={neuro.gcs} onSelect={(v) => setNeuro('gcs', v)} />
          </>
        );

      case 4:
        return (
          <>
            <Text style={typography.label}>Consciousness:</Text>
            <View style={styles.consciousnessGroup}>
              <ConsciousnessButton
                label="Alert"
                colorStyle={styles.bgGreen}
                selected={neuro.consciousness === 'ALERT'}
                onPress={() => setNeuro('consciousness', 'ALERT')}
              />
              <ConsciousnessButton
                label="Responds to Voice"
                colorStyle={styles.bgYellow}
                selected={neuro.consciousness === 'VOICE'}
                onPress={() => setNeuro('consciousness', 'VOICE')}
              />
              <ConsciousnessButton
                label="Responds to Pain"
                colorStyle={styles.bgOrange}
                selected={neuro.consciousness === 'PAIN'}
                onPress={() => setNeuro('consciousness', 'PAIN')}
              />
              <ConsciousnessButton
                label="Unresponsive"
                colorStyle={styles.bgRed}
                selected={neuro.consciousness === 'UNRESPONSIVE'}
                onPress={() => setNeuro('consciousness', 'UNRESPONSIVE')}
              />
            </View>
          </>
        );

      case 5:
        return (
          <>
            <Text style={typography.label}>Injury Location:</Text>
            <View style={styles.locationGrid}>
              <View style={styles.locationRow}>
                {renderLocationBtn('Front', 'FRONT')}
                {renderLocationBtn('Back', 'BACK')}
              </View>
              <View style={styles.locationRow}>
                {renderLocationBtn('Left', 'LEFT')}
                {renderLocationBtn('Right', 'RIGHT')}
              </View>
              <View style={styles.locationRowCenter}>
                {renderLocationBtn('Top', 'TOP')}
              </View>
            </View>
            <Text style={typography.label}>Notes:</Text>
            <TextInput
              style={styles.notesInput}
              value={neuro.notes}
              onChangeText={(t) => setNeuro('notes', t)}
              multiline
              placeholder="Additional notes..."
              placeholderTextColor={colors.textDim}
            />
          </>
        );

      case 6: {
        const RISK_VALUES: Array<0 | 10 | 25 | 50 | 75 | 90> = [0, 10, 25, 50, 75, 90];
        return (
          <>
            <Text style={typography.label}>Shootdown Risk:</Text>
            <View style={styles.riskGrid}>
              {RISK_VALUES.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.riskBtn,
                    riskColorStyle(v),
                    shootdownRisk === v && styles.selectedBorder,
                  ]}
                  onPress={() => setShootdownRisk(v)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.riskBtnText}>{v}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      }

      default:
        return null;
    }
  };

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <View style={sharedStyles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TRIAGE FORM</Text>
        <Text style={styles.headerPage}>{currentPage}/6</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderPage()}
      </ScrollView>

      {showDraftBanner && (
        <View style={styles.bannerWrapper}>
          <AlertBanner type="info" message="Draft saved" />
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.footerBtn}>
          <BigButton variant="neutral" label="Save Draft" size="small" onPress={handleSaveDraft} />
        </View>
        <View style={styles.footerBtn}>
          <BigButton
            variant="go"
            label={nextLabel}
            size="small"
            onPress={handleNext}
            disabled={risk.loading}
          />
        </View>
      </View>

      <Text style={styles.watermark}>{patientId} {missionId}</Text>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  pageContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.xxl,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
  },
  backBtn: {
    paddingVertical: spacing.xs,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerPage: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDim,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  footerBtn: {
    flex: 1,
  },
  bannerWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  watermark: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.sm,
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textDim,
  },
  input: {
    height: sizing.buttonHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizing.borderRadius,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    fontSize: 22,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  unitText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textDim,
  },
  notesInput: {
    minHeight: 140,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizing.borderRadius,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: 20,
    textAlignVertical: 'top',
  },
  gcsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  gcsBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gcsBtnWide: {
    width: 100,
  },
  gcsBtnText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.bg,
  },
  consciousnessGroup: {
    gap: spacing.lg,
  },
  consciousnessBtn: {
    height: sizing.buttonHeight,
    borderRadius: sizing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationGrid: {
    gap: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  locationRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  locationBtn: {
    flex: 1,
    height: sizing.buttonHeight,
    borderRadius: sizing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  locationSelected: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  locationUnselected: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
  },
  locationTextSelected: {
    color: colors.accent,
  },
  locationTextUnselected: {
    color: colors.textDim,
  },
  riskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  riskBtn: {
    flexGrow: 1,
    flexBasis: '45%',
    height: sizing.buttonHeight,
    borderRadius: sizing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskBtnText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.bg,
  },
  bgGreen: {
    backgroundColor: colors.green,
  },
  bgYellow: {
    backgroundColor: colors.yellow,
  },
  bgOrange: {
    backgroundColor: colors.orange,
  },
  bgRed: {
    backgroundColor: colors.red,
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: colors.white,
  },
  darkText: {
    color: colors.bg,
  },
});
