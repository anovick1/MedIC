export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type ShootdownTier = 'LOW' | 'MED' | 'HIGH';

export type MarchData = {
  hemorrhage: 'NO' | 'APPLIED' | 'UNCONTROLLED' | null;
  airway: 'PATENT' | 'MANAGED' | 'COMPROMISED' | null;
  respiration: 'NORMAL' | 'NEEDLE-D' | 'CHEST-SEAL' | 'COMPROMISED' | null;
  systolicBP: number;
  hypothermia: 'NO' | 'MILD' | 'SEVERE' | null;
  otherInjuries: 'NONE' | 'SPINAL' | 'BURNS' | 'MULTIPLE' | null;
};

export type TBIData = {
  gcsEye: number;
  gcsVerbal: number;
  gcsMotor: number;
  pupils: 'BOTH-REACTIVE' | 'ONE-SLUGGISH' | 'ONE-FIXED' | 'BOTH-FIXED' | null;
  npi: 'NA' | 'NORMAL' | 'ABNORMAL' | 'CRITICAL' | null;
  moi: 'BLAST' | 'GSW' | 'BLUNT' | 'FALL' | 'CRUSH' | 'UNKNOWN' | null;
  timeSinceInjury: 'LT15' | '15-60' | '1-4H' | 'GT4H' | null;
  neuroProgression: 'STABLE' | 'IMPROVING' | 'DECLINING' | null;
  motorAsymmetry: 'NONE' | 'MILD' | 'HEMIPLEGIA' | null;
  symptoms: Set<'LOC' | 'VOMIT' | 'SEIZURE' | 'POSTURING' | 'HEADACHE'>;
};

export type QwenRiskResult = {
  level: RiskLevel;
  probability: string;      // e.g. "~65% risk of severe injury within 2-4 hours"
  recommendations: string[];
  bpAlert: string | null;
  loading: boolean;
  error: string | null;
};

export type DroneItem = {
  name: string;
  weightLbs: number;
  priority: 'CRITICAL' | 'STANDARD';
  drone: 'A' | 'B';
};

export type PatientRecord = {
  id: string;
  missionId: string;
  timestamp: number;
  march: MarchData;
  tbi: TBIData;
  risk: QwenRiskResult;
  dronesNeeded: number;
  squirtPayload: string;
  status: 'DRAFT' | 'SENT';
};
