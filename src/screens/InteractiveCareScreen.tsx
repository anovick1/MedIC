// TODO: Phase 2 — Qwen3 AI chat with full patient context
// Patient data from store is passed as context to Qwen
// Medic can ask clinical questions, get ongoing care guidance
// during 24-72hr evacuation delay window

import React from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = { Home: undefined; InteractiveCare: undefined };
type NavProp = StackNavigationProp<RootStackParamList, 'InteractiveCare'>;

export function InteractiveCareScreen() {
  const navigation = useNavigation<NavProp>();
  const reset = usePatientStore((s) => s.reset);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>INTERACTIVE CARE</Text>
        <Text style={styles.subtitle}>AI Clinical Assistant</Text>
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>
            AI care assistant will be available in Phase 2. Patient context has been saved.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question..."
          placeholderTextColor={colors.textDim}
          editable={false}
        />
        <BigButton variant="go" label="SEND" disabled onPress={() => {}} />
        <BigButton
          variant="neutral"
          label="RETURN HOME"
          size="small"
          onPress={() => { reset(); navigation.navigate('Home'); }}
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
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
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: sizing.borderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: {
    fontSize: 16,
    color: colors.textDim,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  input: {
    height: sizing.segmentHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizing.borderRadius,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: 18,
  },
});
