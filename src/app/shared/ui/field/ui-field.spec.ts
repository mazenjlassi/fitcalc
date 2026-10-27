import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiField, UiFieldControl } from './ui-field';

@Component({
  imports: [UiField, UiFieldControl],
  template: `
    <app-field
      fieldId="age"
      label="Age"
      hint="Between 15 and 100."
      [required]="true"
      [error]="error()"
    >
      <input appFieldControl type="number" />
    </app-field>
  `,
})
class FieldHost {
  readonly error = signal<string | undefined>(undefined);
}

describe('UiField', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FieldHost] }).compileComponents();
  });

  it('connects the label, hint, and control id', async () => {
    const fixture = TestBed.createComponent(FieldHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('input') as HTMLInputElement;
    const label = element.querySelector('label') as HTMLLabelElement;

    expect(input.id).toBe('age');
    expect(label.getAttribute('for')).toBe('age');
    expect(input.getAttribute('aria-describedby')).toBe('age-hint');
    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(element.querySelector('#age-hint')?.textContent).toContain('Between 15 and 100.');
  });

  it('wires and announces an error', async () => {
    const fixture = TestBed.createComponent(FieldHost);
    fixture.detectChanges();
    fixture.componentInstance.error.set('Enter your age.');
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('input') as HTMLInputElement;
    const error = element.querySelector('#age-error');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('age-hint age-error');
    expect(input.getAttribute('aria-errormessage')).toBe('age-error');
    expect(error?.getAttribute('role')).toBe('alert');
    expect(error?.textContent).toContain('Enter your age.');
  });

  it('removes error wiring when the error clears', async () => {
    const fixture = TestBed.createComponent(FieldHost);
    fixture.componentInstance.error.set('Enter your age.');
    fixture.detectChanges();
    fixture.componentInstance.error.set(undefined);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input',
    ) as HTMLInputElement;

    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(input.getAttribute('aria-describedby')).toBe('age-hint');
    expect(input.hasAttribute('aria-errormessage')).toBe(false);
    expect((fixture.nativeElement as HTMLElement).querySelector('#age-error')).toBeNull();
  });
});
