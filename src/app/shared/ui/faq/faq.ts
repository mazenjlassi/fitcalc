import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

@Component({
  selector: 'app-faq',
  styleUrl: './faq.scss',
  templateUrl: './faq.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFaq {
  readonly heading = input('Frequently asked questions');
  readonly items = input.required<readonly FaqItem[]>();
}
