import { AccessibilityInfo } from 'react-native';

type OptionalTtsModule = {
  stop?: () => Promise<void> | void;
  setDefaultLanguage?: (language: string) => Promise<void> | void;
  speak?: (text: string) => Promise<void> | void;
};

function getTtsModule(): OptionalTtsModule | null {
  try {
    return require('react-native-tts').default ?? require('react-native-tts');
  } catch {
    return null;
  }
}

export function isTextToSpeechAvailable(): boolean {
  return getTtsModule() != null;
}

export async function speakText(text: string): Promise<void> {
  const message = text.trim();
  if (!message) {
    return;
  }

  const tts = getTtsModule();
  if (tts?.speak) {
    try {
      if (tts.setDefaultLanguage) {
        await tts.setDefaultLanguage('en-US');
      }
      await tts.speak(message);
      return;
    } catch (error) {
      console.warn('ttsBridge: speak failed', error);
    }
  }

  try {
    AccessibilityInfo.announceForAccessibility(message);
  } catch (error) {
    console.warn('ttsBridge: accessibility announce failed', error);
  }
}

export async function stopSpeaking(): Promise<void> {
  const tts = getTtsModule();
  try {
    await tts?.stop?.();
  } catch (error) {
    console.warn('ttsBridge: stop failed', error);
  }
}

