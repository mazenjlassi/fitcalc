import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PAGE_META, SeoService } from '@shared/seo';

@Component({
  imports: [RouterLink],
  selector: 'app-contact',
  styleUrl: './contact.scss',
  templateUrl: './contact.html',
})
export class Contact {
  constructor() {
    inject(SeoService).setPage({
      ...PAGE_META.contact,
      path: '/contact/',
      breadcrumbs: [{ label: 'Home', path: '/' }, { label: 'Contact' }],
    });
  }
}
