import { AssessmentField } from './definitions';
import { ParsedFieldResult, SpeechCommand, InjuryLocation, ShootdownRisk } from '../types';

const COMMAND_PATTERNS: Array<[SpeechCommand, RegExp]> = [
  ['repeat', /\b(repeat|say again)\b/i],
  ['skip', /\b(skip)\b/i],
  ['back', /\b(go back|back)\b/i],
  ['stop', /\b(stop|cancel)\b/i],
  ['correct', /\b(correct|change that)\b/i],
  ['next', /\b(next|continue)\b/i],
];

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  twentyfive: 25,
  'twenty-five': 25,
  twentyfivepercent: 25,
  twentyfivepercentage: 25,
  seventyfive: 75,
  'seventy-five': 75,
};

function parseWordNumberSequence(tokens: string[]): number | null {
  if (tokens.length === 0) {
    return null;
  }

  if (tokens.length === 1) {
    return NUMBER_WORDS[tokens[0]] ?? null;
  }

  if (tokens.length === 2) {
    const [first, second] = tokens;
    const firstValue = NUMBER_WORDS[first];
    const secondValue = NUMBER_WORDS[second];
    if (firstValue != null && secondValue != null) {
      if (firstValue >= 20 && firstValue % 10 === 0 && secondValue < 10) {
        return firstValue + secondValue;
      }
      if (firstValue > 0 && firstValue < 10 && secondValue >= 10) {
        return firstValue * 100 + secondValue;
      }
    }
  }

  if (tokens.length === 3) {
    const [first, second, third] = tokens;
    const secondValue = NUMBER_WORDS[second];
    const thirdValue = NUMBER_WORDS[third];
    if (NUMBER_WORDS[first] === 1 && secondValue != null && thirdValue != null) {
      return 100 + secondValue + thirdValue;
    }
  }

  return null;
}

function normalizeTranscript(transcript: string): string {
  return transcript
    .trim()
    .toLowerCase()
    .replace(/[,%]/g, '')
    .replace(/\s+/g, ' ');
}

function parseIntegerValue(transcript: string): number | null {
  const normalized = normalizeTranscript(transcript);
  const sanitized = normalized.replace(/\b(percent|percentage)\b/g, '').replace(/\s+/g, ' ').trim();
  const direct = sanitized.match(/-?\d+/);
  if (direct) {
    return Number.parseInt(direct[0], 10);
  }
  const compact = sanitized.replace(/\s+/g, '');
  return NUMBER_WORDS[compact] ?? NUMBER_WORDS[sanitized] ?? parseWordNumberSequence(sanitized.split(' '));
}

function parseDecimalValue(transcript: string): number | null {
  const normalized = normalizeTranscript(transcript);
  const direct = normalized.match(/-?\d+(\.\d+)?/);
  if (direct) {
    return Number.parseFloat(direct[0]);
  }
  return null;
}

function parseBooleanValue(transcript: string): boolean | null {
  const normalized = normalizeTranscript(transcript);
  if (/\b(yes|present|positive|true)\b/.test(normalized)) {
    return true;
  }
  if (/\b(no|none|negative|false)\b/.test(normalized)) {
    return false;
  }
  return null;
}

function parseBloodPressure(transcript: string): { bpSystolic: number; bpDiastolic: number } | null {
  const normalized = normalizeTranscript(transcript);
  const match = normalized.match(/(\d+)\s+(over|\/)\s+(\d+)/);
  if (match) {
    return {
      bpSystolic: Number.parseInt(match[1], 10),
      bpDiastolic: Number.parseInt(match[3], 10),
    };
  }

  const parts = normalized.split(/\bover\b|\//).map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) {
    return null;
  }

  const systolic = parseIntegerValue(parts[0]);
  const diastolic = parseIntegerValue(parts[1]);
  if (systolic == null || diastolic == null) {
    return null;
  }

  return { bpSystolic: systolic, bpDiastolic: diastolic };
}

function parseChoice(field: AssessmentField, transcript: string): string | number | boolean | null {
  const normalized = normalizeTranscript(transcript);
  const directNumber = parseIntegerValue(transcript);
  for (const choice of field.choices ?? []) {
    if (typeof choice.value === 'number' && directNumber === choice.value) {
      return choice.value;
    }
    if (typeof choice.value === 'boolean') {
      const parsedBool = parseBooleanValue(transcript);
      if (parsedBool === choice.value) {
        return choice.value;
      }
    }
    const choiceLabel = choice.label.toLowerCase();
    const choiceValue = String(choice.value).toLowerCase();
    if (normalized.includes(choiceLabel) || normalized.includes(choiceValue.replace(/_/g, ' '))) {
      return choice.value;
    }
  }
  return null;
}

function parseLocations(transcript: string): Set<InjuryLocation> {
  const normalized = normalizeTranscript(transcript);
  const found = new Set<InjuryLocation>();
  (['front', 'back', 'left', 'right', 'top'] as const).forEach((value) => {
    if (normalized.includes(value)) {
      found.add(value.toUpperCase() as InjuryLocation);
    }
  });
  return found;
}

export function parseSpeechCommand(transcript: string): SpeechCommand | null {
  return COMMAND_PATTERNS.find(([, pattern]) => pattern.test(transcript))?.[0] ?? null;
}

export function parseFieldTranscript(
  field: AssessmentField,
  transcript: string,
): Record<string, ParsedFieldResult> | null {
  const trimmed = transcript.trim();
  if (!trimmed) {
    return null;
  }

  if (field.key === 'bpSystolic') {
    const bp = parseBloodPressure(trimmed);
    if (bp) {
      return {
        bpSystolic: { value: bp.bpSystolic, confidence: 0.95, needsConfirmation: true },
        bpDiastolic: { value: bp.bpDiastolic, confidence: 0.95, needsConfirmation: true },
      };
    }
  }

  if (field.kind === 'number') {
    const value = parseIntegerValue(trimmed);
    return value == null ? null : { [field.key]: { value, confidence: 0.9 } };
  }

  if (field.kind === 'decimal') {
    const value = parseDecimalValue(trimmed);
    return value == null ? null : { [field.key]: { value, confidence: 0.9 } };
  }

  if (field.kind === 'boolean') {
    const value = parseBooleanValue(trimmed);
    return value == null ? null : { [field.key]: { value, confidence: 0.85, needsConfirmation: true } };
  }

  if (field.kind === 'choice') {
    const value = parseChoice(field, trimmed);
    return value == null ? null : { [field.key]: { value, confidence: 0.85, needsConfirmation: field.confirmation === 'confirm' } };
  }

  if (field.kind === 'multi-choice') {
    const locations = parseLocations(trimmed);
    return locations.size === 0
      ? null
      : { [field.key]: { value: locations, confidence: 0.8, needsConfirmation: true } };
  }

  if (field.key === 'notes' && /\bskip\b/i.test(trimmed)) {
    return { notes: { value: '', confidence: 1 } };
  }

  if (field.key === 'shootdownRisk') {
    const value = parseIntegerValue(trimmed) as ShootdownRisk | null;
    const allowed: ShootdownRisk[] = [0, 10, 25, 50, 75, 90];
    return value != null && allowed.includes(value)
      ? { shootdownRisk: { value, confidence: 0.9, needsConfirmation: true } }
      : null;
  }

  return { [field.key]: { value: trimmed, confidence: 0.8 } };
}
