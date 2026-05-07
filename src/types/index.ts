export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type AssessmentMode = 'FORM' | 'VOICE';
export type GcsValue = number | 'UNTESTABLE';
export type SeizureStatus = 'NONE' | 'ONE' | 'MORE_THAN_ONE' | 'STATUS_EPILEPTICUS';
export type VomitingStatus = 'NONE' | 'ONE' | 'MULTIPLE' | 'CONTINUOUS';
export type PupilReactivity = 'NORMAL' | 'SLUGGISH' | 'UNREACTIVE';

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
  gcs: number | null;
  gcsEye: GcsValue | null;
  gcsVerbal: GcsValue | null;
  gcsMotor: GcsValue | null;
  consciousness: 'ALERT' | 'VOICE' | 'PAIN' | 'UNRESPONSIVE' | null;
  seizure: SeizureStatus;
  vomiting: VomitingStatus;
  headExternalHemorrhage: boolean;
  suspectedICP: boolean;
  rightPupil: PupilReactivity;
  leftPupil: PupilReactivity;
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
