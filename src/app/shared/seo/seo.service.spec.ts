import { TestBed } from '@angular/core/testing';
import { PAGE_META, SeoService, SITE_URL } from '@shared/seo';

interface BreadcrumbNode {
  readonly '@type': string;
  readonly itemListElement: readonly { readonly item: string }[];
}

interface FaqNode {
  readonly mainEntity: readonly {
    readonly name: string;
    readonly acceptedAnswer: { readonly text: string };
  }[];
}

interface WebApplicationNode {
  readonly applicationCategory: string;
  readonly offers: { readonly price: string };
}

describe('SeoService', () => {
  let service: SeoService;
  let document: Document;

  beforeEach(() => {
    document = window.document;
    document.title = '';
    document.head
      .querySelectorAll('meta[data-seo], link[data-seo], script[data-seo-jsonld]')
      .forEach((element) => element.remove());

    TestBed.configureTestingModule({
      providers: [{ provide: SITE_URL, useValue: 'https://fitcalc.example' }],
    });
    service = TestBed.inject(SeoService);
  });

  function meta(attribute: 'name' | 'property', key: string): string | null {
    return document.head
      .querySelector(`meta[${attribute}="${key}"]`)
      ?.getAttribute('content') ?? null;
  }

  function jsonLdScripts(): HTMLScriptElement[] {
    return Array.from(
      document.head.querySelectorAll<HTMLScriptElement>('script[data-seo-jsonld]'),
    );
  }

  it('builds absolute canonical URLs with a trailing slash', () => {
    expect(service.absoluteUrl('/')).toBe('https://fitcalc.example/');
    expect(service.absoluteUrl('about')).toBe('https://fitcalc.example/about/');
    expect(service.absoluteUrl('/calorie-calculator/')).toBe(
      'https://fitcalc.example/calorie-calculator/',
    );
  });

  it('updates metadata without leaving duplicate tags', () => {
    service.setPage({
      title: 'First page',
      description: 'First description',
      path: '/about/',
    });
    service.setPage({
      title: 'Second page',
      description: 'Second description',
      path: '/privacy/',
    });

    expect(document.title).toBe('Second page');
    expect(meta('name', 'description')).toBe('Second description');
    expect(meta('name', 'robots')).toBe('index, follow');
    expect(meta('property', 'og:title')).toBe('Second page');
    expect(meta('property', 'og:url')).toBe('https://fitcalc.example/privacy/');
    expect(meta('property', 'og:site_name')).toBe('fitcalc');
    expect(meta('name', 'twitter:title')).toBe('Second page');
    expect(
      document.head.querySelectorAll('meta[name="description"]'),
    ).toHaveLength(1);
    expect(
      document.head.querySelectorAll('meta[property="og:title"]'),
    ).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('https://fitcalc.example/privacy/');
  });

  it('sets WebApplication, FAQPage, and BreadcrumbList JSON-LD', () => {
    service.setPage({
      ...PAGE_META.calorieCalculator,
      path: '/calorie-calculator/',
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: 'Calorie calculator' },
      ],
      webApplication: { name: 'Calorie calculator' },
      faq: [{ question: 'What is BMR?', answer: 'Basal metabolic rate.' }],
    });

    const scripts = jsonLdScripts();
    expect(scripts).toHaveLength(3);

    const nodes = scripts.map(
      (script) => JSON.parse(script.textContent ?? '{}') as Record<string, unknown>,
    );
    const types = nodes.map((node) => node['@type']);
    expect(types).toEqual(
      expect.arrayContaining(['WebApplication', 'BreadcrumbList', 'FAQPage']),
    );

    const webApplication = nodes.find(
      (node) => node['@type'] === 'WebApplication',
    ) as unknown as WebApplicationNode;
    expect(webApplication.applicationCategory).toBe('HealthApplication');
    expect(webApplication.offers.price).toBe('0');

    const breadcrumb = nodes.find(
      (node) => node['@type'] === 'BreadcrumbList',
    ) as unknown as BreadcrumbNode;
    expect(breadcrumb.itemListElement.map((item) => item.item)).toEqual([
      'https://fitcalc.example/',
      'https://fitcalc.example/calorie-calculator/',
    ]);

    const faq = nodes.find((node) => node['@type'] === 'FAQPage') as unknown as FaqNode;
    expect(faq.mainEntity[0]?.name).toBe('What is BMR?');
    expect(faq.mainEntity[0]?.acceptedAnswer.text).toBe('Basal metabolic rate.');
  });

  it('replaces stale structured data on navigation', () => {
    service.setPage({
      ...PAGE_META.calorieCalculator,
      path: '/calorie-calculator/',
      breadcrumbs: [{ label: 'Home', path: '/' }],
      faq: [{ question: 'Question?', answer: 'Answer.' }],
    });

    service.setPage({
      ...PAGE_META.about,
      path: '/about/',
      breadcrumbs: [{ label: 'Home', path: '/' }, { label: 'About' }],
    });

    const scripts = jsonLdScripts();
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0]?.textContent ?? '{}')['@type']).toBe(
      'BreadcrumbList',
    );
  });

  it('marks the not-found page as noindex', () => {
    service.setPage({ ...PAGE_META.notFound, path: '/404/', robots: 'noindex, nofollow' });
    expect(meta('name', 'robots')).toBe('noindex, nofollow');
  });

  it('keeps titles and descriptions unique across routes', () => {
    const entries = Object.values(PAGE_META);
    expect(new Set(entries.map((entry) => entry.title)).size).toBe(entries.length);
    expect(new Set(entries.map((entry) => entry.description)).size).toBe(
      entries.length,
    );
  });
});
