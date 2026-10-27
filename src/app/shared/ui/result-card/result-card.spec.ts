import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiResultCard, type ResultDetail } from './result-card';

@Component({
  imports: [UiResultCard],
  template: `
    <app-result-card
      label="Daily calorie target"
      [primary]="2000"
      unit="kcal"
      [secondary]="details"
    >
      <p>This is a general estimate, not a prescription.</p>
    </app-result-card>
  `,
})
class ResultCardHost {
  readonly details: readonly ResultDetail[] = [
    { label: 'BMR', value: '1,780 kcal' },
    { label: 'TDEE', value: '2,759 kcal' },
  ];
}

describe('UiResultCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ResultCardHost] }).compileComponents();
  });

  it('announces results politely and renders primary, secondary, and content', () => {
    const fixture = TestBed.createComponent(ResultCardHost);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const result = element.querySelector('.result');

    expect(result?.getAttribute('role')).toBe('status');
    expect(result?.getAttribute('aria-live')).toBe('polite');
    expect(result?.getAttribute('aria-atomic')).toBe('true');
    expect(element.querySelector('.result__primary')?.textContent).toContain('2000');
    expect(element.querySelector('.result__primary')?.textContent).toContain('kcal');
    expect(element.querySelectorAll('dt')).toHaveLength(2);
    expect(element.querySelector('dd')?.textContent).toContain('1,780 kcal');
    expect(element.querySelector('.result__body')?.textContent).toContain(
      'This is a general estimate, not a prescription.',
    );
  });
});
