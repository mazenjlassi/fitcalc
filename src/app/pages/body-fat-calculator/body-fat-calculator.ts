import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PAGE_META, SeoService } from '@shared/seo';

@Component({
  imports: [RouterLink],
  selector: 'app-body-fat-calculator',
  styleUrl: './body-fat-calculator.scss',
  templateUrl: './body-fat-calculator.html',
})
export class BodyFatCalculator {
  constructor() {
    inject(SeoService).setPage({
      ...PAGE_META.bodyFatCalculator,
      path: '/body-fat-calculator/',
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: 'Body fat calculator' },
      ],
    });
  }
}
