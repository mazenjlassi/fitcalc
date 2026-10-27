export type Sex = 'male' | 'female';

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  'very-active': 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_FACTORS;

export const ACTIVITY_OPTIONS = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise, desk job.',
  },
  {
    value: 'light',
    label: 'Lightly active',
    description: 'Light exercise 1-3 days per week.',
  },
  {
    value: 'moderate',
    label: 'Moderately active',
    description: 'Moderate exercise 3-5 days per week.',
  },
  {
    value: 'active',
    label: 'Very active',
    description: 'Hard exercise 6-7 days per week.',
  },
  {
    value: 'very-active',
    label: 'Extra active',
    description: 'Physical job or twice-daily training.',
  },
] as const satisfies readonly {
  value: ActivityLevel;
  label: string;
  description: string;
}[];

export const GOAL_DELTAS = {
  maintain: 0,
  'lose-250': -250,
  'lose-500': -500,
  'gain-250': 250,
  'gain-500': 500,
} as const;

export type Goal = keyof typeof GOAL_DELTAS;

export const GOAL_OPTIONS = [
  { value: 'maintain', label: 'Maintain weight' },
  { value: 'lose-250', label: 'Lose weight gently', description: 'About 0.25 kg per week.' },
  { value: 'lose-500', label: 'Lose weight', description: 'About 0.5 kg per week.' },
  { value: 'gain-250', label: 'Gain weight gently', description: 'About 0.25 kg per week.' },
  { value: 'gain-500', label: 'Gain weight', description: 'About 0.5 kg per week.' },
] as const satisfies readonly {
  value: Goal;
  label: string;
  description?: string;
}[];

export const CALORIE_FLOORS: Record<Sex, number> = {
  female: 1200,
  male: 1500,
};

export interface BmrInput {
  readonly sex: Sex;
  readonly age: number;
  readonly heightCm: number;
  readonly weightKg: number;
}

export interface CalorieInput extends BmrInput {
  readonly activity: ActivityLevel;
  readonly goal?: Goal;
}

export interface SafetyFloorResult {
  readonly target: number;
  readonly floorApplied: boolean;
  readonly warning: string | null;
}

export interface CaloriePlan {
  readonly bmr: number;
  readonly tdee: number;
  readonly goal: Goal;
  readonly delta: number;
  readonly requestedTarget: number;
  readonly target: number;
  readonly deficit: number;
  readonly floorApplied: boolean;
  readonly warning: string | null;
}

/**
 * Mifflin-St Jeor equation. Inputs are assumed to be validated; the result is
 * not rounded. Round only at display time with `roundCalories`.
 */
export function calculateBmr(input: BmrInput): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return base + (input.sex === 'male' ? 5 : -161);
}

export function calculateTdee(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activity];
}

export function applySafetyFloor(
  requestedTarget: number,
  sex: Sex,
  floor: number = CALORIE_FLOORS[sex],
): SafetyFloorResult {
  if (requestedTarget < floor) {
    const floorText = floor.toLocaleString('en-US');

    return {
      target: floor,
      floorApplied: true,
      warning: `This target is below the ${floorText} kcal safety floor, so ${floorText} kcal is shown instead. Do not eat below this floor without medical supervision.`,
    };
  }

  return { target: requestedTarget, floorApplied: false, warning: null };
}

export function calculateCaloriePlan(input: CalorieInput): CaloriePlan {
  const bmr = calculateBmr(input);
  const tdee = calculateTdee(bmr, input.activity);
  const goal = input.goal ?? 'maintain';
  const delta = GOAL_DELTAS[goal];
  const requestedTarget = tdee + delta;
  const safety = applySafetyFloor(requestedTarget, input.sex);

  return {
    bmr,
    tdee,
    goal,
    delta,
    requestedTarget,
    target: safety.target,
    deficit: tdee - safety.target,
    floorApplied: safety.floorApplied,
    warning: safety.warning,
  };
}

export function roundCalories(value: number): number {
  return Math.round(value);
}
