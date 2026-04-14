import { PermissionsAndroid, Platform } from 'react-native';
import { createPcmLiveStream } from 'react-native-sherpa-onnx/audio';
import { createSTT, detectSttModel, type SttEngine } from 'react-native-sherpa-onnx/stt';

type CaptureResult = {
  text: string;
  error: string | null;
};

const SAMPLE_RATE = 16000;
const DEFAULT_CAPTURE_MS = 3500;
const MODEL_PATH = {
  type: 'asset' as const,
  path: 'models/qwen3-asr',
};

let enginePromise: Promise<SttEngine> | null = null;

async function getEngine(): Promise<SttEngine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const detection = await detectSttModel(MODEL_PATH, { modelType: 'qwen3_asr' });
      if (!detection.success) {
        throw new Error(
          detection.error ??
          'Qwen3 ASR model assets were not found at android/app/src/main/assets/models/qwen3-asr.',
        );
      }

      return createSTT({
        modelPath: MODEL_PATH,
        modelType: 'qwen3_asr',
      });
    })().catch((error) => {
      enginePromise = null;
      throw error;
    });
  }

  return enginePromise;
}

export function isSpeechToTextAvailable(): boolean {
  return true;
}

export async function ensureMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  if (granted) {
    return true;
  }

  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function captureSingleUtterance(durationMs = DEFAULT_CAPTURE_MS): Promise<CaptureResult> {
  let engine: SttEngine;
  try {
    engine = await getEngine();
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error
        ? error.message
        : 'Speech-to-text could not initialize. Manual entry still works.',
    };
  }

  const pcmStream = createPcmLiveStream({
    sampleRate: SAMPLE_RATE,
    channelCount: 1,
  });

  const samples: number[] = [];
  let streamError: string | null = null;

  const unsubscribeData = pcmStream.onData((chunk) => {
    samples.push(...Array.from(chunk));
  });
  const unsubscribeError = pcmStream.onError((message) => {
    streamError = message;
  });

  try {
    await pcmStream.start();
    await new Promise((resolve) => setTimeout(resolve, durationMs));
    await pcmStream.stop();
  } catch (error) {
    streamError = error instanceof Error ? error.message : 'Microphone capture failed.';
  } finally {
    unsubscribeData();
    unsubscribeError();
  }

  if (streamError) {
    return { text: '', error: streamError };
  }

  if (samples.length === 0) {
    return { text: '', error: 'No speech detected. Tap the mic and try again.' };
  }

  try {
    const result = await engine.transcribeSamples(samples, SAMPLE_RATE);
    const text = result.text.trim();
    return {
      text,
      error: text ? null : 'No speech detected. Tap the mic and try again.',
    };
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Speech transcription failed.',
    };
  }
}
