import {
  AssessmentStepId,
  FieldInputKind,
  InjuryLocation,
  MarchData,
  NeuroData,
  ShootdownRisk,
  VitalsData,
} from '../types';

export type AssessmentSnapshot = {
  patientId: string;
  missionId: string;
  march: MarchData;
  vitals: VitalsData;
  neuro: NeuroData;
  shootdownRisk: ShootdownRisk | null;
};

export type AssessmentField = {
  key: string;
  path: string;
  label: string;
  kind: FieldInputKind;
  required: boolean;
  prompt: string;
  confirmation: 'auto' | 'confirm';
  choices?: Array<{ label: string; value: string | number | boolean | InjuryLocation }>;
};

export type AssessmentStep = {
  id: AssessmentStepId;
  title: string;
  nextLabel: string;
  fields: AssessmentField[];
};

export const ASSESSMENT_STEPS: Record<AssessmentStepId, AssessmentStep> = {
  'patient-info': {
    id: 'patient-info',
    title: 'Patient Info',
    nextLabel: 'MARCH',
    fields: [
      {
        key: 'patientId',
        path: 'patientId',
        label: 'Patient ID',
        kind: 'text',
        required: true,
        prompt: 'State the patient identifier.',
        confirmation: 'auto',
      },
      {
        key: 'missionId',
        path: 'missionId',
        label: 'Mission ID',
        kind: 'text',
        required: true,
        prompt: 'State the mission identifier.',
        confirmation: 'auto',
      },
    ],
  },
  'march-1': {
    id: 'march-1',
    title: 'MARCH 1',
    nextLabel: 'MARCH 2',
    fields: [
      {
        key: 'hemorrhage',
        path: 'march.hemorrhage',
        label: 'Massive Hemorrhage',
        kind: 'choice',
        required: true,
        prompt: 'Massive hemorrhage. Say controlled or uncontrolled.',
        confirmation: 'confirm',
        choices: [
          { label: 'Controlled', value: 'CONTROLLED' },
          { label: 'Uncontrolled', value: 'UNCONTROLLED' },
        ],
      },
      {
        key: 'airway',
        path: 'march.airway',
        label: 'Airway',
        kind: 'choice',
        required: true,
        prompt: 'Airway. Say patent or compromised.',
        confirmation: 'confirm',
        choices: [
          { label: 'Patent', value: 'PATENT' },
          { label: 'Compromised', value: 'COMPROMISED' },
        ],
      },
      {
        key: 'respiration',
        path: 'march.respiration',
        label: 'Respiration',
        kind: 'choice',
        required: true,
        prompt: 'Respiration. Say normal or compromised.',
        confirmation: 'confirm',
        choices: [
          { label: 'Normal', value: 'NORMAL' },
          { label: 'Compromised', value: 'COMPROMISED' },
        ],
      },
    ],
  },
  'march-2': {
    id: 'march-2',
    title: 'MARCH 2',
    nextLabel: 'Triage Form',
    fields: [
      {
        key: 'circulation',
        path: 'march.circulation',
        label: 'Circulation',
        kind: 'choice',
        required: true,
        prompt: 'Circulation. Say stable or unstable.',
        confirmation: 'confirm',
        choices: [
          { label: 'Stable', value: 'STABLE' },
          { label: 'Unstable', value: 'UNSTABLE' },
        ],
      },
      {
        key: 'hypothermia',
        path: 'march.hypothermia',
        label: 'Hypothermia',
        kind: 'choice',
        required: true,
        prompt: 'Hypothermia. Say none or present.',
        confirmation: 'confirm',
        choices: [
          { label: 'None', value: 'NONE' },
          { label: 'Present', value: 'PRESENT' },
        ],
      },
    ],
  },
  'triage-1': {
    id: 'triage-1',
    title: 'Vitals 1',
    nextLabel: 'Vitals 2',
    fields: [
      {
        key: 'bpSystolic',
        path: 'vitals.bpSystolic',
        label: 'Systolic BP',
        kind: 'number',
        required: true,
        prompt: 'State the blood pressure. You can say one twenty over eighty.',
        confirmation: 'confirm',
      },
      {
        key: 'bpDiastolic',
        path: 'vitals.bpDiastolic',
        label: 'Diastolic BP',
        kind: 'number',
        required: true,
        prompt: 'State the diastolic blood pressure.',
        confirmation: 'confirm',
      },
      {
        key: 'heartRate',
        path: 'vitals.heartRate',
        label: 'Heart Rate',
        kind: 'number',
        required: true,
        prompt: 'State the heart rate in beats per minute.',
        confirmation: 'auto',
      },
    ],
  },
  'triage-2': {
    id: 'triage-2',
    title: 'Vitals 2',
    nextLabel: 'GCS Eye',
    fields: [
      {
        key: 'oxygenSaturation',
        path: 'vitals.oxygenSaturation',
        label: 'Oxygen Saturation',
        kind: 'number',
        required: true,
        prompt: 'State the oxygen saturation percentage.',
        confirmation: 'auto',
      },
      {
        key: 'temperatureC',
        path: 'vitals.temperatureC',
        label: 'Temperature',
        kind: 'decimal',
        required: true,
        prompt: 'State the temperature in Celsius.',
        confirmation: 'auto',
      },
    ],
  },
  'triage-3': {
    id: 'triage-3',
    title: 'GCS Eye',
    nextLabel: 'GCS Verbal',
    fields: [
      {
        key: 'gcsEye',
        path: 'neuro.gcsEye',
        label: 'GCS Eye',
        kind: 'choice',
        required: true,
        prompt: 'G C S eye opening. Say a score from one to four.',
        confirmation: 'confirm',
        choices: [
          { label: '4', value: 4 },
          { label: '3', value: 3 },
          { label: '2', value: 2 },
          { label: '1', value: 1 },
        ],
      },
    ],
  },
  'triage-4': {
    id: 'triage-4',
    title: 'GCS Verbal',
    nextLabel: 'GCS Motor',
    fields: [
      {
        key: 'gcsVerbal',
        path: 'neuro.gcsVerbal',
        label: 'GCS Verbal',
        kind: 'choice',
        required: true,
        prompt: 'G C S verbal response. Say a score from one to five.',
        confirmation: 'confirm',
        choices: [
          { label: '5', value: 5 },
          { label: '4', value: 4 },
          { label: '3', value: 3 },
          { label: '2', value: 2 },
          { label: '1', value: 1 },
        ],
      },
    ],
  },
  'triage-5': {
    id: 'triage-5',
    title: 'GCS Motor',
    nextLabel: 'Symptoms',
    fields: [
      {
        key: 'gcsMotor',
        path: 'neuro.gcsMotor',
        label: 'GCS Motor',
        kind: 'choice',
        required: true,
        prompt: 'G C S motor response. Say a score from one to six.',
        confirmation: 'confirm',
        choices: [
          { label: '6', value: 6 },
          { label: '5', value: 5 },
          { label: '4', value: 4 },
          { label: '3', value: 3 },
          { label: '2', value: 2 },
          { label: '1', value: 1 },
        ],
      },
    ],
  },
  'triage-6': {
    id: 'triage-6',
    title: 'Symptoms',
    nextLabel: 'Injury Location',
    fields: [
      {
        key: 'seizure',
        path: 'neuro.seizure',
        label: 'Seizure',
        kind: 'boolean',
        required: true,
        prompt: 'Seizure. Say yes or no.',
        confirmation: 'confirm',
      },
      {
        key: 'vomiting',
        path: 'neuro.vomiting',
        label: 'Vomiting',
        kind: 'boolean',
        required: true,
        prompt: 'Vomiting. Say yes or no.',
        confirmation: 'confirm',
      },
      {
        key: 'headExternalHemorrhage',
        path: 'neuro.headExternalHemorrhage',
        label: 'Head External Hemorrhage',
        kind: 'boolean',
        required: true,
        prompt: 'Head external hemorrhage. Say yes or no.',
        confirmation: 'confirm',
      },
      {
        key: 'suspectedICP',
        path: 'neuro.suspectedICP',
        label: 'Suspected ICP',
        kind: 'boolean',
        required: true,
        prompt: 'Suspected I C P. Say yes or no.',
        confirmation: 'confirm',
      },
    ],
  },
  'triage-7': {
    id: 'triage-7',
    title: 'Injury Location',
    nextLabel: 'Shootdown Risk',
    fields: [
      {
        key: 'injuryLocation',
        path: 'neuro.injuryLocation',
        label: 'Injury Location',
        kind: 'multi-choice',
        required: true,
        prompt: 'State the injury location. You can say front, back, left, right, or top.',
        confirmation: 'confirm',
        choices: [
          { label: 'Front', value: 'FRONT' },
          { label: 'Back', value: 'BACK' },
          { label: 'Left', value: 'LEFT' },
          { label: 'Right', value: 'RIGHT' },
          { label: 'Top', value: 'TOP' },
        ],
      },
      {
        key: 'notes',
        path: 'neuro.notes',
        label: 'Notes',
        kind: 'text',
        required: false,
        prompt: 'Add any notes, or say skip.',
        confirmation: 'auto',
      },
    ],
  },
  'triage-8': {
    id: 'triage-8',
    title: 'Shootdown Risk',
    nextLabel: 'Review Data',
    fields: [
      {
        key: 'shootdownRisk',
        path: 'shootdownRisk',
        label: 'Shootdown Risk',
        kind: 'choice',
        required: true,
        prompt: 'State the drone shootdown risk. Say zero, ten, twenty five, fifty, seventy five, or ninety percent.',
        confirmation: 'confirm',
        choices: [
          { label: '0', value: 0 },
          { label: '10', value: 10 },
          { label: '25', value: 25 },
          { label: '50', value: 50 },
          { label: '75', value: 75 },
          { label: '90', value: 90 },
        ],
      },
    ],
  },
};

export function getTriageStepId(page: number): AssessmentStepId {
  return (`triage-${page}` as AssessmentStepId);
}

