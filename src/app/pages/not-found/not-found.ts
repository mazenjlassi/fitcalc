import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PAGE_META, SeoService } from '@shared/seo';

@Component({
  imports: [RouterLink],
  selector: 'app-not-found',
  styleUrl: './not-found.scss',
  templateUrl: './not-found.html',
})
export class NotFound {
  constructor() {
    inject(SeoService).setPage({
      ...PAGE_META.notFound,
      path: '/404/',
      robots: 'noindex, nofollow',
      breadcrumbs: [{ label: 'Home', path: '/' }, { label: 'Page not found' }],
    });
  }
}
