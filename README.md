# MedIC — Field-Deployable TBI Triage Decision Support

React Native Android app for special operations field medics. Offline-first TBI/hemorrhage triage tool with on-device Qwen3 AI. See `MedIC_PROJECT.md` for full project specification.

## Prerequisites

- Node.js 20.19.4+ (use nvm: `nvm install 20.19.4 && nvm use 20.19.4`)
- Java 17
- Android Studio with Android SDK Platform 34+, Build-Tools 35.0.0
- Emulator or physical device (API 34+)

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

## Quick Start

```bash
npm install
npm start        # Terminal 1 — keep running
npm run android  # Terminal 2 — first run takes ~3 min
```

## Emulator Setup (Required for Qwen3)

The Qwen3-1.7B model needs 1.2GB RAM headroom. Configure your AVD in Android Studio → Virtual Device Manager → Edit:

| Setting          | Value      |
| ---------------- | ---------- |
| RAM              | **6 GB**   |
| VM heap          | **512 MB** |
| Internal storage | **10 GB**  |

After changing settings, restart the emulator.

## Qwen3 Model Setup

Download the model (~1.1GB) and push to the emulator:

```bash
# Download
wget -O ~/dev/MedIC/models/qwen3-1.7b-q4_k_m.gguf \
  "https://huggingface.co/ggml-org/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf"

# Push to emulator (do this once, survives app reinstalls)
adb push ~/dev/MedIC/models/qwen3-1.7b-q4_k_m.gguf \
  /data/local/tmp/medic_models/qwen3-1.7b-q4_k_m.gguf

# Verify
adb shell ls -lh /data/local/tmp/medic_models/
```

The model loads on app start (~15-30s). Watch Metro logs for `[Qwen3] Model loaded successfully ✓`.

If you see "AI model not loaded — responses are stubs", the model file isn't on the device or the emulator ran out of memory.

## Build Configuration

| Component            | Version                       |
| -------------------- | ----------------------------- |
| react-native         | 0.76.5                        |
| react                | 18.3.1                        |
| llama.rn             | 0.11.5                        |
| react-native-screens | 3.35.0                        |
| New Architecture     | enabled                       |
| Gradle               | 8.10.2                        |
| compileSdk           | 35 / targetSdk 34 / minSdk 24 |

## Project Structure

```
src/
├── screens/     # All screens (Home → AssessmentMode → PatientInfo → MARCH → TriageForm → Review → Confirm → InteractiveCare)
├── components/  # Reusable UI (BigButton, SegmentSelector, etc.)
├── theme/       # colors.ts, spacing.ts, typography.ts, styles.ts
├── store/       # Zustand state
├── engine/      # droneCalc.ts, payloadEncoder.ts
├── ai/          # qwenBridge.ts, modelManager.ts, prompts.ts
├── storage/     # AsyncStorage: drafts + recent requests
└── types/       # TypeScript types
```

## Code Rules

- **Zero inline styles** — all values from theme tokens
- **Zero hardcoded hex values** — all from `src/theme/colors.ts`
- **Screens are layout only** — no business logic, no StyleSheet.create
- **Three input primitives:** `BigButton`, `SegmentSelector`, `NumericStepper`
- **Component styles** at bottom of file in `StyleSheet.create({})`

## Troubleshooting

**Metro won't start:**

```bash
nvm use 20.19.4
lsof -ti:8081 | xargs kill -9
npm start
```

**"Could not connect to development server":**

```bash
adb reverse tcp:8081 tcp:8081
```

**Model keeps crashing app:**
Emulator RAM too low. Increase to 6GB in AVD Manager (see Emulator Setup above), VM heap to 512, internal storage 10gb

**Model not loading ("using stub"):**

- Check model is on device: `adb shell ls -lh /data/local/tmp/medic_models/`
- Re-push if missing: see Qwen3 Model Setup above

**Clean rebuild:**

```bash
cd android && ./gradlew clean && cd ..
npm run android
```

## Test Cases

Use these to validate risk scoring end-to-end.

### Case 1 — CRITICAL

- Patient: `ALPHA-1` / Mission: `M-001`
- MARCH: Hemorrhage `UNCONTROLLED`, all else stable
- BP: `85/50` | HR: `130` | SpO2: `91` | Temp: `96.2`
- GCS: `6` | Consciousness: `PAIN` | Location: `FRONT`, `LEFT`
- Notes: `blast injury, seizure activity observed, left pupil blown`
- Shootdown: `75%`
- **Expected:** CRITICAL, hypertonic saline + blood + burr hole in payload, BP alert fires (hemorrhage + TBI conflict)

### Case 2 — HIGH

- Patient: `BRAVO-2` / Mission: `M-002`
- MARCH: all stable
- BP: `110/70` | HR: `105` | SpO2: `95` | Temp: `98.1`
- GCS: `10` | Consciousness: `VOICE` | Location: `TOP`
- Notes: `GSW to head, was GCS 13 twenty minutes ago, now declining`
- Shootdown: `25%`
- **Expected:** HIGH, evacuation urgency in recommendations, ketamine in payload

### Case 3 — LOW/MODERATE

- Patient: `CHARLIE-3` / Mission: `M-003`
- MARCH: all stable
- BP: `128/82` | HR: `88` | SpO2: `99` | Temp: `98.6`
- GCS: `14` | Consciousness: `ALERT` | Location: `BACK`
- Notes: `blunt trauma from fall, mild headache, pupils equal and reactive`
- Shootdown: `10%`
- **Expected:** LOW or MODERATE, minimal payload, no BP alert, monitoring recommendations only

## Phase 2 TODO

- [ ] Qwen3-ASR for voice form input
- [ ] TTS output (Kokoro/Piper)
- [ ] Real HTTP POST for squirt payload
- [ ] VoiceFAB audio pipeline
