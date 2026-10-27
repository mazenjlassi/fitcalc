import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export type UnitSystem = 'metric' | 'imperial';

export const UNIT_OPTIONS = [
  { value: 'metric', label: 'Metric' },
  { value: 'imperial', label: 'Imperial' },
] as const satisfies readonly { value: UnitSystem; label: string }[];

@Component({
  selector: 'app-unit-toggle',
  styleUrl: './unit-toggle.scss',
  templateUrl: './unit-toggle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiUnitToggle {
  readonly name = input.required<string>();
  readonly legend = input('Units');
  readonly value = model.required<UnitSystem>();

  readonly options = UNIT_OPTIONS;

  select(value: UnitSystem): void {
    this.value.set(value);
  }

  onKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    if (!keys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    const next: UnitSystem = this.value() === 'metric' ? 'imperial' : 'metric';
    const group = (event.currentTarget as HTMLElement | null)?.closest('fieldset');

    this.value.set(next);
    group?.querySelector<HTMLInputElement>(`input[value="${next}"]`)?.focus();
  }
}
