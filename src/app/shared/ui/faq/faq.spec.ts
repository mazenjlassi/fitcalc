import { TestBed } from '@angular/core/testing';
import { UiFaq, type FaqItem } from './faq';

const ITEMS: readonly FaqItem[] = [
  { question: 'What is BMR?', answer: 'Energy used at rest.' },
  { question: 'Is this medical advice?', answer: 'No, it is a general estimate.' },
];

describe('UiFaq', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UiFaq] }).compileComponents();
  });

  it('renders accessible disclosure items', () => {
    const fixture = TestBed.createComponent(UiFaq);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const details = element.querySelectorAll('details');

    expect(element.querySelector('section')?.getAttribute('aria-label')).toBe(
      'Frequently asked questions',
    );
    expect(element.querySelector('h2')?.textContent).toContain('Frequently asked questions');
    expect(details).toHaveLength(2);
    expect(element.querySelectorAll('summary')[0].textContent).toContain('What is BMR?');
    expect(element.querySelector('details p')?.textContent).toContain('Energy used at rest.');
  });
});
