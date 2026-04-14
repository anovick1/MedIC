import { describe, expect, it } from '@jest/globals';
import { getNextMissingField, isStepComplete } from '../src/assessment/helpers';
import { parseFieldTranscript, parseSpeechCommand } from '../src/assessment/parsers';
import { ASSESSMENT_STEPS, AssessmentSnapshot } from '../src/assessment/definitions';

function buildSnapshot(overrides: Partial<AssessmentSnapshot> = {}): AssessmentSnapshot {
  return {
    patientId: '',
    missionId: '',
    march: {
      hemorrhage: null,
      airway: null,
      respiration: null,
      circulation: null,
      hypothermia: null,
    },
    vitals: {
      bpSystolic: null,
      bpDiastolic: null,
      heartRate: null,
      oxygenSaturation: null,
      temperatureC: null,
    },
    neuro: {
      gcsEye: null,
      gcsVerbal: null,
      gcsMotor: null,
      consciousness: null,
      seizure: null,
      vomiting: null,
      headExternalHemorrhage: null,
      suspectedICP: null,
      injuryLocation: new Set(),
      notes: '',
    },
    shootdownRisk: null,
    ...overrides,
  };
}

describe('assessment speech parsing', () => {
  it('parses blood pressure with one utterance', () => {
    const field = ASSESSMENT_STEPS['triage-1'].fields[0];
    const parsed = parseFieldTranscript(field, 'one twenty over eighty');
    expect(parsed?.bpSystolic.value).toBe(120);
    expect(parsed?.bpDiastolic.value).toBe(80);
  });

  it('parses yes and no symptom answers', () => {
    const seizureField = ASSESSMENT_STEPS['triage-6'].fields[0];
    const vomitingField = ASSESSMENT_STEPS['triage-6'].fields[1];
    expect(parseFieldTranscript(seizureField, 'yes')?.seizure.value).toBe(true);
    expect(parseFieldTranscript(vomitingField, 'no')?.vomiting.value).toBe(false);
  });

  it('parses multiple injury locations', () => {
    const field = ASSESSMENT_STEPS['triage-7'].fields[0];
    const parsed = parseFieldTranscript(field, 'left and top');
    expect(parsed?.injuryLocation.value).toEqual(new Set(['LEFT', 'TOP']));
  });

  it('parses discrete shootdown risk values', () => {
    const field = ASSESSMENT_STEPS['triage-8'].fields[0];
    expect(parseFieldTranscript(field, 'seventy five percent')?.shootdownRisk.value).toBe(75);
    expect(parseFieldTranscript(field, 'thirty percent')).toBeNull();
  });

  it('detects common spoken commands', () => {
    expect(parseSpeechCommand('go back')).toBe('back');
    expect(parseSpeechCommand('repeat that')).toBe('repeat');
    expect(parseSpeechCommand('continue')).toBe('next');
  });
});

describe('assessment step completion', () => {
  it('finds the next missing patient-info field', () => {
    const snapshot = buildSnapshot({ patientId: 'ALPHA-1' });
    expect(getNextMissingField('patient-info', snapshot)?.key).toBe('missionId');
  });

  it('marks a triage page complete only when required values are present', () => {
    const incomplete = buildSnapshot();
    const complete = buildSnapshot({
      vitals: {
        bpSystolic: 120,
        bpDiastolic: 80,
        heartRate: 90,
        oxygenSaturation: null,
        temperatureC: null,
      },
    });

    expect(isStepComplete('triage-1', incomplete)).toBe(false);
    expect(isStepComplete('triage-1', complete)).toBe(true);
  });
});
