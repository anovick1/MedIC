import { MarchData, VitalsData, NeuroData, QwenRiskResult, PayloadItem } from '../types';

export function encodeSquirt(params: {
  patientId: string;
  missionId: string;
  march: MarchData;
  vitals: VitalsData;
  neuro: NeuroData;
  risk: QwenRiskResult;
  shootdownRisk: number | null;
  payloadItems: PayloadItem[];
}): string {
  const riskCode = { LOW: 'L', MODERATE: 'M', HIGH: 'H', CRITICAL: 'C' }[params.risk.level];
  const gcsTotal = [params.neuro.gcsEye, params.neuro.gcsVerbal, params.neuro.gcsMotor]
    .reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const marchFlags = Object.entries(params.march)
    .filter(([_, v]) => v === 'UNCONTROLLED' || v === 'COMPROMISED' || v === 'UNSTABLE' || v === 'PRESENT')
    .map(([k, v]) => `${k}_${String(v).toLowerCase()}`);

  const payload = {
    v: '2',
    pid: params.patientId,
    mid: params.missionId,
    risk: riskCode,
    gcs: gcsTotal > 0 ? String(gcsTotal) : 'UNK',
    bp: params.vitals.bpSystolic != null && params.vitals.bpDiastolic != null
      ? `${params.vitals.bpSystolic}/${params.vitals.bpDiastolic}` : 'UNK',
    hr: params.vitals.heartRate != null ? String(params.vitals.heartRate) : 'UNK',
    spo2: params.vitals.oxygenSaturation != null ? String(params.vitals.oxygenSaturation) : 'UNK',
    consciousness: params.neuro.consciousness ?? 'UNK',
    location: Array.from(params.neuro.injuryLocation).join('-') || 'UNK',
    shootdown: params.shootdownRisk ?? 0,
    march_flags: marchFlags,
    kit: params.payloadItems.filter(i => i.included).map(i => i.name.replace(/ /g, '')),
    ts: Math.floor(Date.now() / 1000),
  };
  return JSON.stringify(payload);
}
