# MedIC — Software Triage Decision Support
### by Team MedIC | DHA-33: Heads Up, Medics
## React Native Mobile App — Project Overview

---

## What We're Building

A **field-deployable, offline-first React Native app** for special operations field medics to triage traumatic brain injury (TBI) and intracranial hemorrhage (ICH) in contested environments with 24–72 hour evacuation delays. The app runs on Android tablets (including BATDOK hardware), operates fully offline, and uses on-device Qwen3 AI for risk scoring, clinical recommendations, and a voice/text assistant.

**Operational context:** Peer/near-peer conflict environments. No CT, no neurosurgeon, limited comms. Medic needs to make rapid life-or-death decisions about evac priority, field surgery, and drone resupply under extreme cognitive load, possibly wearing gloves, possibly in the dark.

---

## System Architecture (High Level)

```
┌─────────────────────────────────┐
│           MedIC (this app)      │  ← React Native, Android tablet
│                                 │
│  MARCH Assessment               │
│  TBI Form (manual or voice)     │
│  Qwen3 — scoring + recs + buddy │
│  Qwen3-ASR — voice input        │
│  Drone Payload Builder          │
└────────────┬────────────────────┘
             │
             │  "Squirt" — encrypted burst transmission
             │  Structured JSON payload (low-bandwidth)
             ▼
┌─────────────────────────────────┐
│     Drone Optimization API      │  ← Separate team (Flask backend)
│                                 │
│  Receives squirt payload        │
│  Runs drone routing/logistics   │
│  Handles inventory optimization │
└─────────────────────────────────┘
```

**MedIC is frontend + on-device logic only.** The Flask backend belongs to another team and handles drone optimization downstream. MedIC's responsibility ends at transmitting a well-structured squirt payload. No other backend needed.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **React Native CLI (bare)** — no Expo | Expo can't support native AI modules |
| Language | **TypeScript** (strict mode) | Type safety critical for clinical logic |
| Navigation | React Navigation v6 | Stack navigator |
| State | Zustand | Lightweight, no boilerplate |
| Styling | Central StyleSheet theme only — see rules below | Never inline, never per-component |
| On-device AI | Qwen3 via react-native-executorch | Scoring, recs, buddy, voice extraction |
| Speech-to-text | Qwen3-ASR | Offline STT — github.com/QwenLM/Qwen3-ASR |
| Text-to-speech | Kokoro TTS or Piper TTS | Offline TTS |
| Storage | AsyncStorage + MMKV | Patient records, drafts |
| Squirt output | Structured JSON → HTTP POST | To drone optimization API |
| Dev environment | Android Studio (Mac) + physical Android device | |
| Editor | Cursor + Claude | AI-assisted development |

### Why bare React Native, not Expo
Expo managed workflow cannot support:
- On-device Qwen3 via llama.cpp / ExecuTorch (requires native modules)
- Qwen3-ASR (native Android audio bridge)
- Any future BATDOK hardware integrations

Starting bare avoids a painful eject later.

### Why TypeScript
Clinical variables map to patient risk outcomes. A null GCS value silently producing the wrong risk level is a patient safety issue. TypeScript catches this at write-time. All clinical types are explicitly defined. Non-negotiable.

---

## Project Structure

```
medic/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── MarchScreen.tsx
│   │   ├── TBIScreen.tsx
│   │   ├── ReviewScreen.tsx
│   │   ├── ConfirmScreen.tsx
│   │   └── RecentPatientsScreen.tsx
│   │
│   ├── components/              ← small, single-purpose, reusable
│   │   ├── BigButton.tsx        # Primary tap target — all CTAs use this
│   │   ├── SegmentSelector.tsx  # Multi-option selector — all option groups use this
│   │   ├── NumericStepper.tsx   # +/- stepper — all numeric inputs use this
│   │   ├── RiskBadge.tsx        # Risk level display — used on Review + Recent
│   │   ├── SectionCard.tsx      # Titled card wrapper — all form sections use this
│   │   ├── DataRow.tsx          # Label + value row — used in review summary
│   │   ├── AlertBanner.tsx      # Info/warning/critical banner
│   │   ├── DronePayload.tsx     # Drone calc + kit list
│   │   ├── BurstPayload.tsx     # Squirt JSON preview
│   │   ├── VoiceFAB.tsx         # Floating voice button
│   │   └── ProgressBar.tsx      # Step indicator
│   │
│   ├── ai/
│   │   ├── qwenBridge.ts        # Qwen3 LLM — scoring, recs, buddy, extraction
│   │   ├── asrBridge.ts         # Qwen3-ASR speech-to-text
│   │   ├── ttsBridge.ts         # TTS output
│   │   └── prompts.ts           # All system prompts in one place
│   │
│   ├── api/
│   │   └── squirt.ts            # POST squirt payload to drone API
│   │
│   ├── engine/
│   │   ├── droneCalc.ts         # Poisson drone count calculator
│   │   └── payloadEncoder.ts    # Squirt message encoder
│   │
│   ├── store/
│   │   └── usePatientStore.ts   # Zustand — single source of truth
│   │
│   ├── theme/
│   │   ├── colors.ts            # All color tokens
│   │   ├── typography.ts        # All text styles
│   │   ├── spacing.ts           # All spacing/sizing constants
│   │   └── styles.ts            # Shared composed StyleSheets (cards, rows, etc.)
│   │
│   └── types/
│       └── index.ts             # All TypeScript types
│
├── android/
├── App.tsx
└── package.json
```

---

## Code Organization Rules

These rules exist because large components and scattered styles become unmaintainable fast. Cursor must follow these strictly.

### Component rules
- **One responsibility per component.** If a component has more than ~150 lines, it should be split.
- **Never build a one-off component inside a screen file.** If a UI pattern appears more than once anywhere in the app, it becomes a component in `/components`.
- **Screens are layouts, not logic.** Screens import components and wire up store + navigation. They do not contain business logic or inline styles.
- **Components receive props, read from store, or both.** They do not fetch data or call APIs directly.
- **All form inputs in this app are one of three components:** `BigButton`, `SegmentSelector`, or `NumericStepper`. Do not create new input primitives without strong justification.

### Styling rules
- **Zero inline styles.** No `style={{ color: 'red' }}` anywhere.
- **All colors come from `src/theme/colors.ts`.** Never hardcode a hex value outside that file.
- **All font sizes, weights, letter spacing come from `src/theme/typography.ts`.**
- **All padding, margin, border radius, min heights come from `src/theme/spacing.ts`.**
- **Shared patterns (cards, rows, banners) live in `src/theme/styles.ts`** as composed StyleSheets that components import and extend if needed.
- **Component-specific styles** are defined at the bottom of the component file in a local `StyleSheet.create({})` block that references theme tokens — never raw values.

### Why this matters for this app
Buttons must be large enough for gloves. Font must be readable in the dark. If sizes and colors are scattered across 20 files, one change breaks half the app. Centralizing means you can adjust "minimum button height" in one place and every screen updates.

---

## Theme

### `src/theme/colors.ts`
```typescript
export const colors = {
  bg:         '#0a0c0f',
  surface:    '#12161c',
  surface2:   '#1a2030',
  border:     '#2a3545',
  text:       '#d4e0f0',
  textDim:    '#6a8099',
  textMono:   '#8ab4c4',
  accent:     '#00c4ff',
  accentDim:  '#1a4a5a',
  green:      '#00e676',   // LOW risk
  greenDim:   '#003320',
  yellow:     '#ffd600',   // MODERATE risk
  yellowDim:  '#3a3000',
  orange:     '#ff6d00',   // HIGH risk
  orangeDim:  '#3a1800',
  red:        '#ff1744',   // CRITICAL risk
  redDim:     '#3a0010',
} as const;

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export const riskColors: Record<RiskLevel, { bg: string; border: string; text: string }> = {
  LOW:      { bg: colors.greenDim,  border: colors.green,  text: colors.green },
  MODERATE: { bg: colors.yellowDim, border: colors.yellow, text: colors.yellow },
  HIGH:     { bg: colors.orangeDim, border: colors.orange, text: colors.orange },
  CRITICAL: { bg: colors.redDim,    border: colors.red,    text: colors.red },
};
```

### `src/theme/spacing.ts`
```typescript
export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  20,
  xl:  28,
  xxl: 40,
} as const;

export const sizing = {
  buttonHeight:      88,   // min tap target — gloves
  buttonHeightSm:    64,   // secondary actions
  segmentHeight:     72,   // segment selector options
  stepperHeight:     64,   // numeric stepper
  inputHeight:       56,
  borderRadius:      8,
  borderRadiusSm:    4,
  cardPadding:       18,
} as const;
```

### `src/theme/typography.ts`
```typescript
import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.text,
    textTransform: 'uppercase',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.textDim,
    textTransform: 'uppercase',
  },
  buttonLabel: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.bg,
    textTransform: 'uppercase',
  },
  buttonSub: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.bg,
    marginTop: 4,
  },
  segmentLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  riskLevel: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  riskProb: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
  dataKey: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.textDim,
    textTransform: 'uppercase',
  },
  dataVal: {
    fontSize: 16,
    color: colors.text,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.textMono,
    lineHeight: 20,
  },
});
```

---

## Qwen3 — Roles & Architecture

Qwen3 is the intelligence layer of MedIC. It handles three distinct jobs, all running on-device:

### 1. Risk Scoring & Recommendations
After the medic completes the assessment, the structured form data is sent to Qwen3 with a clinical system prompt. Qwen returns:
- Risk level (LOW / MODERATE / HIGH / CRITICAL)
- Probability of death or severe injury within X hours
- Prioritized clinical recommendations (airway, drugs, evac, surgery)
- BP management note if TBI + other injuries present

The system prompt contains the clinical knowledge base: GCS interpretation, pupil significance, ICH predictors, MARCH protocol, drug dosing, BP interaction logic. The evidence lives in the prompt, not in hard-coded rules.

### 2. Voice Form Input (Entity Extraction)
The medic can switch any screen to voice mode. They speak naturally and Qwen extracts structured field values.

**Flow:**
```
Medic speaks freely
    → Qwen3-ASR transcribes to text
    → Qwen3 extracts structured fields matching the current screen's schema
    → UI auto-populates fields
    → Qwen3 speaks confirmation via TTS: "Got it — GCS 3, left pupil fixed, blast injury, 20 minutes ago. Confirm?"
    → Medic says "correct" or corrects specific fields
    → Fields locked in
```

**Example:**
> Medic: *"GCS is 3, pupils unequal, left one's blown, blast injury about 20 minutes ago"*
> Qwen: *"GCS 3, left pupil fixed and dilated, mechanism blast, time since injury under 30 minutes. Does that look right?"*

The system prompt for extraction includes the exact field names, types, and valid values for the current screen so Qwen knows exactly what schema to fill.

### 3. AI Buddy (Assistant)
A persistent assistant the medic can invoke at any time via the voice FAB or text input. Can:
- Guide through the exam step by step
- Answer drug dosing questions
- Flag missed or inconsistent fields
- Remind medic of MARCH steps
- Provide clinical decision support mid-exam

Two modes (Dr. Brody: sometimes can talk but not look, sometimes can look but not talk):
- **Voice mode** — Qwen3-ASR → Qwen3 → TTS
- **Text mode** — keyboard → Qwen3 → screen

### Performance
Qwen3 runs in a **background thread**, never the JS/UI thread. The UI never blocks.

Qwen is called at specific moments only:
- On "Calculate Risk" after assessment complete (~3–8 sec, show loading state)
- When voice mode is active for a screen (entity extraction)
- When AI Buddy is explicitly invoked

Qwen3-1.7B on a Snapdragon 8-series tablet: ~15–30 tokens/second. A risk response is ~100–150 tokens = 3–8 seconds. Acceptable with a loading state. Stream the response if the bridge supports it.

### Prompts
All system prompts live in **`src/ai/prompts.ts`** — one file, exported as named constants. Never inline a prompt string in a component or bridge file.

---

## Screen Flow

```
HomeScreen
├── → MarchScreen          (New Patient)
│     └── → TBIScreen
│           └── → ReviewScreen  ← Qwen scoring runs here
│                 └── → ConfirmScreen
├── → RecentPatientsScreen
└── → DroneStandaloneScreen
```

---

## Clinical Logic

### MARCH First
Before any TBI assessment, the medic completes MARCH. If a life-threatening injury is found, treat that first. Only proceed to TBI if MARCH is stable or documented.

- **M** — Massive Hemorrhage (tourniquet / wound packing)
- **A** — Airway (patent / managed / compromised)
- **R** — Respiration (normal / needle-D / chest seal / compromised)
- **C** — Circulation (systolic BP, hypothermia)
- **H** — Head / Hypothermia (other injuries present)

### TBI Assessment Inputs
These are collected in TBIScreen and passed to Qwen3 for scoring:

- GCS (Eye 1–4, Verbal 1–5, Motor 1–6)
- Pupil reactivity (both reactive / one sluggish / one fixed / both fixed)
- NPi from pupillometer if available (≥3.0 normal / 1–3 abnormal / <1 critical)
- Mechanism of injury (blast / GSW / blunt / fall / crush / unknown)
- Time since injury (<15 min / 15–60 min / 1–4 hr / >4 hr)
- Neurological progression (stable / improving / declining)
- Motor asymmetry (none / mild / hemiplegia)
- Symptoms (LOC / vomiting / seizure / abnormal posturing / severe headache)

### Drone Poisson Calculator (`src/engine/droneCalc.ts`)
Given shootdown probability `p`, calculate minimum drones `n` to guarantee ≥1 delivery at 95% confidence:

```
n = ceil( log(1 - 0.95) / log(p) )
```

Three tiers: LOW (10%), MEDIUM (50%), HIGH (90%).

### Drone Payload Contents
Auto-selected by Qwen recommendations + clinical indicators:

| Condition | Item | Weight |
|---|---|---|
| Fixed pupil / CRITICAL | Hypertonic Saline 3% 250mL | ~0.8 lbs |
| Seizure present | Midazolam 5mg | ~0.1 lbs |
| CRITICAL risk | IH Intracranial Hemorrhage Device | 1.2 lbs |
| CRITICAL risk | Auto Burr Hole Device | 2 lbs |
| TBI + other injuries | Fresh Whole Blood (insulated) | 10 lbs |
| HIGH / CRITICAL | Ketamine | ~0.2 lbs |
| HIGH / CRITICAL | Pentobarbital | ~0.2 lbs |
| Always | Standard Trauma Kit | ~3 lbs |

Split across Drone A (critical drugs/devices) and Drone B (blood/bulk) when total exceeds single drone weight limit.

---

## Squirt Payload (Burst Transmission)

Compressed JSON sent to the drone optimization API:

```json
{
  "v": "1",
  "pid": "CHARLIE-4",
  "mid": "M-102",
  "risk": "H",
  "gcs": "9",
  "pupils": "ONE-FIXED",
  "moi": "BLAST",
  "prog": "DEC",
  "drones": 5,
  "kit": ["HTS", "MIDAZ", "IHD", "BURR"],
  "bp_alert": true,
  "ts": 1742432400
}
```

Risk codes: `L` / `M` / `H` / `C`

Sent via HTTP POST to drone optimization API (`src/api/squirt.ts`). Queued locally if no comms window available.

---

## UI / UX Requirements

- **HUGE tap targets** — `sizing.buttonHeight = 88px` minimum. One action at a time. Operator wears gloves in the dark.
- **Dark mode only** — all colors from theme, background always `colors.bg`
- **No red/green only distinctions** — always pair color with text label + icon (colorblind safe)
- **One focused task per screen** — no scrolling walls of content
- **Voice + visual modes** — both work independently on every input screen
- **Device agnostic** — no assumptions about specific sensors

---

## Development Phases

**Phase 1 (now):** Full UI + screens + components + store + drone calc. Qwen stubbed out with placeholder responses. App fully navigable and demeable.

**Phase 2:** Qwen3 text mode — risk scoring + recommendations + AI Buddy text chat. On-device via react-native-executorch.

**Phase 3:** Qwen3-ASR voice form input + voice buddy. Full voice-to-voice pipeline on-device.

---

## Development Setup

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (Mac)
- Java 17
- Physical Android device or emulator (API 31+)

### Init
```bash
npx react-native init medic --template react-native-template-typescript
cd medic
npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context
npm install zustand
npm install @react-native-async-storage/async-storage react-native-mmkv
```

### Run
```bash
npx react-native run-android
```

---

## Key References

- Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- react-native-executorch: https://github.com/software-mansion/react-native-executorch
- MARCH algorithm: Tactical Combat Casualty Care (TCCC) guidelines
- GCS: Glasgow Coma Scale (Eye 1–4, Verbal 1–5, Motor 1–6)
- NPi: Neurological Pupil Index — quantitative pupillometer output
