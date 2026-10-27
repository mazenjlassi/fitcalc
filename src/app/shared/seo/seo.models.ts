export interface SeoBreadcrumb {
  readonly label: string;
  readonly path?: string;
}

export interface SeoFaqEntry {
  readonly question: string;
  readonly answer: string;
}

export interface SeoWebApplication {
  readonly name: string;
  readonly description?: string;
}

export interface SeoPage {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly robots?: string;
  readonly breadcrumbs?: readonly SeoBreadcrumb[];
  readonly webApplication?: SeoWebApplication;
  readonly faq?: readonly SeoFaqEntry[];
  readonly jsonLd?: readonly Record<string, unknown>[];
}

export type JsonLdNode = Record<string, unknown>;
