import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = { ReviewData: undefined; ReviewSend: undefined; Confirm: undefined };
type NavProp = StackNavigationProp<RootStackParamList, 'ReviewSend'>;

export function ReviewSendScreen() {
  const navigation = useNavigation<NavProp>();
  const { patientId, missionId, shootdownRisk, march } = usePatientStore();

  const marchFlags = Object.entries(march)
    .filter(([_, v]) => v === 'UNCONTROLLED' || v === 'COMPROMISED' || v === 'UNSTABLE' || v === 'PRESENT')
    .map(([k]) => k.toUpperCase());

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.title}>REVIEW & SEND</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.infoRow}>Patient: <Text style={styles.infoVal}>{patientId || '—'}</Text></Text>
          <Text style={styles.infoRow}>Mission: <Text style={styles.infoVal}>{missionId || '—'}</Text></Text>
          <Text style={styles.infoRow}>Shootdown: <Text style={styles.infoVal}>{shootdownRisk ?? '—'}%</Text></Text>
          {marchFlags.length > 0 && (
            <Text style={[styles.infoRow, { color: colors.red }]}>
              MARCH flags: <Text style={styles.infoVal}>{marchFlags.join(', ')}</Text>
            </Text>
          )}
        </View>

        <Text style={styles.readyText}>Squirt payload ready. Confirm to transmit.</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.btnWrap}>
          <BigButton variant="neutral" label="SEE FORM" size="small" onPress={() => navigation.navigate('ReviewData')} />
        </View>
        <View style={styles.btnWrap}>
          <BigButton variant="go" label="CONFIRM SEND" size="small" onPress={() => navigation.navigate('Confirm')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  backBtn: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md, alignSelf: 'flex-start' },
  backText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  body: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center', gap: spacing.xxl },
  title: { ...typography.screenTitle, fontSize: 26, textAlign: 'center' },
  infoBlock: { gap: spacing.md, backgroundColor: colors.surface, borderRadius: sizing.borderRadius, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  infoRow: { fontSize: 16, color: colors.textDim, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoVal: { color: colors.text, fontWeight: '400', textTransform: 'none' },
  readyText: { fontSize: 16, color: colors.textDim, textAlign: 'center', fontStyle: 'italic' },
  footer: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  btnWrap: { flex: 1 },
});
