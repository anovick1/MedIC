import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePatientStore } from '../store/usePatientStore';
import { askBuddy } from '../ai/qwenBridge';
import { useModelPreload } from '../ai/modelManager';
import { loadAllRequests, loadRequest, RequestRecord } from '../storage/storage';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { spacing, sizing } from '../theme/spacing';
import { typography } from '../theme/typography';

type RootStackParamList = { Home: undefined; InteractiveCare: { requestId?: string } };
type NavProp = StackNavigationProp<RootStackParamList, 'InteractiveCare'>;
type RoutePropType = RouteProp<RootStackParamList, 'InteractiveCare'>;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function introMessage(patientId: string): ChatMessage {
  return { role: 'assistant', content: `Loaded ${patientId}. Ask any clinical question.` };
}

function buildRequestContext(r: RequestRecord): string {
  let v: any = {};
  let snapshot: any = null;
  try { v = JSON.parse(r.vitalsSnapshot); } catch {}
  try { snapshot = r.snapshot ? JSON.parse(r.snapshot) : null; } catch {}
  const neuro = snapshot?.neuro;
  return [
    `Patient: ${r.patientId}`, `Mission: ${r.missionId}`,
    `BP: ${v.bpSystolic ?? '?'}/${v.bpDiastolic ?? '?'}`,
    `HR: ${v.heartRate ?? '?'}`, `SpO2: ${v.oxygenSaturation ?? '?'}%`,
    `Temp: ${v.temperatureC ?? '?'}°C`,
    neuro ? `GCS: ${neuro.gcs ?? 'untestable'} (E${neuro.gcsEye ?? '?'} V${neuro.gcsVerbal ?? '?'} M${neuro.gcsMotor ?? '?'})` : '',
    neuro ? `Symptoms: seizure ${neuro.seizure}, vomiting ${neuro.vomiting}, suspected ICP elevation ${neuro.suspectedICP ? 'yes' : 'no'}` : '',
    neuro ? `Pupils: right ${neuro.rightPupil}, left ${neuro.leftPupil}` : '',
    neuro?.notes ? `Notes: ${neuro.notes}` : '',
    `MARCH: ${r.marchFlags.join(', ') || 'clear'}`,
    `Shootdown: ${r.shootdownRisk ?? '?'}%`,
  ].filter(Boolean).join(', ');
}

export function InteractiveCareScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const initialRequestId = route.params?.requestId;
  const reset = usePatientStore((s) => s.reset);

  const [allRequests, setAllRequests] = useState<RequestRecord[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestRecord | null>(null);
  const [context, setContext] = useState('No patient selected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [inThinkBlock, setInThinkBlock] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { loaded: modelReady, loading: modelLoading, error: modelError } = useModelPreload();

  const loadSelectedRequest = useCallback((r: RequestRecord) => {
    setSelectedRequest(r);
    setContext(buildRequestContext(r));
    setMessages([introMessage(r.patientId)]);
  }, []);

  useEffect(() => {
    loadAllRequests().then((reqs) => {
      setAllRequests(reqs);
      if (initialRequestId) {
        loadRequest(initialRequestId).then((r) => {
          if (r) {
            loadSelectedRequest(r);
          }
        });
      } else if (reqs.length === 1) {
        loadSelectedRequest(reqs[0]);
      }
    });
  }, [initialRequestId, loadSelectedRequest]);

  const selectPatient = (r: RequestRecord) => {
    loadSelectedRequest(r);
    setShowPicker(false);
  };

  const statusLine = modelLoading ? 'AI loading...' : modelReady ? 'AI ready' : `AI not loaded${modelError ? `: ${modelError}` : ''}`;

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || generating || !modelReady) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setGenerating(true);
    setStreamText('');
    setInThinkBlock(false);
    let acc = '';
    let thinking = false;
    const response = await askBuddy(text, context, (token) => {
      acc += token;
      if (acc.includes('<think>')) thinking = true;
      if (acc.includes('</think>')) thinking = false;
      setInThinkBlock(thinking);
      if (!thinking) {
        const vis = acc.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/<think>[\s\S]*/g, '').trim();
        setStreamText(vis);
      }
    });
    setStreamText('');
    setGenerating(false);
    setMessages((prev) => [...prev, { role: 'assistant', content: response.trim() || 'No response.' }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [input, generating, context, modelReady]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CLINICAL ASSISTANT</Text>
        <Text style={styles.statusText}>{statusLine}</Text>

        <TouchableOpacity style={styles.patientBar} onPress={() => setShowPicker(!showPicker)} activeOpacity={0.75}>
          <Text style={styles.patientBarValue}>
            {selectedRequest ? selectedRequest.patientId : 'Tap to select'}
          </Text>
          <Text style={styles.patientBarChevron}>{showPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showPicker && (
          <ScrollView style={styles.picker} nestedScrollEnabled>
            {allRequests.length === 0 && (
              <Text style={styles.pickerEmpty}>No recent requests</Text>
            )}
            {allRequests.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.pickerItem, selectedRequest?.id === r.id && styles.pickerItemActive]}
                onPress={() => selectPatient(r)} activeOpacity={0.75}
              >
                <Text style={styles.pickerText}>{r.patientId}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && !generating && (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Select a patient above, then ask a clinical question.</Text>
          </View>
        )}
        {messages.map((msg, i) => (
          <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={styles.roleLabel}>{msg.role === 'user' ? 'YOU' : 'AI'}</Text>
            <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>{msg.content}</Text>
          </View>
        ))}
        {generating && (
          <View style={[styles.bubble, styles.aiBubble]}>
            <Text style={styles.roleLabel}>AI</Text>
            <Text style={styles.bubbleText}>
              {inThinkBlock ? '⟳ Thinking...' : streamText.length > 0 ? streamText + '▌' : '⟳ Thinking...'}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} value={input} onChangeText={setInput}
            placeholder="Ask a question..." placeholderTextColor={colors.textDim}
            editable={!generating && !!selectedRequest && modelReady}
            onSubmitEditing={handleSend} returnKeyType="send" blurOnSubmit={false} />
          <View style={styles.sendWrap}>
            <BigButton variant="go" label="SEND" size="small"
              disabled={generating || !input.trim() || !selectedRequest || !modelReady} onPress={handleSend} />
          </View>
        </View>
        <BigButton variant="neutral" label="RETURN HOME" size="small"
          onPress={() => { reset(); navigation.navigate('Home'); }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.sm, gap: spacing.xs },
  title: { ...typography.screenTitle, fontSize: 24, textAlign: 'center' },
  statusText: { fontSize: 13, color: colors.textDim, textAlign: 'center', fontFamily: 'monospace' },
  patientBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: sizing.borderRadius, padding: spacing.md, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  patientBarValue: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.accent, textAlign: 'center' },
  patientBarChevron: { fontSize: 14, color: colors.textDim },
  picker: { maxHeight: 200, backgroundColor: colors.surface, borderRadius: sizing.borderRadius, borderWidth: 1, borderColor: colors.border, marginTop: spacing.xs },
  pickerItem: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerItemActive: { backgroundColor: colors.accentDim },
  pickerText: { fontSize: 18, color: colors.text, fontWeight: '700' },
  pickerEmpty: { padding: spacing.md, fontSize: 14, color: colors.textDim, textAlign: 'center' },
  chatArea: { flex: 1 },
  chatContent: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.md },
  bubble: { backgroundColor: colors.surface, borderRadius: sizing.borderRadius, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  userBubble: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  aiBubble: { backgroundColor: colors.surface, borderColor: colors.border },
  roleLabel: { fontSize: 11, fontWeight: '700', color: colors.textDim, letterSpacing: 1, marginBottom: spacing.xs },
  bubbleText: { fontSize: 16, color: colors.text, lineHeight: 24 },
  userText: { color: colors.accent },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: { flex: 1, height: sizing.segmentHeight, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: sizing.borderRadius, paddingHorizontal: spacing.lg, color: colors.text, fontSize: 18 },
  sendWrap: { width: 90 },
});
