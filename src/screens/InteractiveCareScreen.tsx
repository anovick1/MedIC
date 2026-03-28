import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { askBuddy } from '../ai/qwenBridge';
import { isModelLoaded, isModelLoading } from '../ai/modelManager';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = { Home: undefined; InteractiveCare: undefined };
type NavProp = StackNavigationProp<RootStackParamList, 'InteractiveCare'>;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function buildContext(store: ReturnType<typeof usePatientStore.getState>): string {
  return [
    `Patient: ${store.patientId || '?'}`, `Mission: ${store.missionId || '?'}`,
    `GCS: ${store.neuro.gcs ?? '?'}`, `Consciousness: ${store.neuro.consciousness ?? '?'}`,
    `BP: ${store.vitals.bpSystolic ?? '?'}/${store.vitals.bpDiastolic ?? '?'}`,
    `HR: ${store.vitals.heartRate ?? '?'}`, `SpO2: ${store.vitals.oxygenSaturation ?? '?'}%`,
    `Risk: ${store.risk.level}`,
  ].join(', ');
}

export function InteractiveCareScreen() {
  const navigation = useNavigation<NavProp>();
  const reset = usePatientStore((s) => s.reset);
  const storeState = usePatientStore.getState();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [inThinkBlock, setInThinkBlock] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const modelReady = isModelLoaded();
  const modelLoading = isModelLoading();
  const context = buildContext(storeState);

  const statusText = modelLoading
    ? 'AI model loading...'
    : modelReady
    ? 'AI ready'
    : 'AI model not loaded — responses are stubs';

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || generating) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setGenerating(true);
    setStreamText('');
    setInThinkBlock(false);
    let accumulated = '';
    let thinking = false;
    const response = await askBuddy(text, context, (token) => {
      accumulated += token;
      if (accumulated.includes('<think>')) thinking = true;
      if (accumulated.includes('</think>')) { thinking = false; }
      setInThinkBlock(thinking);
      if (!thinking) {
        const visible = accumulated
          .replace(/<think>[\s\S]*?<\/think>/g, '')
          .replace(/<think>[\s\S]*/g, '')
          .trim();
        setStreamText(visible || '');
      }
    });
    setStreamText('');
    setGenerating(false);
    const finalContent = response.trim() || 'No response generated.';
    setMessages((prev) => [...prev, { role: 'assistant', content: finalContent }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [input, generating, context]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>INTERACTIVE CARE</Text>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && !generating && (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Ask any clinical question. Patient context is loaded.
            </Text>
          </View>
        )}
        {messages.map((msg, i) => (
          <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            <Text style={styles.roleLabel}>{msg.role === 'user' ? 'YOU' : 'AI'}</Text>
            <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>{msg.content}</Text>
          </View>
        ))}
        {generating && (
          <View style={[styles.bubble, styles.assistantBubble]}>
            <Text style={styles.roleLabel}>AI</Text>
            <Text style={styles.bubbleText}>
              {inThinkBlock ? '⟳ Thinking...' : streamText.length > 0 ? streamText + '▌' : '⟳ Thinking...'}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question..."
            placeholderTextColor={colors.textDim}
            editable={!generating}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <View style={styles.sendBtnWrap}>
            <BigButton
              variant="go"
              label="SEND"
              size="small"
              disabled={generating || !input.trim()}
              onPress={handleSend}
            />
          </View>
        </View>
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
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 26,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 13,
    color: colors.textDim,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: sizing.borderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBubble: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDim,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  bubbleText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  userText: {
    color: colors.accent,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    height: sizing.segmentHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: sizing.borderRadius,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: 18,
  },
  sendBtnWrap: {
    width: 90,
  },
});
