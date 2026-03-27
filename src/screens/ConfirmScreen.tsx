import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { deleteDraft } from '../storage/storage';
import { BigButton } from '../components/BigButton';
import { DataRow } from '../components/DataRow';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = { Home: undefined; InteractiveCare: undefined; Confirm: undefined };
type NavProp = StackNavigationProp<RootStackParamList, 'Confirm'>;

export function ConfirmScreen() {
  const navigation = useNavigation<NavProp>();
  const { patientId, missionId, currentDraftId, saveRequestToStorage, reset } = usePatientStore();
  const [utcTime, setUtcTime] = useState(() => new Date().toISOString().substring(11, 19));

  useEffect(() => { saveRequestToStorage(); }, []);
  useEffect(() => {
    const id = setInterval(() => setUtcTime(new Date().toISOString().substring(11, 19)), 1000);
    return () => clearInterval(id);
  }, []);

  const handleReturnHome = async () => {
    if (currentDraftId) await deleteDraft(currentDraftId);
    reset();
    navigation.navigate('Home');
  };
  const handleContinueCare = async () => {
    if (currentDraftId) await deleteDraft(currentDraftId);
    navigation.navigate('InteractiveCare');
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.sentTitle}>SQUIRT SENT</Text>

        <View style={styles.dataBlock}>
          <DataRow label="Patient" value={patientId || '—'} />
          <DataRow label="Mission ID" value={missionId || '—'} />
          <DataRow label="Time" value={utcTime} isLast />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.btnWrap}>
          <BigButton variant="neutral" label="RETURN HOME" size="small" onPress={handleReturnHome} />
        </View>
        <View style={styles.btnWrap}>
          <BigButton variant="go" label="CONTINUE CARE" size="small" onPress={handleContinueCare} />
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
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  checkmark: {
    fontSize: 100,
    color: colors.green,
  },
  sentTitle: {
    ...typography.screenTitle,
    color: colors.green,
    fontSize: 28,
    textAlign: 'center',
  },
  dataBlock: {
    alignSelf: 'stretch',
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
