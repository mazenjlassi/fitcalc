import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import type {
  JsonLdNode,
  SeoBreadcrumb,
  SeoFaqEntry,
  SeoPage,
  SeoWebApplication,
} from './seo.models';
import { SITE_URL } from './site-url';

const SITE_NAME = 'fitcalc';
const SEO_ATTRIBUTE = 'data-seo';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly siteUrl = inject(SITE_URL);

  absoluteUrl(path: string): string {
    const trimmed = path.replace(/^\/+|\/+$/g, '');
    const pathname = trimmed ? `/${trimmed}/` : '/';
    return new URL(pathname, `${this.siteUrl}/`).toString();
  }

  setPage(page: SeoPage): void {
    const url = this.absoluteUrl(page.path);

    this.document.title = page.title;
    this.upsertMeta('name', 'description', page.description);
    this.upsertMeta('name', 'robots', page.robots ?? 'index, follow');
    this.upsertMeta('property', 'og:title', page.title);
    this.upsertMeta('property', 'og:description', page.description);
    this.upsertMeta('property', 'og:type', 'website');
    this.upsertMeta('property', 'og:url', url);
    this.upsertMeta('property', 'og:site_name', SITE_NAME);
    this.upsertMeta('property', 'og:locale', 'en_US');
    this.upsertMeta('name', 'twitter:card', 'summary');
    this.upsertMeta('name', 'twitter:title', page.title);
    this.upsertMeta('name', 'twitter:description', page.description);
    this.setCanonical(url);

    const nodes: JsonLdNode[] = [];

    if (page.webApplication) {
      nodes.push(this.webApplicationJsonLd(page.webApplication, url));
    }

    if (page.breadcrumbs?.length) {
      nodes.push(this.breadcrumbJsonLd(page.breadcrumbs, url));
    }

    if (page.faq?.length) {
      nodes.push(this.faqJsonLd(page.faq));
    }

    if (page.jsonLd?.length) {
      nodes.push(...page.jsonLd);
    }

    this.setJsonLd(nodes);
  }

  private webApplicationJsonLd(
    application: SeoWebApplication,
    url: string,
  ): JsonLdNode {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: application.name,
      description: application.description,
      url,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    };
  }

  private breadcrumbJsonLd(
    items: readonly SeoBreadcrumb[],
    pageUrl: string,
  ): JsonLdNode {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: item.path ? this.absoluteUrl(item.path) : pageUrl,
      })),
    };
  }

  private faqJsonLd(items: readonly SeoFaqEntry[]): JsonLdNode {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
  }

  private upsertMeta(
    attribute: 'name' | 'property',
    key: string,
    content: string,
  ): void {
    const selector = `meta[${attribute}="${key}"]`;
    const existing = Array.from(
      this.document.head.querySelectorAll<HTMLMetaElement>(selector),
    );
    const element = existing.shift();

    if (!element) {
      const meta = this.document.createElement('meta');
      meta.setAttribute(attribute, key);
      meta.setAttribute(SEO_ATTRIBUTE, 'true');
      this.document.head.appendChild(meta);
      meta.setAttribute('content', content);
    } else {
      element.setAttribute('content', content);
    }

    for (const duplicate of existing) {
      duplicate.parentNode?.removeChild(duplicate);
    }
  }

  private setCanonical(url: string): void {
    const links = Array.from(
      this.document.head.querySelectorAll<HTMLLinkElement>(
        'link[rel="canonical"]',
      ),
    );
    const link = links.shift();

    if (!link) {
      const canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute(SEO_ATTRIBUTE, 'true');
      canonical.setAttribute('href', url);
      this.document.head.appendChild(canonical);
    } else {
      link.setAttribute('href', url);
    }

    for (const duplicate of links) {
      duplicate.parentNode?.removeChild(duplicate);
    }
  }

  private setJsonLd(nodes: readonly JsonLdNode[]): void {
    for (const script of Array.from(
      this.document.head.querySelectorAll('script[data-seo-jsonld]'),
    )) {
      script.parentNode?.removeChild(script);
    }

    for (const node of nodes) {
      const script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(node).replace(/</g, '\\u003c');
      this.document.head.appendChild(script);
    }
  }
}
