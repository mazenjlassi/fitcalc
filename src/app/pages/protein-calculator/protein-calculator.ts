import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PAGE_META, SeoService } from '@shared/seo';

@Component({
  imports: [RouterLink],
  selector: 'app-protein-calculator',
  styleUrl: './protein-calculator.scss',
  templateUrl: './protein-calculator.html',
})
export class ProteinCalculator {
  constructor() {
    inject(SeoService).setPage({
      ...PAGE_META.proteinCalculator,
      path: '/protein-calculator/',
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: 'Protein calculator' },
      ],
    });
  }
}
