import {
  ACTIVITY_FACTORS,
  ACTIVITY_OPTIONS,
  CALORIE_FLOORS,
  GOAL_DELTAS,
  GOAL_OPTIONS,
  applySafetyFloor,
  calculateBmr,
  calculateCaloriePlan,
  calculateTdee,
  roundCalories,
  type ActivityLevel,
  type CalorieInput,
} from './calories';

const MALE_EXAMPLE = { sex: 'male', age: 30, heightCm: 180, weightKg: 80 } as const;
const FEMALE_EXAMPLE = { sex: 'female', age: 25, heightCm: 165, weightKg: 60 } as const;

describe('Mifflin-St Jeor BMR', () => {
  it('calculates the male reference case', () => {
    expect(calculateBmr(MALE_EXAMPLE)).toBe(1780);
  });

  it('calculates the female reference case', () => {
    expect(calculateBmr(FEMALE_EXAMPLE)).toBe(1345.25);
  });
});

describe('TDEE', () => {
  it.each(Object.entries(ACTIVITY_FACTORS))('applies the %s factor', (activity, factor) => {
    expect(calculateTdee(1780, activity as ActivityLevel)).toBeCloseTo(1780 * factor, 10);
  });

  it('exposes five ordered activity options matching the factors', () => {
    expect(ACTIVITY_OPTIONS).toHaveLength(5);
    expect(ACTIVITY_OPTIONS.map((option) => option.value)).toEqual(
      Object.keys(ACTIVITY_FACTORS) as ActivityLevel[],
    );
  });
});

describe('goal presets', () => {
  const input = {
    ...FEMALE_EXAMPLE,
    activity: 'moderate',
  } as const satisfies CalorieInput;
  const tdee = calculateTdee(calculateBmr(input), input.activity);

  it.each(Object.entries(GOAL_DELTAS))('applies the %s preset', (goal, delta) => {
    const plan = calculateCaloriePlan({ ...input, goal: goal as keyof typeof GOAL_DELTAS });

    expect(plan.delta).toBe(delta);
    expect(plan.requestedTarget).toBeCloseTo(tdee + delta, 10);
    expect(plan.target).toBeCloseTo(tdee + delta, 10);
    expect(plan.deficit).toBeCloseTo(-delta, 10);
    expect(plan.floorApplied).toBe(false);
    expect(plan.warning).toBeNull();
  });

  it('defaults to maintenance', () => {
    const plan = calculateCaloriePlan(input);

    expect(plan.goal).toBe('maintain');
    expect(plan.target).toBeCloseTo(tdee, 10);
    expect(plan.deficit).toBeCloseTo(0, 10);
  });

  it('exposes every goal preset', () => {
    expect(GOAL_OPTIONS.map((option) => option.value)).toEqual(
      Object.keys(GOAL_DELTAS) as (keyof typeof GOAL_DELTAS)[],
    );
  });
});

describe('safety floor', () => {
  it('keeps a female target at the floor unchanged', () => {
    expect(applySafetyFloor(CALORIE_FLOORS.female, 'female')).toEqual({
      target: 1200,
      floorApplied: false,
      warning: null,
    });
  });

  it('raises a female target below the floor', () => {
    const result = applySafetyFloor(CALORIE_FLOORS.female - 0.01, 'female');

    expect(result.target).toBe(1200);
    expect(result.floorApplied).toBe(true);
    expect(result.warning).toContain('1200 kcal safety floor');
  });

  it('keeps a male target at the floor unchanged', () => {
    expect(applySafetyFloor(CALORIE_FLOORS.male, 'male').floorApplied).toBe(false);
  });

  it('raises a male target below the floor', () => {
    const result = applySafetyFloor(CALORIE_FLOORS.male - 1, 'male');

    expect(result.target).toBe(1500);
    expect(result.floorApplied).toBe(true);
    expect(result.warning).toContain('1500 kcal safety floor');
  });

  it('honours an explicit floor', () => {
    expect(applySafetyFloor(1000, 'female', 900)).toEqual({
      target: 1000,
      floorApplied: false,
      warning: null,
    });
    expect(applySafetyFloor(950, 'female', 1000)).toMatchObject({
      target: 1000,
      floorApplied: true,
    });
  });

  it('uses the floor as a smaller deficit for a low female target', () => {
    const plan = calculateCaloriePlan({
      ...FEMALE_EXAMPLE,
      activity: 'sedentary',
      goal: 'lose-500',
    });

    expect(plan.tdee).toBeCloseTo(1614.3, 10);
    expect(plan.requestedTarget).toBeCloseTo(1114.3, 10);
    expect(plan.target).toBe(1200);
    expect(plan.deficit).toBeCloseTo(414.3, 10);
    expect(plan.floorApplied).toBe(true);
    expect(plan.warning).not.toBeNull();
  });

  it('uses the floor as a smaller deficit for a low male target', () => {
    const plan = calculateCaloriePlan({
      sex: 'male',
      age: 30,
      heightCm: 165,
      weightKg: 60,
      activity: 'sedentary',
      goal: 'lose-500',
    });

    expect(plan.requestedTarget).toBeCloseTo(1283.5, 10);
    expect(plan.target).toBe(1500);
    expect(plan.floorApplied).toBe(true);
    expect(plan.warning).toContain('1500 kcal safety floor');
  });

  it('does not warn when the target is above the floor', () => {
    const plan = calculateCaloriePlan({
      ...MALE_EXAMPLE,
      activity: 'sedentary',
      goal: 'lose-500',
    });

    expect(plan.target).toBeCloseTo(1636, 10);
    expect(plan.floorApplied).toBe(false);
    expect(plan.warning).toBeNull();
  });
});

describe('rounding policy', () => {
  it('rounds only for display, to the nearest whole calorie', () => {
    expect(roundCalories(1345.25)).toBe(1345);
    expect(roundCalories(1345.5)).toBe(1346);
    expect(roundCalories(1345.49)).toBe(1345);
  });

  it('leaves calculations unrounded', () => {
    expect(calculateBmr(FEMALE_EXAMPLE)).toBe(1345.25);
  });
});
