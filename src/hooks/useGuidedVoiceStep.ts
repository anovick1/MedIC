import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureSingleUtterance, ensureMicrophonePermission, isSpeechToTextAvailable } from '../ai/asrBridge';
import { getNextMissingField, getStep } from '../assessment/helpers';
import { AssessmentSnapshot } from '../assessment/definitions';
import { parseFieldTranscript, parseSpeechCommand } from '../assessment/parsers';
import { AssessmentStepId, SpeechCommand } from '../types';
import { usePatientStore } from '../store/usePatientStore';

type Options = {
  stepId: AssessmentStepId;
  snapshot: AssessmentSnapshot;
  enabled: boolean;
  applyValues: (values: Record<string, unknown>) => void;
  onCommand?: (command: SpeechCommand) => void;
};

export function useGuidedVoiceStep({
  stepId,
  snapshot,
  enabled,
  applyValues,
  onCommand,
}: Options) {
  const patchVoice = usePatientStore((s) => s.patchVoice);
  const setVoiceStep = usePatientStore((s) => s.setVoiceStep);
  const [statusText, setStatusText] = useState('');
  const applyValuesRef = useRef(applyValues);
  const onCommandRef = useRef(onCommand);

  const step = useMemo(() => getStep(stepId), [stepId]);
  const activeField = useMemo(() => getNextMissingField(stepId, snapshot), [snapshot, stepId]);

  const promptText = activeField?.prompt ?? `${step.title} complete.`;

  useEffect(() => {
    applyValuesRef.current = applyValues;
  }, [applyValues]);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    setVoiceStep(stepId, activeField?.key ?? null);
  }, [activeField?.key, setVoiceStep, stepId]);

  const listen = useCallback(async () => {
    if (!enabled) {
      setStatusText('Voice guidance is off.');
      return;
    }

    if (!activeField) {
      setStatusText(`${step.title} complete.`);
      return;
    }

    const permissionGranted = await ensureMicrophonePermission();
    if (!permissionGranted) {
      const error = 'Microphone permission denied. You can still finish manually.';
      patchVoice({ error, listening: false });
      setStatusText(error);
      return;
    }

    patchVoice({ available: isSpeechToTextAvailable(), listening: true, error: null });
    setStatusText(`Listening for ${activeField?.label ?? step.title}...`);

    const result = await captureSingleUtterance();
    patchVoice({
      listening: false,
      lastTranscript: result.text,
      error: result.error,
    });

    if (result.error) {
      setStatusText(result.error);
      return;
    }

    const command = parseSpeechCommand(result.text);
    if (command) {
      if (command === 'repeat') {
        setStatusText(promptText);
        return;
      }
      if (command === 'skip' && activeField && !activeField.required) {
        applyValuesRef.current({ [activeField.key]: '' });
        setStatusText(`Skipped ${activeField.label}.`);
        return;
      }
      onCommandRef.current?.(command);
      setStatusText(`Voice command: ${command}`);
      return;
    }

    if (!activeField) {
      return;
    }

    const parsed = parseFieldTranscript(activeField, result.text);
    if (!parsed) {
      const message = `Could not match that to ${activeField.label}. Tap the mic and try again.`;
      patchVoice({ error: message });
      setStatusText(message);
      return;
    }

    const values = Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [key, value.value]),
    );
    applyValuesRef.current(values);

    const confirmation = Object.entries(parsed)
      .map(([key, value]) => `${key} ${String(value.value)}`)
      .join(', ');
    const message = `Saved ${confirmation}.`;
    patchVoice({ awaitingConfirmation: false, error: null });
    setStatusText(message);
  }, [activeField, enabled, patchVoice, promptText, step.title]);

  useEffect(() => {
    if (!enabled) {
      patchVoice({ enabled: false, listening: false, currentStepId: stepId, currentFieldKey: activeField?.key ?? null });
      return;
    }

    patchVoice({
      enabled: true,
      available: isSpeechToTextAvailable(),
      listening: false,
      currentStepId: stepId,
      currentFieldKey: activeField?.key ?? null,
      lastPrompt: promptText,
      error: null,
    });
    setStatusText(
      activeField
        ? `${promptText} Tap the mic to answer by voice.`
        : `${step.title} complete.`,
    );
  }, [activeField, enabled, patchVoice, promptText, step.title, stepId]);

  return {
    activeField,
    promptText,
    statusText,
    isSupported: isSpeechToTextAvailable(),
    listen,
  };
}
