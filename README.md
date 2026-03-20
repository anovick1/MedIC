# MedIC — Field-Deployable TBI Triage Decision Support

React Native Android app for special operations field medics. Offline-first TBI/hemorrhage triage tool running on Android tablets (BATDOK hardware). See `MedIC_PROJECT.md` for full project specification.

## Prerequisites

- Node.js 18+ (20.x recommended)
- Java 17
- Android Studio with:
  - Android SDK Platform 34+
  - Android SDK Build-Tools 35.0.0
  - Android SDK Command-line Tools
- Physical Android device or emulator (API 34 recommended)

Add to `~/.zshrc` or `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Quick Start

```bash
git clone <repository-url>
cd MedIC
npm install
```

Then in two terminals:

```bash
# Terminal 1 — Metro bundler (keep running)
npm start

# Terminal 2 — build and install
npm run android
```

First build downloads Gradle + Android dependencies (~2-5 min). Subsequent builds are ~15s.

## Build Configuration

Versions are pinned for compatibility. Do not upgrade without testing.

| Component | Version | Notes |
|---|---|---|
| react-native | 0.73.0 | |
| react | 18.2.0 | |
| react-native-screens | **3.29.0** | 3.36+ requires RN 0.74 |
| react-native-gesture-handler | **2.20.0** | 2.30+ breaks on RN 0.73 |
| Android Gradle Plugin | 8.6.0 | |
| Gradle | 8.7 | |
| compileSdk | 35 | Required by androidx.core 1.16 |
| targetSdk | 34 | |
| minSdk | 23 | |

## Project Structure

```
src/
├── screens/       # Layout + wiring only (Home, March, TBI, Review, Confirm, Recent)
├── components/    # Reusable UI (BigButton, SegmentSelector, NumericStepper, etc.)
├── theme/         # colors.ts, spacing.ts, typography.ts, styles.ts
├── store/         # Zustand state (usePatientStore.ts)
├── engine/        # droneCalc.ts, payloadEncoder.ts
├── ai/            # Qwen3 stubs — Phase 1 placeholders
└── types/         # TypeScript type definitions
```

## Code Rules

- **Zero inline styles** — all styles reference theme tokens
- **Zero hardcoded values** — colors, spacing, sizes from `src/theme/` only
- **Components max ~150 lines** — split if larger
- **Screens are layout only** — no business logic, no StyleSheet.create
- **Three input primitives only:** `BigButton`, `SegmentSelector`, `NumericStepper`
- **Component styles** at bottom of file in `StyleSheet.create({})`, shared styles in `src/theme/styles.ts`

## Git Strategy

### In git:
- `src/`, `android/`, config files (`package.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `App.tsx`, `index.js`)
- `android/gradlew`, `android/gradle/wrapper/` (Gradle wrapper)

### Not in git:
- `node_modules/`, `android/app/build/`, `android/.gradle/`, `android/local.properties`, `.idea/`, `*.iml`

## Offline Builds

MedIC runs fully offline in the field. For offline development:

1. Run `npm install` and `npm run android` once with internet (caches all dependencies)
2. After that, builds work offline — npm packages in `node_modules/`, Gradle cache in `~/.gradle/caches/`, SDK in `$ANDROID_HOME`

## Troubleshooting

**Metro port 8081 in use:**
```bash
lsof -ti:8081 | xargs kill -9
npm start
```

**Emulator "Unknown API Level":**
Your emulator is running an API level the build tools don't recognize (e.g. API 36). Create an AVD with API 34 in Android Studio's AVD Manager, or install the APK manually with `adb install`.

**"Could not connect to development server":**
```bash
adb reverse tcp:8081 tcp:8081
```
Then reload the app. This forwards the emulator's port to your host machine.

**`npm install` cache errors:**
```bash
npm cache clean --force
npm install
```

**Clean rebuild:**
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

## Phase 2 TODO

- [ ] Integrate Qwen3 via react-native-executorch
- [ ] Implement Qwen3-ASR for voice input
- [ ] Add TTS output (Kokoro/Piper)
- [ ] Connect real HTTP POST for squirt payload
- [ ] Enable VoiceFAB functionality
