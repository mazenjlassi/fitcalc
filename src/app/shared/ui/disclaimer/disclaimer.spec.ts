import { TestBed } from '@angular/core/testing';
import { DEFAULT_DISCLAIMER, UiDisclaimer } from './disclaimer';

describe('UiDisclaimer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UiDisclaimer] }).compileComponents();
  });

  it('renders the default medical disclaimer', () => {
    const fixture = TestBed.createComponent(UiDisclaimer);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('aside')?.getAttribute('aria-label')).toBe('Medical disclaimer');
    expect(element.querySelector('h2')?.textContent).toContain('Medical disclaimer');
    expect(element.querySelector('p')?.textContent).toContain(DEFAULT_DISCLAIMER);
    expect(DEFAULT_DISCLAIMER).toContain('not medical advice');
  });

  it('accepts custom heading and copy', () => {
    const fixture = TestBed.createComponent(UiDisclaimer);
    fixture.componentRef.setInput('heading', 'Before you start');
    fixture.componentRef.setInput('text', 'Custom safety copy.');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('aside')?.getAttribute('aria-label')).toBe('Before you start');
    expect(element.querySelector('h2')?.textContent).toContain('Before you start');
    expect(element.querySelector('p')?.textContent).toContain('Custom safety copy.');
  });
});
