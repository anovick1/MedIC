// TODO: Phase 2 — replace stub with react-native-executorch Qwen3 integration
import { TBIData, MarchData, QwenRiskResult } from '../types';

export async function assessRisk(tbi: TBIData, march: MarchData): Promise<QwenRiskResult> {
  // Stub — returns placeholder for Phase 1 UI development
  await new Promise(res => setTimeout(res, 2000)); // simulate latency
  return {
    level: 'HIGH',
    probability: '~60% risk of severe injury or death without intervention within 2–4 hours',
    recommendations: [
      'Secure airway — GCS indicates impaired consciousness',
      'Initiate hyperosmolar therapy: Hypertonic saline 250mL bolus',
      'Priority evacuation — request window immediately',
    ],
    bpAlert: march.otherInjuries !== 'NONE'
      ? 'TBI + other injuries: Target systolic ~120 mmHg for cerebral perfusion. Accept re-bleeding risk over cerebral ischemia.'
      : null,
    loading: false,
    error: null,
  };
}

export async function extractFields(transcript: string, screenSchema: string): Promise<Record<string, any>> {
  // TODO: Phase 2 — Qwen3 entity extraction from voice transcript
  // screenSchema is a JSON string describing valid fields + values for the current screen
  await new Promise(res => setTimeout(res, 1500));
  return {}; // stub returns empty — UI stays as-is
}

export async function askBuddy(message: string, context: string): Promise<string> {
  // TODO: Phase 2 — Qwen3 AI Buddy response
  await new Promise(res => setTimeout(res, 1000));
  return 'AI Buddy active in Phase 2. Your message: ' + message;
}
