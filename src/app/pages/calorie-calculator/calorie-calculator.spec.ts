import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CalorieCalculator } from './calorie-calculator';

describe('CalorieCalculator', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalorieCalculator],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function createCalculator() {
    const fixture = TestBed.createComponent(CalorieCalculator);
    fixture.detectChanges();
    return fixture;
  }

  function resultText(fixture: ReturnType<typeof createCalculator>): string {
    return (fixture.nativeElement as HTMLElement).querySelector('.result__primary')
      ?.textContent ?? '';
  }

  it('calculates a metric plan from the reference case', () => {
    const fixture = createCalculator();
    const component = fixture.componentInstance;

    component.form.patchValue({
      sex: 'female',
      age: 25,
      heightCm: 165,
      weightKg: 60,
      activity: 'moderate',
      goal: 'maintain',
    });
    fixture.detectChanges();

    expect(component.plan()?.bmr).toBeCloseTo(1345.25, 2);
    expect(component.plan()?.target).toBeCloseTo(2085.1375, 2);
    expect(resultText(fixture)).toContain('2,085');
    expect(resultText(fixture)).toContain('kcal');
    expect((fixture.nativeElement as HTMLElement).querySelector('.result')?.getAttribute(
      'aria-live',
    )).toBe('polite');
  });

  it('produces an equivalent result in imperial units', () => {
    const fixture = createCalculator();
    const component = fixture.componentInstance;

    component.switchUnits('imperial');
    component.form.patchValue({
      sex: 'female',
      age: 25,
      heightImperial: `5' 5"`,
      weightLb: 132.3,
      activity: 'moderate',
      goal: 'maintain',
    });
    fixture.detectChanges();

    expect(component.plan()?.target).toBeCloseTo(2086.27, 0);
    expect(resultText(fixture)).toContain('2,086');
  });

  it('converts values when the unit toggle changes', () => {
    const fixture = createCalculator();
    const component = fixture.componentInstance;

    component.form.patchValue({ heightCm: 165, weightKg: 60 });
    component.switchUnits('imperial');
    fixture.detectChanges();

    expect(component.form.controls.heightImperial.value).toBe(`5' 5"`);
    expect(component.form.controls.weightLb.value).toBeCloseTo(132.3, 1);

    component.switchUnits('metric');
    fixture.detectChanges();

    expect(component.form.controls.heightCm.value).toBeCloseTo(165.1, 1);
    expect(component.form.controls.weightKg.value).toBeCloseTo(60, 1);
  });

  it('shows inline errors and suppresses results when inputs are invalid', () => {
    const fixture = createCalculator();
    const component = fixture.componentInstance;

    component.touch('age');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.field__error')?.textContent).toContain('Enter your age.');
    expect(element.querySelector('.field__error')?.getAttribute('role')).toBe('alert');
    expect(resultText(fixture)).toContain('\u2014');

    component.form.patchValue({ age: 14 });
    fixture.detectChanges();
    expect(component.plan()).toBeNull();
    expect(element.querySelector('.field__error')?.textContent).toContain(
      'Age must be between 15 and 100.',
    );
  });

  it('warns and applies the female safety floor', () => {
    const fixture = createCalculator();
    const component = fixture.componentInstance;

    component.form.patchValue({
      sex: 'female',
      age: 25,
      heightCm: 165,
      weightKg: 60,
      activity: 'sedentary',
      goal: 'lose-500',
    });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const warning = element.querySelector('.result-warning');

    expect(component.plan()?.target).toBe(1200);
    expect(resultText(fixture)).toContain('1,200');
    expect(warning?.textContent).toContain('1,200 kcal safety floor');
  });

  it('updates the target when the goal changes', () => {
    const fixture = createCalculator();
    const component = fixture.componentInstance;

    component.form.patchValue({
      sex: 'female',
      age: 25,
      heightCm: 165,
      weightKg: 60,
      activity: 'moderate',
      goal: 'maintain',
    });
    fixture.detectChanges();

    const goal = (fixture.nativeElement as HTMLElement).querySelector(
      '#goal',
    ) as HTMLSelectElement;

    goal.value = 'gain-500';
    goal.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.form.controls.goal.value).toBe('gain-500');
    expect(resultText(fixture)).toContain('2,585');
  });
});
