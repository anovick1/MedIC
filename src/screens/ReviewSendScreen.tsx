import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { AlertBanner } from '../components/AlertBanner';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = { ReviewData: undefined; ReviewSend: undefined; Confirm: undefined };
type NavProp = StackNavigationProp<RootStackParamList, 'ReviewSend'>;

export function ReviewSendScreen() {
  const navigation = useNavigation<NavProp>();
  const { payloadItems, removePayloadItem } = usePatientStore();
  const [showPlusBanner, setShowPlusBanner] = useState(false);
  const included = payloadItems.filter((i) => i.included);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>REVIEW & SEND</Text>
        <Text style={styles.subtitle}>Payload Preview</Text>

        <View style={styles.itemList}>
          {included.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <TouchableOpacity style={styles.minusBtn} onPress={() => removePayloadItem(item.id)} activeOpacity={0.75}>
                <Text style={styles.minusText}>{'\u2212'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.plusBtn} onPress={() => { setShowPlusBanner(true); setTimeout(() => setShowPlusBanner(false), 2000); }} activeOpacity={0.75}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>

        {showPlusBanner && <AlertBanner type="info" message="Custom items coming in Phase 2" />}
      </ScrollView>

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
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
    justifyContent: 'center',
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
  itemList: {
    gap: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: sizing.borderRadius,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  minusBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: '700',
  },
  plusBtn: {
    height: sizing.segmentHeight,
    borderRadius: sizing.borderRadius,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontSize: 32,
    color: colors.bg,
    fontWeight: '700',
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
