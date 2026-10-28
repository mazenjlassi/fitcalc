import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PAGE_META, SeoService } from '@shared/seo';

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  constructor() {
    inject(SeoService).setPage({
      ...PAGE_META.home,
      path: '/',
      webApplication: {
        name: 'fitcalc fitness calculators',
        description: PAGE_META.home.description,
      },
    });
  }
}
