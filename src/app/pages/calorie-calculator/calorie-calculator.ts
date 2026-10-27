import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ACTIVITY_FACTORS,
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
  UiFaq,
  UiField,
  UiFieldControl,
  UiResultCard,
  UiUnitToggle,
  type BreadcrumbItem,
  type FaqItem,
  type ResultDetail,
  type UnitSystem,
} from '@shared/ui';

type MeasurementField = 'age' | 'height' | 'weight';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    UiBreadcrumb,
    UiDisclaimer,
    UiFaq,
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
  readonly activityFactors = ACTIVITY_FACTORS;
  readonly goalOptions = GOAL_OPTIONS;

  readonly faqItems: readonly FaqItem[] = [
    {
      question: 'What is the difference between BMR and TDEE?',
      answer:
        'BMR is the energy your body uses at complete rest to keep organs working. TDEE is your total daily energy expenditure: BMR multiplied by an activity factor, plus the energy used moving and exercising. The calculator shows both so you can see how activity changes your estimate.',
    },
    {
      question: 'How should I choose an activity level?',
      answer:
        'Pick the description that matches an average week, not your busiest week. If your days vary or you are unsure, choose the lower level. The activity factor is a rough multiplier, and overestimating it is a common reason calorie targets feel too high.',
    },
    {
      question: 'Why is my target not lower than 1,200 or 1,500 kcal?',
      answer:
        'Very low intakes can make it hard to meet nutrient needs and may be unsafe without supervision. This calculator never recommends below 1,200 kcal for females or 1,500 kcal for males. When a deficit would go lower, it shows the floor and a warning instead. These are safety defaults, not personal medical limits.',
    },
    {
      question: 'How quickly can I expect to lose or gain weight?',
      answer:
        'The presets change your intake by 250 or 500 kcal per day. Because roughly 7,700 kcal is stored per kilogram of body fat, a 500 kcal daily deficit is often described as about 0.5 kg per week. Real change is slower and noisier because of water, food weight, and adaptation. Aim for a pace you can sustain.',
    },
    {
      question: 'Should I eat back the calories I burn during exercise?',
      answer:
        'Your activity factor already includes your usual exercise, so adding every workout on top can double-count it. If you train much more than usual, adjust your activity level or target rather than adding a second estimate.',
    },
    {
      question: 'Does the calculator work during pregnancy, breastfeeding, or for children?',
      answer:
        'No. Energy needs change substantially during pregnancy and breastfeeding, and children and teenagers need growth-specific assessment. This tool is intended for adults. Ask a clinician or registered dietitian for individualized advice.',
    },
    {
      question: 'Why does the calculator ask for sex?',
      answer:
        'The Mifflin-St Jeor equation uses a different constant for males and females, so the calculator needs one of those options to do the arithmetic. It is not asking about gender identity. If your physiology or medical situation makes the choice unclear, a clinician can help you interpret the result.',
    },
    {
      question: 'Will my measurements be saved?',
      answer:
        'No. The calculator runs entirely in your browser, and this site has no account, cookies, or analytics. Your measurements are not sent to or stored by this site. If you use a shared device, clear the form before leaving.',
    },
    {
      question: 'How often should I recalculate?',
      answer:
        'Every 4 to 6 weeks, or after a change of about 2 to 3 kg, is usually enough. Weight fluctuates daily, so compare weekly averages rather than single readings.',
    },
  ];

  readonly ageWarning = computed(() => {
    const age = this.values().age;
    return age !== null && age >= 15 && age < 18 && !validateAge(age)
      ? 'This calculator is designed for adults. If you are under 18, treat the result as a rough starting point only and speak with a clinician.'
      : null;
  });

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
