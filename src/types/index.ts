export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type AssessmentMode = 'FORM' | 'VOICE';
export type InjuryLocation = 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'TOP';
export type ShootdownRisk = 0 | 10 | 25 | 50 | 75 | 90;

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
  temperatureC: number | null;
};

export type NeuroData = {
  gcsEye: number | null;
  gcsVerbal: number | null;
  gcsMotor: number | null;
  consciousness: 'ALERT' | 'VOICE' | 'PAIN' | 'UNRESPONSIVE' | null;
  seizure: boolean | null;
  vomiting: boolean | null;
  headExternalHemorrhage: boolean | null;
  suspectedICP: boolean | null;
  injuryLocation: Set<InjuryLocation>;
  notes: string;
};

export type AssessmentStepId =
  | 'patient-info'
  | 'march-1'
  | 'march-2'
  | 'triage-1'
  | 'triage-2'
  | 'triage-3'
  | 'triage-4'
  | 'triage-5'
  | 'triage-6'
  | 'triage-7'
  | 'triage-8';

export type FieldInputKind =
  | 'text'
  | 'number'
  | 'decimal'
  | 'choice'
  | 'boolean'
  | 'multi-choice';

export type SpeechCommand =
  | 'repeat'
  | 'skip'
  | 'back'
  | 'stop'
  | 'correct'
  | 'next';

export type ParsedFieldResult = {
  value: unknown;
  confidence: number;
  needsConfirmation?: boolean;
  clarification?: string;
};

export type VoiceSessionState = {
  enabled: boolean;
  available: boolean;
  listening: boolean;
  currentStepId: AssessmentStepId | null;
  currentFieldKey: string | null;
  lastPrompt: string;
  lastTranscript: string;
  awaitingConfirmation: boolean;
  error: string | null;
};

export type AutoAdvanceState = {
  active: boolean;
  countdownMs: number | null;
  nextStepLabel: string | null;
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
