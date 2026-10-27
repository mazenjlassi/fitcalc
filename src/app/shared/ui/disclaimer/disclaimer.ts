import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export const DEFAULT_DISCLAIMER =
  'This calculator gives general estimates for healthy adults. It is not medical advice, diagnosis, or treatment. Talk with a qualified clinician before changing your diet, especially if you are pregnant, breastfeeding, under 18, or managing a medical condition.';

@Component({
  selector: 'app-disclaimer',
  styleUrl: './disclaimer.scss',
  templateUrl: './disclaimer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiDisclaimer {
  readonly heading = input('Medical disclaimer');
  readonly text = input(DEFAULT_DISCLAIMER);
}
