import { create } from 'zustand';
import { MarchData, VitalsData, NeuroData, QwenRiskResult, PayloadItem, AssessmentMode } from '../types';
import { saveDraft as storageSaveDraft, saveRequest as storageSaveRequest, DraftRecord, RequestRecord } from '../storage/storage';
import { encodeSquirt } from '../engine/payloadEncoder';

const defaultMarch: MarchData = {
  hemorrhage: 'CONTROLLED', airway: 'PATENT', respiration: 'NORMAL',
  circulation: 'STABLE', hypothermia: 'NONE',
};

const defaultVitals: VitalsData = {
  bpSystolic: null, bpDiastolic: null, heartRate: null,
  oxygenSaturation: null, temperatureC: null,
};

const defaultNeuro: NeuroData = {
  gcs: 15,
  gcsEye: 4,
  gcsVerbal: 5,
  gcsMotor: 6,
  consciousness: 'ALERT',
  seizure: 'NONE',
  vomiting: 'NONE',
  headExternalHemorrhage: false,
  suspectedICP: false,
  rightPupil: 'NORMAL',
  leftPupil: 'NORMAL',
  injuryLocation: new Set(),
  notes: '',
};

const defaultRisk: QwenRiskResult = {
  level: 'LOW', probability: '', recommendations: [],
  bpAlert: null, loading: false, error: null,
};

interface PatientStore {
  patientId: string;
  missionId: string;
  assessmentMode: AssessmentMode;
  march: MarchData;
  vitals: VitalsData;
  neuro: NeuroData;
  shootdownRisk: 0 | 10 | 25 | 50 | 75 | 90 | null;
  risk: QwenRiskResult;
  payloadItems: PayloadItem[];
  isDraft: boolean;
  lastSaved: number | null;
  currentDraftId: string | null;
  lastPage: number;

  setPatientId: (id: string) => void;
  setMissionId: (id: string) => void;
  setAssessmentMode: (mode: AssessmentMode) => void;
  setMarch: (field: keyof MarchData, value: any) => void;
  setVitals: (field: keyof VitalsData, value: any) => void;
  setNeuro: (field: keyof NeuroData, value: any) => void;
  toggleInjuryLocation: (loc: 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'TOP') => void;
  setShootdownRisk: (risk: 0 | 10 | 25 | 50 | 75 | 90 | null) => void;
  setRisk: (result: QwenRiskResult) => void;
  setPayloadItems: (items: PayloadItem[]) => void;
  removePayloadItem: (id: string) => void;
  setCurrentDraftId: (id: string | null) => void;
  setLastPage: (page: number) => void;
  saveDraftToStorage: () => Promise<void>;
  loadDraftIntoStore: (draft: DraftRecord) => void;
  loadRequestIntoStore: (request: RequestRecord) => void;
  saveRequestToStorage: () => Promise<void>;
  reset: () => void;
}

function buildMarchFlags(march: MarchData): string[] {
  const flags: string[] = [];
  const entries = Object.entries(march) as Array<[string, string | null]>;
  for (const [key, val] of entries) {
    if (val === 'UNCONTROLLED' || val === 'COMPROMISED' || val === 'UNSTABLE' || val === 'PRESENT') {
      flags.push(`${key}_${val.toLowerCase()}`);
    }
  }
  return flags;
}

function serializeSnapshot(s: PatientStore): string {
  return JSON.stringify({
    patientId: s.patientId,
    missionId: s.missionId,
    assessmentMode: s.assessmentMode,
    march: s.march,
    vitals: s.vitals,
    neuro: { ...s.neuro, injuryLocation: Array.from(s.neuro.injuryLocation) },
    shootdownRisk: s.shootdownRisk,
    risk: s.risk,
    payloadItems: s.payloadItems,
  });
}

function hydrateSnapshot(data: any) {
  const vitals = { ...defaultVitals, ...(data.vitals ?? {}) };
  if (vitals.temperatureC == null && data.vitals?.temperature != null) {
    vitals.temperatureC = data.vitals.temperature;
  }

  return {
    patientId: data.patientId ?? '',
    missionId: data.missionId ?? '',
    assessmentMode: data.assessmentMode ?? 'FORM',
    march: { ...defaultMarch, ...(data.march ?? {}) },
    vitals,
    neuro: {
      ...defaultNeuro,
      ...(data.neuro ?? {}),
      injuryLocation: new Set(data.neuro?.injuryLocation ?? []),
    },
    shootdownRisk: data.shootdownRisk ?? null,
    risk: data.risk ?? defaultRisk,
    payloadItems: data.payloadItems ?? [],
  };
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  patientId: '',
  missionId: '',
  assessmentMode: 'FORM',
  march: defaultMarch,
  vitals: defaultVitals,
  neuro: defaultNeuro,
  shootdownRisk: null,
  risk: defaultRisk,
  payloadItems: [],
  isDraft: false,
  lastSaved: null,
  currentDraftId: null,
  lastPage: 1,

  setPatientId: (id) => set({ patientId: id }),
  setMissionId: (id) => set({ missionId: id }),
  setAssessmentMode: (mode) => set({ assessmentMode: mode }),
  setMarch: (field, value) => set((s) => ({ march: { ...s.march, [field]: value } })),
  setVitals: (field, value) => set((s) => ({ vitals: { ...s.vitals, [field]: value } })),
  setNeuro: (field, value) => set((s) => ({ neuro: { ...s.neuro, [field]: value } })),
  toggleInjuryLocation: (loc) => set((s) => {
    const next = new Set(s.neuro.injuryLocation);
    next.has(loc) ? next.delete(loc) : next.add(loc);
    return { neuro: { ...s.neuro, injuryLocation: next } };
  }),
  setShootdownRisk: (risk) => set({ shootdownRisk: risk }),
  setRisk: (result) => set({ risk: result }),
  setPayloadItems: (items) => set({ payloadItems: items }),
  removePayloadItem: (id) => set((s) => ({
    payloadItems: s.payloadItems.map((item) =>
      item.id === id ? { ...item, included: false } : item
    ),
  })),
  setCurrentDraftId: (id) => set({ currentDraftId: id }),
  setLastPage: (page) => set({ lastPage: page }),

  saveDraftToStorage: async () => {
    const s = get();
    const id = s.currentDraftId ?? `draft_${Date.now()}`;
    const snapshot = serializeSnapshot(s);
    const draft: DraftRecord = {
      id,
      patientId: s.patientId,
      missionId: s.missionId,
      lastSaved: Date.now(),
      lastPage: s.lastPage,
      snapshot,
    };
    await storageSaveDraft(draft);
    set({ currentDraftId: id, isDraft: true, lastSaved: Date.now() });
  },

  loadDraftIntoStore: (draft) => {
    try {
      const data = JSON.parse(draft.snapshot);
      set({
        ...hydrateSnapshot(data),
        currentDraftId: draft.id,
        lastPage: draft.lastPage,
        isDraft: true,
        lastSaved: draft.lastSaved,
      });
    } catch (e) {
      console.warn('loadDraftIntoStore: parse failed', e);
    }
  },

  loadRequestIntoStore: (request) => {
    if (!request.snapshot) return;
    try {
      const data = JSON.parse(request.snapshot);
      set({
        ...hydrateSnapshot(data),
        currentDraftId: null,
        lastPage: 1,
        isDraft: false,
        lastSaved: null,
      });
    } catch (e) {
      console.warn('loadRequestIntoStore: parse failed', e);
    }
  },

  saveRequestToStorage: async () => {
    const s = get();
    const squirt = encodeSquirt({
      patientId: s.patientId,
      missionId: s.missionId,
      march: s.march,
      vitals: s.vitals,
      neuro: s.neuro,
      risk: s.risk,
      shootdownRisk: s.shootdownRisk,
      payloadItems: s.payloadItems,
    });
    const request: RequestRecord = {
      id: `request_${Date.now()}`,
      patientId: s.patientId,
      missionId: s.missionId,
      sentAt: Date.now(),
      riskLevel: s.risk.level,
      riskProbability: s.risk.probability,
      squirtPayload: squirt,
      payloadItems: s.payloadItems.filter((i) => i.included).map((i) => i.name),
      marchFlags: buildMarchFlags(s.march),
      shootdownRisk: s.shootdownRisk,
      vitalsSnapshot: JSON.stringify(s.vitals),
      snapshot: serializeSnapshot(s),
    };
    await storageSaveRequest(request);
  },

  reset: () => set({
    patientId: '', missionId: '', assessmentMode: 'FORM',
    march: defaultMarch, vitals: defaultVitals, neuro: defaultNeuro,
    shootdownRisk: null, risk: defaultRisk, payloadItems: [],
    isDraft: false, lastSaved: null, currentDraftId: null, lastPage: 1,
  }),
}));
