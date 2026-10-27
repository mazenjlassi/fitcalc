export const KG_PER_POUND = 0.45359237;
export const POUNDS_PER_KILOGRAM = 1 / KG_PER_POUND;
export const CM_PER_INCH = 2.54;
export const INCHES_PER_FOOT = 12;

export const MEASUREMENT_RANGES = {
  age: { min: 15, max: 100 },
  heightCm: { min: 120, max: 250 },
  weightKg: { min: 30, max: 300 },
} as const;

export type MeasurementField = 'age' | 'height' | 'weight';
export type ValidationCode = 'required' | 'not-a-number' | 'out-of-range';
export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'ft-in';

export interface ValidationError {
  readonly field: MeasurementField;
  readonly code: ValidationCode;
  readonly message: string;
}

export interface FeetInches {
  readonly feet: number;
  readonly inches: number;
}

export function roundTo(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function kilogramsToPounds(kilograms: number): number {
  return kilograms * POUNDS_PER_KILOGRAM;
}

export function poundsToKilograms(pounds: number): number {
  return pounds * KG_PER_POUND;
}

export function centimetersToInches(centimeters: number): number {
  return centimeters / CM_PER_INCH;
}

export function inchesToCentimeters(inches: number): number {
  return inches * CM_PER_INCH;
}

export function feetInchesToCentimeters(feet: number, inches: number): number {
  return inchesToCentimeters(feet * INCHES_PER_FOOT + inches);
}

export function centimetersToFeetInches(centimeters: number): FeetInches {
  const totalInches = centimetersToInches(centimeters);
  let feet = Math.floor(totalInches / INCHES_PER_FOOT);
  let inches = roundTo(totalInches - feet * INCHES_PER_FOOT, 1);

  if (inches >= INCHES_PER_FOOT) {
    feet += 1;
    inches = 0;
  }

  return { feet, inches };
}

/**
 * Parses common imperial height input and returns total inches.
 *
 * Supported: `5'10"`, `5 ft 10 in`, `5′10″`, `6 ft`, `70"`, `5 10`,
 * and decimal feet such as `5.5` (five and a half feet).
 */
export function parseFeetInches(input: string): number | null {
  const cleaned = input.trim().toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ');
  if (!cleaned) {
    return null;
  }

  const feetAndInches = cleaned.match(
    /^(\d+(?:\.\d+)?)\s*(?:'|′|ft|feet)\s*(\d+(?:\.\d+)?)?\s*(?:"|″|in|in\.|inch|inches)?$/,
  );
  if (feetAndInches) {
    const feet = Number(feetAndInches[1]);
    const inches = feetAndInches[2] === undefined ? 0 : Number(feetAndInches[2]);
    return toTotalInches(feet, inches);
  }

  const inchesOnly = cleaned.match(/^(\d+(?:\.\d+)?)\s*(?:"|″|in|in\.|inch|inches)$/);
  if (inchesOnly) {
    const inches = Number(inchesOnly[1]);
    return Number.isFinite(inches) && inches > 0 ? inches : null;
  }

  const feetSpaceInches = cleaned.match(/^(\d+)\s+(\d+(?:\.\d+)?)$/);
  if (feetSpaceInches) {
    return toTotalInches(Number(feetSpaceInches[1]), Number(feetSpaceInches[2]));
  }

  const decimalFeet = cleaned.match(/^\d+(?:\.\d+)?$/);
  if (decimalFeet) {
    return toTotalInches(Number(decimalFeet[0]), 0);
  }

  return null;
}

function toTotalInches(feet: number, inches: number): number | null {
  if (!Number.isFinite(feet) || !Number.isFinite(inches)) {
    return null;
  }

  if (feet < 0 || inches < 0 || inches >= INCHES_PER_FOOT) {
    return null;
  }

  if (!Number.isInteger(feet) && inches !== 0) {
    return null;
  }

  const total = feet * INCHES_PER_FOOT + inches;
  return total > 0 ? total : null;
}

export function validateAge(value: number | null | undefined): ValidationError | null {
  return validateNumber(value, {
    field: 'age',
    min: MEASUREMENT_RANGES.age.min,
    max: MEASUREMENT_RANGES.age.max,
    requiredMessage: 'Enter your age.',
    rangeMessage: `Age must be between ${MEASUREMENT_RANGES.age.min} and ${MEASUREMENT_RANGES.age.max}.`,
  });
}

export function validateHeightCm(value: number | null | undefined): ValidationError | null {
  return validateNumber(value, {
    field: 'height',
    min: MEASUREMENT_RANGES.heightCm.min,
    max: MEASUREMENT_RANGES.heightCm.max,
    requiredMessage: 'Enter your height.',
    rangeMessage: `Height must be between ${MEASUREMENT_RANGES.heightCm.min} and ${MEASUREMENT_RANGES.heightCm.max} cm.`,
  });
}

export function validateWeightKg(value: number | null | undefined): ValidationError | null {
  return validateNumber(value, {
    field: 'weight',
    min: MEASUREMENT_RANGES.weightKg.min,
    max: MEASUREMENT_RANGES.weightKg.max,
    requiredMessage: 'Enter your weight.',
    rangeMessage: `Weight must be between ${MEASUREMENT_RANGES.weightKg.min} and ${MEASUREMENT_RANGES.weightKg.max} kg.`,
  });
}

export function validateHeightImperial(
  feet: number | null | undefined,
  inches: number | null | undefined,
): ValidationError | null {
  if (isMissing(feet) || isMissing(inches)) {
    return {
      field: 'height',
      code: 'required',
      message: 'Enter your height in feet and inches.',
    };
  }

  if (!Number.isFinite(feet) || !Number.isFinite(inches)) {
    return { field: 'height', code: 'not-a-number', message: 'Enter a number for height.' };
  }

  if (feet < 0 || inches < 0 || inches >= INCHES_PER_FOOT) {
    return {
      field: 'height',
      code: 'out-of-range',
      message: 'Inches must be between 0 and 11, and feet cannot be negative.',
    };
  }

  const centimeters = feetInchesToCentimeters(feet, inches);
  if (
    centimeters < MEASUREMENT_RANGES.heightCm.min ||
    centimeters > MEASUREMENT_RANGES.heightCm.max
  ) {
    return {
      field: 'height',
      code: 'out-of-range',
      message: 'Height must be between about 3 ft 11 in and 8 ft 2 in.',
    };
  }

  return null;
}

export function validateWeightPounds(value: number | null | undefined): ValidationError | null {
  if (isMissing(value)) {
    return { field: 'weight', code: 'required', message: 'Enter your weight.' };
  }

  if (!Number.isFinite(value)) {
    return { field: 'weight', code: 'not-a-number', message: 'Enter a number for weight.' };
  }

  return validateWeightKg(poundsToKilograms(value));
}

interface NumberRange {
  readonly field: MeasurementField;
  readonly min: number;
  readonly max: number;
  readonly requiredMessage: string;
  readonly rangeMessage: string;
}

function validateNumber(
  value: number | null | undefined,
  range: NumberRange,
): ValidationError | null {
  if (isMissing(value)) {
    return { field: range.field, code: 'required', message: range.requiredMessage };
  }

  if (!Number.isFinite(value)) {
    return {
      field: range.field,
      code: 'not-a-number',
      message: `Enter a number for ${range.field}.`,
    };
  }

  if (value < range.min || value > range.max) {
    return { field: range.field, code: 'out-of-range', message: range.rangeMessage };
  }

  return null;
}

function isMissing(value: number | null | undefined): value is null | undefined {
  return value === null || value === undefined;
}
