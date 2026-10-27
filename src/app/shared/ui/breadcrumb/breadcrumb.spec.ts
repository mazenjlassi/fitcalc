import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UiBreadcrumb, type BreadcrumbItem } from './breadcrumb';

const ITEMS: readonly BreadcrumbItem[] = [
  { label: 'Home', link: '/' },
  { label: 'Calorie calculator', link: '/calorie-calculator/' },
];

describe('UiBreadcrumb', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiBreadcrumb],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders links and marks the current page', () => {
    const fixture = TestBed.createComponent(UiBreadcrumb);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const nav = element.querySelector('nav');
    const links = element.querySelectorAll('a');
    const current = element.querySelector('[aria-current="page"]');

    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toContain('Home');
    expect(links[0].getAttribute('href')).toBe('/');
    expect(current?.textContent).toContain('Calorie calculator');
    expect(element.querySelectorAll('li')).toHaveLength(2);
  });
});
