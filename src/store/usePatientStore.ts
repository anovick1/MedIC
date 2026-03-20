import { create } from 'zustand';
import { MarchData, TBIData, QwenRiskResult, PatientRecord, AssessmentMode } from '../types';

const defaultTBI: TBIData = {
  gcsEye: 4, gcsVerbal: 5, gcsMotor: 6,
  pupils: null, npi: null, moi: null,
  timeSinceInjury: null, neuroProgression: null,
  motorAsymmetry: null, symptoms: new Set(),
};

const defaultMarch: MarchData = {
  hemorrhage: null, airway: null, respiration: null,
  systolicBP: 110, hypothermia: null, otherInjuries: null,
};

const defaultRisk: QwenRiskResult = {
  level: 'LOW', probability: '', recommendations: [],
  bpAlert: null, loading: false, error: null,
};

interface PatientStore {
  patientId: string;
  missionId: string;
  march: MarchData;
  tbi: TBIData;
  risk: QwenRiskResult;
  dronesNeeded: number;
  shootdownTier: 'LOW' | 'MED' | 'HIGH';
  assessmentMode: AssessmentMode;
  recentPatients: PatientRecord[];

  setPatientId: (id: string) => void;
  setMissionId: (id: string) => void;
  setMarch: (field: keyof MarchData, value: any) => void;
  setTBI: (field: keyof Omit<TBIData, 'symptoms'>, value: any) => void;
  toggleSymptom: (sym: string) => void;
  setRisk: (result: QwenRiskResult) => void;
  setDrones: (n: number) => void;
  setShootdown: (tier: 'LOW' | 'MED' | 'HIGH') => void;
  setAssessmentMode: (mode: AssessmentMode) => void;
  reset: () => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  patientId: '',
  missionId: '',
  march: defaultMarch,
  tbi: defaultTBI,
  risk: defaultRisk,
  dronesNeeded: 1,
  shootdownTier: 'MED',
  assessmentMode: 'FORM',
  recentPatients: [],

  setPatientId: (id) => set({ patientId: id }),
  setMissionId: (id) => set({ missionId: id }),
  setMarch: (field, value) => set((s) => ({ march: { ...s.march, [field]: value } })),
  setTBI: (field, value) => set((s) => ({ tbi: { ...s.tbi, [field]: value } })),
  toggleSymptom: (sym) => set((s) => {
    const next = new Set(s.tbi.symptoms);
    next.has(sym as any) ? next.delete(sym as any) : next.add(sym as any);
    return { tbi: { ...s.tbi, symptoms: next } };
  }),
  setRisk: (result) => set({ risk: result }),
  setDrones: (n) => set({ dronesNeeded: n }),
  setShootdown: (tier) => set({ shootdownTier: tier }),
  setAssessmentMode: (mode) => set({ assessmentMode: mode }),
  reset: () => set({ patientId: '', missionId: '', march: defaultMarch, tbi: defaultTBI, risk: defaultRisk, dronesNeeded: 1, assessmentMode: 'FORM' }),
}));
