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
  const gcs = params.neuro.gcs != null ? String(params.neuro.gcs) : 'UT';
  const marchFlags = Object.entries(params.march)
    .filter(([_, v]) => v === 'UNCONTROLLED' || v === 'COMPROMISED' || v === 'UNSTABLE' || v === 'PRESENT')
    .map(([k, v]) => `${k}_${String(v).toLowerCase()}`);

  const payload = {
    v: '2',
    pid: params.patientId,
    mid: params.missionId,
    risk: riskCode,
    gcs,
    gcs_parts: {
      eye: params.neuro.gcsEye ?? 'UNK',
      verbal: params.neuro.gcsVerbal ?? 'UNK',
      motor: params.neuro.gcsMotor ?? 'UNK',
    },
    bp: params.vitals.bpSystolic != null && params.vitals.bpDiastolic != null
      ? `${params.vitals.bpSystolic}/${params.vitals.bpDiastolic}` : 'UNK',
    hr: params.vitals.heartRate != null ? String(params.vitals.heartRate) : 'UNK',
    spo2: params.vitals.oxygenSaturation != null ? String(params.vitals.oxygenSaturation) : 'UNK',
    consciousness: params.neuro.consciousness ?? 'UNK',
    seizure: params.neuro.seizure,
    vomiting: params.neuro.vomiting,
    suspected_icp_elevation: params.neuro.suspectedICP,
    pupils: {
      right: params.neuro.rightPupil,
      left: params.neuro.leftPupil,
    },
    location: Array.from(params.neuro.injuryLocation).join('-') || 'UNK',
    shootdown: params.shootdownRisk ?? 0,
    march_flags: marchFlags,
    kit: params.payloadItems.filter(i => i.included).map(i => i.name.replace(/ /g, '')),
    ts: Math.floor(Date.now() / 1000),
  };
  return JSON.stringify(payload);
}
