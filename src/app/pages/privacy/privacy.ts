import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PAGE_META, SeoService } from '@shared/seo';

@Component({
  imports: [RouterLink],
  selector: 'app-privacy',
  styleUrl: './privacy.scss',
  templateUrl: './privacy.html',
})
export class Privacy {
  constructor() {
    inject(SeoService).setPage({
      ...PAGE_META.privacy,
      path: '/privacy/',
      breadcrumbs: [{ label: 'Home', path: '/' }, { label: 'Privacy policy' }],
    });
  }
}
