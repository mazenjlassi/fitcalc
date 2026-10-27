import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PAGE_META, SeoService } from '@shared/seo';

@Component({
  imports: [RouterLink],
  selector: 'app-about',
  styleUrl: './about.scss',
  templateUrl: './about.html',
})
export class About {
  constructor() {
    inject(SeoService).setPage({
      ...PAGE_META.about,
      path: '/about/',
      breadcrumbs: [{ label: 'Home', path: '/' }, { label: 'About' }],
    });
  }
}
