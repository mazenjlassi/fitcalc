import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ResultDetail {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-result-card',
  styleUrl: './result-card.scss',
  templateUrl: './result-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiResultCard {
  readonly label = input.required<string>();
  readonly primary = input.required<string | number>();
  readonly unit = input('');
  readonly secondary = input<readonly ResultDetail[]>([]);
}
