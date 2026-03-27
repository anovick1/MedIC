// TODO: Phase 2 — replace stub with react-native-executorch Qwen3 integration
import { VitalsData, NeuroData, MarchData, QwenRiskResult, PayloadItem } from '../types';

export async function assessRisk(
  vitals: VitalsData,
  neuro: NeuroData,
  march: MarchData,
  shootdownRisk: number | null
): Promise<QwenRiskResult & { payloadItems: PayloadItem[] }> {
  await new Promise(res => setTimeout(res, 2000));
  return {
    level: 'HIGH',
    probability: '~60% risk of severe injury or death without intervention within 2–4 hours',
    recommendations: [
      'Secure airway — GCS indicates impaired consciousness',
      'Initiate hyperosmolar therapy: Hypertonic saline 250mL bolus',
      'Priority evacuation — request window immediately',
    ],
    bpAlert: march.hemorrhage === 'UNCONTROLLED'
      ? 'Active hemorrhage: Target systolic ~120 mmHg for cerebral perfusion.'
      : null,
    loading: false,
    error: null,
    payloadItems: [
      { id: '1', name: 'Saline', included: true },
      { id: '2', name: 'Blood', included: true },
      { id: '3', name: 'Ice Packs', included: true },
      { id: '4', name: 'Heat Lamps', included: true },
    ],
  };
}

export async function extractFields(transcript: string, screenSchema: string): Promise<Record<string, any>> {
  // TODO: Phase 2 — Qwen3 entity extraction from voice transcript
  await new Promise(res => setTimeout(res, 1500));
  return {};
}

export async function askBuddy(message: string, context: string): Promise<string> {
  // TODO: Phase 2 — Qwen3 AI Buddy response
  await new Promise(res => setTimeout(res, 1000));
  return 'AI Buddy active in Phase 2. Your message: ' + message;
}
