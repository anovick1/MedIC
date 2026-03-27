export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type AssessmentMode = 'FORM' | 'VOICE';

export type MarchData = {
  hemorrhage: 'CONTROLLED' | 'UNCONTROLLED' | null;
  airway: 'PATENT' | 'COMPROMISED' | null;
  respiration: 'NORMAL' | 'COMPROMISED' | null;
  circulation: 'STABLE' | 'UNSTABLE' | null;
  hypothermia: 'NONE' | 'PRESENT' | null;
};

export type VitalsData = {
  bpSystolic: number | null;
  bpDiastolic: number | null;
  heartRate: number | null;
  oxygenSaturation: number | null;
  temperature: number | null;
};

export type NeuroData = {
  gcs: number | null;
  consciousness: 'ALERT' | 'VOICE' | 'PAIN' | 'UNRESPONSIVE' | null;
  injuryLocation: Set<'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'TOP'>;
  notes: string;
};

export type QwenRiskResult = {
  level: RiskLevel;
  probability: string;
  recommendations: string[];
  bpAlert: string | null;
  loading: boolean;
  error: string | null;
};

export type PayloadItem = {
  id: string;
  name: string;
  included: boolean;
};

export type PatientRecord = {
  id: string;
  missionId: string;
  timestamp: number;
  march: MarchData;
  vitals: VitalsData;
  neuro: NeuroData;
  risk: QwenRiskResult;
  squirtPayload: string;
  status: 'DRAFT' | 'SENT';
};
