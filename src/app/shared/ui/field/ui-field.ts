import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  computed,
  contentChild,
  effect,
  inject,
  input,
  booleanAttribute,
} from '@angular/core';

@Directive({
  selector: 'input[appFieldControl], select[appFieldControl], textarea[appFieldControl]',
})
export class UiFieldControl {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
}

@Component({
  selector: 'app-field',
  styleUrl: './ui-field.scss',
  templateUrl: './ui-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiField {
  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly error = input<string | null>();
  readonly required = input(false, { transform: booleanAttribute });

  readonly hintId = computed(() => `${this.fieldId()}-hint`);
  readonly errorId = computed(() => `${this.fieldId()}-error`);

  private readonly control = contentChild(UiFieldControl);

  constructor() {
    effect(() => {
      const element = this.control()?.element.nativeElement;

      if (!element) {
        return;
      }

      element.id = this.fieldId();
      element.setAttribute('aria-invalid', this.error() ? 'true' : 'false');

      const describedBy = [
        this.hint() ? this.hintId() : null,
        this.error() ? this.errorId() : null,
      ].filter((id): id is string => id !== null);

      if (describedBy.length > 0) {
        element.setAttribute('aria-describedby', describedBy.join(' '));
      } else {
        element.removeAttribute('aria-describedby');
      }

      if (this.error()) {
        element.setAttribute('aria-errormessage', this.errorId());
      } else {
        element.removeAttribute('aria-errormessage');
      }

      if (this.required()) {
        element.setAttribute('aria-required', 'true');
      } else {
        element.removeAttribute('aria-required');
      }
    });
  }
}
