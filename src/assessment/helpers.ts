import { ASSESSMENT_STEPS, AssessmentField, AssessmentSnapshot, AssessmentStep } from './definitions';
import { AssessmentStepId } from '../types';

function getValueAtPath(snapshot: AssessmentSnapshot, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') {
      return undefined;
    }
    return (acc as Record<string, unknown>)[key];
  }, snapshot as unknown);
}

function isFieldFilled(field: AssessmentField, value: unknown): boolean {
  if (!field.required) {
    return true;
  }
  if (value == null) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (value instanceof Set) {
    return value.size > 0;
  }
  return true;
}

export function getStep(stepId: AssessmentStepId): AssessmentStep {
  return ASSESSMENT_STEPS[stepId];
}

export function isStepComplete(stepId: AssessmentStepId, snapshot: AssessmentSnapshot): boolean {
  const step = getStep(stepId);
  return step.fields.every((field) => isFieldFilled(field, getValueAtPath(snapshot, field.path)));
}

export function getNextMissingField(
  stepId: AssessmentStepId,
  snapshot: AssessmentSnapshot,
): AssessmentField | null {
  const step = getStep(stepId);
  return step.fields.find((field) => !isFieldFilled(field, getValueAtPath(snapshot, field.path))) ?? null;
}

export function getStepSummary(stepId: AssessmentStepId, snapshot: AssessmentSnapshot): string {
  const step = getStep(stepId);
  const parts = step.fields
    .filter((field) => field.required)
    .map((field) => {
      const value = getValueAtPath(snapshot, field.path);
      if (value instanceof Set) {
        return `${field.label}: ${Array.from(value).join(', ') || 'none'}`;
      }
      return `${field.label}: ${String(value)}`;
    });
  return parts.join('. ');
}

