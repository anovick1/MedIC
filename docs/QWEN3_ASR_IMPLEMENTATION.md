# Qwen3-ASR On-Device Implementation Guide

## Overview

Qwen3-ASR runs **fully on-device** via `react-native-sherpa-onnx` — a React Native TurboModule that wraps sherpa-onnx for offline speech processing. No server, no internet, no Python.

```
┌─────────────────────────────────────────────────┐
│                  MedIC App (Android)             │
│                                                  │
│  Microphone → react-native-sherpa-onnx           │
│               (Qwen3-ASR-0.6B ONNX, on-device)  │
│               → transcript text                  │
│               → llama.rn (Qwen3-1.7B, on-device) │
│               → clinical response                │
└─────────────────────────────────────────────────┘
```

Everything runs on the tablet. Zero network dependency.

---

## Prerequisites

- MedIC project running on RN 0.76.5
- Android API 24+ ✓ (our minSdk is 24)
- Emulator RAM: 6GB+ (already configured)

---

## Step 1: Install react-native-sherpa-onnx

```bash
cd ~/dev/MedIC
npm install react-native-sherpa-onnx
```

No additional Android setup needed — native dependencies are handled by Gradle automatically.

Rebuild:

```bash
npm run android
```

---

## Step 2: Download the Qwen3-ASR ONNX Model

The 0.6B model is recommended for mobile (smaller, fast enough for real-time):

```bash
# Download from sherpa-onnx releases
mkdir -p ~/dev/MedIC/models/qwen3-asr

# Check the latest release at:
# https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
# Look for: sherpa-onnx-qwen3-asr-0.6b-int8

# Download and extract
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-qwen3-asr-0.6b-int8.tar.bz2
tar xvf sherpa-onnx-qwen3-asr-0.6b-int8.tar.bz2 -C ~/dev/MedIC/models/qwen3-asr/
```

**Important**: Check the exact filename at the sherpa-onnx releases page. The model name may vary.

### Option A: Bundle in APK assets

Copy to Android assets (increases APK size by ~300MB):

```bash
mkdir -p android/app/src/main/assets/models/qwen3-asr
cp -r ~/dev/MedIC/models/qwen3-asr/* android/app/src/main/assets/models/qwen3-asr/
```

### Option B: Push to device filesystem (development)

```bash
adb push ~/dev/MedIC/models/qwen3-asr/ /data/local/tmp/medic_models/qwen3-asr/
```

---

## Step 3: Add Microphone Permission

In `android/app/src/main/AndroidManifest.xml`, add inside `<manifest>` (before `<application>`):

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

---

## Step 4: Create the ASR Bridge

Create `src/ai/asrBridge.ts`:

```typescript
import { createSTT, type SttEngine } from "react-native-sherpa-onnx/stt";

let _engine: SttEngine | null = null;
let _loading = false;

export async function initASR(): Promise<void> {
  if (_engine || _loading) return;
  _loading = true;

  try {
    // Option A: Model bundled in assets
    _engine = await createSTT({
      modelPath: {
        type: "asset",
        path: "models/qwen3-asr",
      },
      modelType: "qwen3_asr",
      numThreads: 4,
    });

    // Option B: Model on device filesystem
    // _engine = await createSTT({
    //   modelPath: {
    //     type: 'file',
    //     path: '/data/local/tmp/medic_models/qwen3-asr',
    //   },
    //   modelType: 'qwen3_asr',
    //   numThreads: 4,
    // });

    console.log("[ASR] Qwen3-ASR engine initialized ✓");
  } catch (e: any) {
    console.warn("[ASR] Init failed:", e?.message);
  } finally {
    _loading = false;
  }
}

export async function transcribeFile(audioPath: string): Promise<string> {
  if (!_engine) {
    console.warn("[ASR] Engine not initialized");
    return "";
  }

  try {
    const result = await _engine.transcribeFile(audioPath);
    return result.text.trim();
  } catch (e: any) {
    console.warn("[ASR] Transcription failed:", e?.message);
    return "";
  }
}

export async function transcribeSamples(
  samples: number[],
  sampleRate: number,
): Promise<string> {
  if (!_engine) return "";

  try {
    const result = await _engine.transcribeSamples(samples, sampleRate);
    return result.text.trim();
  } catch (e: any) {
    console.warn("[ASR] Sample transcription failed:", e?.message);
    return "";
  }
}

export function isASRReady(): boolean {
  return _engine !== null;
}

export async function destroyASR(): Promise<void> {
  if (_engine) {
    await _engine.destroy();
    _engine = null;
  }
}
```

---

## Step 5: Create Streaming ASR (Real-time Microphone)

For the voice assessment mode where the medic speaks and sees text appear in real-time.

Create `src/ai/streamingASR.ts`:

```typescript
import {
  createStreamingSTT,
  type StreamingSttEngine,
  type SttStream,
} from "react-native-sherpa-onnx/stt";
import {
  createPcmLiveStream,
  type PcmLiveStream,
} from "react-native-sherpa-onnx/audio";

let _engine: StreamingSttEngine | null = null;
let _stream: SttStream | null = null;
let _pcmStream: PcmLiveStream | null = null;

type TranscriptCallback = (partial: string, isFinal: boolean) => void;

export async function initStreamingASR(): Promise<void> {
  if (_engine) return;

  _engine = await createStreamingSTT({
    modelPath: {
      type: "asset", // or 'file' for dev
      path: "models/qwen3-asr",
    },
    modelType: "qwen3_asr",
    enableEndpoint: true,
  });

  console.log("[StreamingASR] Initialized ✓");
}

export async function startListening(
  onTranscript: TranscriptCallback,
): Promise<void> {
  if (!_engine) throw new Error("Streaming ASR not initialized");

  _stream = await _engine.createStream();

  _pcmStream = await createPcmLiveStream({
    sampleRate: 16000,
    onData: async (event) => {
      if (!_stream) return;

      await _stream.acceptWaveform(event.data, event.sampleRate);

      if (await _stream.isReady()) {
        await _stream.decode();
      }

      const result = await _stream.getResult();
      if (result.text) {
        onTranscript(result.text, false);
      }

      if (await _stream.isEndpoint()) {
        const finalResult = await _stream.getResult();
        if (finalResult.text) {
          onTranscript(finalResult.text, true);
        }
        await _stream.reset();
      }
    },
  });

  await _pcmStream.start();
}

export async function stopListening(): Promise<string> {
  let finalText = "";

  if (_stream) {
    const result = await _stream.getResult();
    finalText = result.text?.trim() ?? "";
    await _stream.release();
    _stream = null;
  }

  if (_pcmStream) {
    await _pcmStream.stop();
    _pcmStream = null;
  }

  return finalText;
}

export async function destroyStreamingASR(): Promise<void> {
  await stopListening();
  if (_engine) {
    await _engine.destroy();
    _engine = null;
  }
}
```

---

## Step 6: Initialize ASR on App Start

In `App.tsx`, alongside the existing `loadModel()` call:

```typescript
import { initASR } from "./src/ai/asrBridge";

useEffect(() => {
  loadModel(); // llama.rn for chat
  initASR(); // sherpa-onnx for speech-to-text
}, []);
```

---

## Step 7: Wire into the Voice Assessment Screen

Update `VoiceAssessmentScreen.tsx` to use streaming ASR:

```typescript
import { startListening, stopListening } from "../ai/streamingASR";

// When screen mounts:
// 1. Start listening
// 2. Show partial transcript in real-time
// 3. On final transcript, send to llama.rn extractFields()
// 4. Populate store with extracted values
// 5. AI confirms via TTS or text: "Got it — BP 85/50. Next?"
```

The voice flow:

1. **Medic speaks** → microphone captures audio
2. **Qwen3-ASR** (on-device) → converts speech to text in real-time
3. **llama.rn Qwen3** (on-device) → extracts structured fields from transcript
4. **Store updates** → form fields populated
5. **Screen shows** confirmation and moves to next field

---

## Step 8: Wire into Clinical Assistant Screen

Add a microphone button to `InteractiveCareScreen.tsx`:

```typescript
import { startListening, stopListening } from "../ai/streamingASR";

// State
const [isListening, setIsListening] = useState(false);
const [partialTranscript, setPartialTranscript] = useState("");

const handleMicPress = async () => {
  if (isListening) {
    const finalText = await stopListening();
    setIsListening(false);
    setPartialTranscript("");
    if (finalText) {
      setInput(finalText);
      // Optionally auto-send
    }
  } else {
    setIsListening(true);
    await startListening((text, isFinal) => {
      setPartialTranscript(text);
      if (isFinal) {
        setInput((prev) => prev + " " + text);
      }
    });
  }
};

// In JSX — add mic button next to text input:
// <TouchableOpacity onPress={handleMicPress}>
//   <Text>{isListening ? '⏹ STOP' : '🎤'}</Text>
// </TouchableOpacity>
```

---

## Model Performance (Expected)

| Model               | Size   | RTF (4 threads) | 5.6s audio |
| ------------------- | ------ | --------------- | ---------- |
| Qwen3-ASR-0.6B int8 | ~300MB | 0.12            | ~0.7s      |
| Qwen3-ASR-1.7B int8 | ~800MB | 0.22            | ~1.3s      |

RTF < 1.0 means faster than real-time. The 0.6B model transcribes a 5.6 second clip in 0.7 seconds.

Use 0.6B for mobile. 1.7B only if you have a high-end tablet with 8GB+ RAM.

---

## Dependencies Summary

```bash
npm install react-native-sherpa-onnx
```

That's it. No Python, no server, no additional native configuration. Everything is handled by the TurboModule.

---

## Files to Create/Modify

| File                                            | Action                                   |
| ----------------------------------------------- | ---------------------------------------- |
| `src/ai/asrBridge.ts`                           | **CREATE** — offline file transcription  |
| `src/ai/streamingASR.ts`                        | **CREATE** — real-time mic transcription |
| `App.tsx`                                       | **MODIFY** — add `initASR()` call        |
| `src/screens/InteractiveCareScreen.tsx`         | **MODIFY** — add mic button              |
| `src/screens/VoiceAssessmentScreen.tsx`         | **MODIFY** — wire streaming ASR          |
| `android/app/src/main/AndroidManifest.xml`      | **MODIFY** — add RECORD_AUDIO permission |
| `android/app/src/main/assets/models/qwen3-asr/` | **ADD** — model files                    |

---

## Testing Checklist

- [ ] `npm install react-native-sherpa-onnx` succeeds
- [ ] `npm run android` builds without errors
- [ ] Model files present in assets or device filesystem
- [ ] `initASR()` logs "Qwen3-ASR engine initialized ✓"
- [ ] `transcribeFile()` returns text from a test WAV file
- [ ] Mic button records and transcribes in Clinical Assistant
- [ ] Streaming shows partial text while speaking
- [ ] Works with airplane mode on (fully offline)

---

## Architecture

```
User speaks
    ↓
Microphone (react-native-sherpa-onnx/audio)
    ↓
Qwen3-ASR-0.6B ONNX (on-device, sherpa-onnx native)
    ↓
Transcript text
    ↓
  ┌─────────────────────────┐
  │ Voice Assessment path:  │  → extractFields() via llama.rn → populate form
  │ Clinical Assistant path:│  → askBuddy() via llama.rn → AI response
  └─────────────────────────┘
```

Both ASR (speech→text) and LLM (text→intelligence) run on-device. Zero cloud dependencies.
