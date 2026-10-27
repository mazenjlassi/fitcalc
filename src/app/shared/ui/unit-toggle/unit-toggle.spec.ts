import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiUnitToggle, type UnitSystem } from './unit-toggle';

@Component({
  imports: [UiUnitToggle],
  template: `
    <app-unit-toggle
      name="units"
      [value]="value()"
      (valueChange)="value.set($event)"
    />
  `,
})
class UnitToggleHost {
  readonly value = signal<UnitSystem>('metric');
}

describe('UiUnitToggle', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UnitToggleHost] }).compileComponents();
  });

  it('renders a labelled radio group with 44px options', () => {
    const fixture = TestBed.createComponent(UnitToggleHost);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const radios = element.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    const legend = element.querySelector('legend');

    expect(radios).toHaveLength(2);
    expect(legend?.textContent).toContain('Units');
    expect(element.querySelectorAll('.units__option')).toHaveLength(2);
    expect(radios[0].checked).toBe(true);
  });

  it('changes units when a radio is selected', () => {
    const fixture = TestBed.createComponent(UnitToggleHost);
    fixture.detectChanges();

    const imperial = (fixture.nativeElement as HTMLElement).querySelector(
      'input[value="imperial"]',
    ) as HTMLInputElement;

    imperial.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('imperial');
    expect(imperial.checked).toBe(true);
  });

  it('supports arrow-key switching and moves focus', () => {
    const fixture = TestBed.createComponent(UnitToggleHost);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const metric = element.querySelector('input[value="metric"]') as HTMLInputElement;
    const imperial = element.querySelector('input[value="imperial"]') as HTMLInputElement;

    metric.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('imperial');
    expect(document.activeElement).toBe(imperial);
  });
});
