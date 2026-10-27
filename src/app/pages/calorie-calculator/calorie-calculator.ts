import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  calculateCaloriePlan,
  roundCalories,
  type ActivityLevel,
  type CalorieInput,
  type CaloriePlan,
  type Goal,
  type Sex,
} from '@core/formulas/calories';
import {
  centimetersToFeetInches,
  inchesToCentimeters,
  kilogramsToPounds,
  parseFeetInches,
  poundsToKilograms,
  roundTo,
  validateAge,
  validateHeightCm,
  validateWeightKg,
  validateWeightPounds,
} from '@core/formulas/units';
import {
  UiBreadcrumb,
  UiDisclaimer,
  UiField,
  UiFieldControl,
  UiResultCard,
  UiUnitToggle,
  type BreadcrumbItem,
  type ResultDetail,
  type UnitSystem,
} from '@shared/ui';

type MeasurementField = 'age' | 'height' | 'weight';

@Component({
  imports: [
    ReactiveFormsModule,
    UiBreadcrumb,
    UiDisclaimer,
    UiField,
    UiFieldControl,
    UiResultCard,
    UiUnitToggle,
  ],
  selector: 'app-calorie-calculator',
  styleUrl: './calorie-calculator.scss',
  templateUrl: './calorie-calculator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalorieCalculator {
  readonly breadcrumb: readonly BreadcrumbItem[] = [
    { label: 'Home', link: '/' },
    { label: 'Calorie calculator' },
  ];

  readonly units = signal<UnitSystem>('metric');
  readonly touched = signal<ReadonlySet<MeasurementField>>(new Set());

  readonly form = new FormGroup({
    sex: new FormControl<Sex>('female', { nonNullable: true }),
    age: new FormControl<number | null>(null),
    heightCm: new FormControl<number | null>(null),
    heightImperial: new FormControl('', { nonNullable: true }),
    weightKg: new FormControl<number | null>(null),
    weightLb: new FormControl<number | null>(null),
    activity: new FormControl<ActivityLevel>('moderate', { nonNullable: true }),
    goal: new FormControl<Goal>('maintain', { nonNullable: true }),
  });

  readonly values = signal(this.form.getRawValue());

  readonly activityOptions = ACTIVITY_OPTIONS;
  readonly goalOptions = GOAL_OPTIONS;

  readonly activityHint = computed(() => {
    const selected = ACTIVITY_OPTIONS.find((option) => option.value === this.values().activity);
    return selected?.description ?? '';
  });

  readonly goalHint = computed(() => {
    const selected = GOAL_OPTIONS.find((option) => option.value === this.values().goal);
    return selected && 'description' in selected
      ? selected.description
      : 'No daily deficit or surplus.';
  });

  readonly ageError = computed(() =>
    this.touched().has('age') ? (validateAge(this.values().age)?.message ?? null) : null,
  );

  readonly heightError = computed(() => {
    if (!this.touched().has('height')) {
      return null;
    }

    const value = this.values();

    if (this.units() === 'metric') {
      return validateHeightCm(value.heightCm)?.message ?? null;
    }

    if (!value.heightImperial.trim()) {
      return 'Enter your height, for example 5\'10".';
    }

    const inches = parseFeetInches(value.heightImperial);

    if (inches === null) {
      return 'Use a format like 5\'10" or 5 ft 10 in.';
    }

    return validateHeightCm(inchesToCentimeters(inches))?.message ?? null;
  });

  readonly weightError = computed(() => {
    if (!this.touched().has('weight')) {
      return null;
    }

    const value = this.values();

    return this.units() === 'metric'
      ? (validateWeightKg(value.weightKg)?.message ?? null)
      : (validateWeightPounds(value.weightLb)?.message ?? null);
  });

  readonly plan = computed<CaloriePlan | null>(() => {
    const input = this.toCalorieInput();
    return input ? calculateCaloriePlan(input) : null;
  });

  readonly targetText = computed(() => {
    const plan = this.plan();
    return plan ? this.format(roundCalories(plan.target)) : '';
  });

  readonly unitText = computed(() => (this.plan() ? 'kcal' : ''));

  readonly details = computed<readonly ResultDetail[]>(() => {
    const plan = this.plan();

    if (!plan) {
      return [];
    }

    const balance = plan.deficit;
    const balanceLabel =
      balance > 0 ? 'Daily deficit' : balance < 0 ? 'Daily surplus' : 'Daily balance';

    return [
      { label: 'BMR (at rest)', value: `${this.format(roundCalories(plan.bmr))} kcal` },
      { label: 'Maintenance (TDEE)', value: `${this.format(roundCalories(plan.tdee))} kcal` },
      {
        label: balanceLabel,
        value: `${this.format(Math.abs(roundCalories(balance)))} kcal`,
      },
    ];
  });

  private readonly numberFormatter = new Intl.NumberFormat('en-US');

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.values.set(this.form.getRawValue());
    });
  }

  touch(field: MeasurementField): void {
    this.touched.update((touched) => {
      if (touched.has(field)) {
        return touched;
      }

      const next = new Set(touched);
      next.add(field);
      return next;
    });
  }

  switchUnits(units: UnitSystem): void {
    if (units === this.units()) {
      return;
    }

    const value = this.values();

    if (units === 'imperial') {
      const heightCm = this.heightCmFromValues(value);
      const weightKg = this.weightKgFromValues(value);

      this.units.set(units);
      this.form.patchValue({
        heightImperial: heightCm === null ? '' : this.formatImperialHeight(heightCm),
        weightLb: weightKg === null ? null : roundTo(kilogramsToPounds(weightKg), 1),
      });
      return;
    }

    const inches = parseFeetInches(value.heightImperial);
    const heightCm = inches === null ? null : inchesToCentimeters(inches);
    const weightLb = value.weightLb;

    this.units.set(units);
    this.form.patchValue({
      heightCm:
        heightCm === null || validateHeightCm(heightCm) ? null : roundTo(heightCm, 1),
      weightKg:
        weightLb === null || validateWeightPounds(weightLb)
          ? null
          : roundTo(poundsToKilograms(weightLb), 1),
    });
  }

  private toCalorieInput(): CalorieInput | null {
    const value = this.values();
    const age = value.age;

    if (age === null || validateAge(age)) {
      return null;
    }

    const heightCm = this.heightCmFromValues(value);

    if (heightCm === null) {
      return null;
    }

    const weightKg = this.weightKgFromValues(value);

    if (weightKg === null) {
      return null;
    }

    return {
      sex: value.sex,
      age,
      heightCm,
      weightKg,
      activity: value.activity,
      goal: value.goal,
    };
  }

  private heightCmFromValues(value: {
    readonly heightCm: number | null;
    readonly heightImperial: string;
  }): number | null {
    if (this.units() === 'metric') {
      return value.heightCm !== null && !validateHeightCm(value.heightCm) ? value.heightCm : null;
    }

    const inches = parseFeetInches(value.heightImperial);

    if (inches === null) {
      return null;
    }

    const heightCm = inchesToCentimeters(inches);
    return validateHeightCm(heightCm) ? null : heightCm;
  }

  private weightKgFromValues(value: {
    readonly weightKg: number | null;
    readonly weightLb: number | null;
  }): number | null {
    if (this.units() === 'metric') {
      return value.weightKg !== null && !validateWeightKg(value.weightKg)
        ? value.weightKg
        : null;
    }

    return value.weightLb !== null && !validateWeightPounds(value.weightLb)
      ? poundsToKilograms(value.weightLb)
      : null;
  }

  private formatImperialHeight(heightCm: number): string {
    const { feet, inches } = centimetersToFeetInches(heightCm);
    return `${feet}' ${inches}"`;
  }

  private format(value: number): string {
    return this.numberFormatter.format(value);
  }
}
