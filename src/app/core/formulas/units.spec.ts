import {
  centimetersToFeetInches,
  centimetersToInches,
  feetInchesToCentimeters,
  inchesToCentimeters,
  kilogramsToPounds,
  parseFeetInches,
  poundsToKilograms,
  validateAge,
  validateHeightCm,
  validateHeightImperial,
  validateWeightKg,
  validateWeightPounds,
} from './units';

describe('unit conversions', () => {
  it('converts kilograms to pounds and back', () => {
    expect(kilogramsToPounds(80)).toBeCloseTo(176.3698, 4);
    expect(poundsToKilograms(176.37)).toBeCloseTo(80.0001, 4);
  });

  it('round-trips a weight without meaningful drift', () => {
    expect(poundsToKilograms(kilogramsToPounds(72.5))).toBeCloseTo(72.5, 10);
  });

  it('converts between centimeters and inches', () => {
    expect(centimetersToInches(180)).toBeCloseTo(70.8661, 4);
    expect(inchesToCentimeters(70)).toBeCloseTo(177.8, 10);
  });

  it('converts feet and inches to centimeters', () => {
    expect(feetInchesToCentimeters(5, 10)).toBeCloseTo(177.8, 10);
    expect(feetInchesToCentimeters(6, 0)).toBeCloseTo(182.88, 10);
  });

  it('converts centimeters to feet and inches', () => {
    expect(centimetersToFeetInches(180)).toEqual({ feet: 5, inches: 10.9 });
    expect(centimetersToFeetInches(182.88)).toEqual({ feet: 6, inches: 0 });
  });
});

describe('parseFeetInches', () => {
  it.each([
    [`5'10"`, 70],
    ['5 ft 10 in', 70],
    ['5′10″', 70],
    ['5 ft', 60],
    ['5 10', 70],
    ['5 10.5', 70.5],
    ['5.5', 66],
    ['5.5 ft', 66],
    ['70"', 70],
    ['70 in', 70],
    [`5' 10.5"`, 70.5],
  ])('parses %s as %s inches', (input, expected) => {
    expect(parseFeetInches(input)).toBe(expected);
  });

  it.each([``, '   ', 'abc', '-5', `5'12"`, `5' -1"`, `5.5' 2"`, '0', 'Infinity'])(
    'rejects %s',
    (input) => {
      expect(parseFeetInches(input)).toBeNull();
    },
  );
});

describe('validation', () => {
  it('accepts age at the boundaries', () => {
    expect(validateAge(15)).toBeNull();
    expect(validateAge(100)).toBeNull();
  });

  it('rejects age outside the range', () => {
    expect(validateAge(14)?.code).toBe('out-of-range');
    expect(validateAge(101)?.code).toBe('out-of-range');
  });

  it('reports missing and non-numeric values', () => {
    expect(validateAge(null)?.code).toBe('required');
    expect(validateAge(undefined)?.code).toBe('required');
    expect(validateAge(Number.NaN)?.code).toBe('not-a-number');
    expect(validateAge(Number.POSITIVE_INFINITY)?.code).toBe('not-a-number');
  });

  it('validates height in centimeters', () => {
    expect(validateHeightCm(120)).toBeNull();
    expect(validateHeightCm(250)).toBeNull();
    expect(validateHeightCm(119)).toMatchObject({ field: 'height', code: 'out-of-range' });
    expect(validateHeightCm(251)).toMatchObject({ field: 'height', code: 'out-of-range' });
  });

  it('validates weight in kilograms', () => {
    expect(validateWeightKg(30)).toBeNull();
    expect(validateWeightKg(300)).toBeNull();
    expect(validateWeightKg(29.9)).toMatchObject({ field: 'weight', code: 'out-of-range' });
    expect(validateWeightKg(300.1)).toMatchObject({ field: 'weight', code: 'out-of-range' });
  });

  it('validates height in feet and inches', () => {
    expect(validateHeightImperial(5, 10)).toBeNull();
    expect(validateHeightImperial(4, 0)).toBeNull();
    expect(validateHeightImperial(3, 11)).toMatchObject({ code: 'out-of-range' });
    expect(validateHeightImperial(8, 3)).toMatchObject({ code: 'out-of-range' });
    expect(validateHeightImperial(5, 12)).toMatchObject({ code: 'out-of-range' });
    expect(validateHeightImperial(null, 10)).toMatchObject({ code: 'required' });
  });

  it('validates weight in pounds using the metric range', () => {
    expect(validateWeightPounds(66.1387)).toBeNull();
    expect(validateWeightPounds(661.38)).toBeNull();
    expect(validateWeightPounds(66)).toMatchObject({ code: 'out-of-range' });
    expect(validateWeightPounds(662)).toMatchObject({ code: 'out-of-range' });
    expect(validateWeightPounds(null)).toMatchObject({ code: 'required' });
  });

  it('returns actionable messages', () => {
    expect(validateAge(14)?.message).toBe('Age must be between 15 and 100.');
    expect(validateHeightCm(null)?.message).toBe('Enter your height.');
    expect(validateWeightKg(Number.NaN)?.message).toBe('Enter a number for weight.');
  });
});
