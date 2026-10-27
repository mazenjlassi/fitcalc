import { InjectionToken } from '@angular/core';

const DEFAULT_SITE_URL = 'http://localhost:4200';

function environmentValue(name: string): string | undefined {
  const runtime = globalThis as {
    process?: { env?: Record<string, string | undefined> };
  };

  return runtime.process?.env?.[name];
}

export function normalizeSiteUrl(value: string): string {
  const url = new URL(value);
  const path = url.pathname.replace(/\/+$/, '');
  return `${url.origin}${path}`;
}

export function resolveSiteUrl(): string {
  const browserOrigin =
    typeof document === 'undefined' ? undefined : document.location.origin;
  const canonicalOrigin = readCanonicalOrigin();
  const configured =
    environmentValue('SITE_URL') ??
    environmentValue('CF_PAGES_URL') ??
    canonicalOrigin ??
    browserOrigin ??
    DEFAULT_SITE_URL;

  return normalizeSiteUrl(configured);
}

function readCanonicalOrigin(): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const href = document
    .querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?.getAttribute('href');

  if (!href) {
    return undefined;
  }

  try {
    return new URL(href, document.baseURI).origin;
  } catch {
    return undefined;
  }
}

export const SITE_URL = new InjectionToken<string>('SITE_URL', {
  providedIn: 'root',
  factory: resolveSiteUrl,
});
