import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'fitcalc — free, private fitness calculators',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'calorie-calculator',
    title: 'Calorie Calculator — fitcalc',
    loadComponent: () =>
      import('./pages/calorie-calculator/calorie-calculator').then(
        (m) => m.CalorieCalculator,
      ),
  },
  {
    path: 'protein-calculator',
    title: 'Protein Calculator — fitcalc',
    loadComponent: () =>
      import('./pages/protein-calculator/protein-calculator').then(
        (m) => m.ProteinCalculator,
      ),
  },
  {
    path: 'body-fat-calculator',
    title: 'Body Fat Calculator — fitcalc',
    loadComponent: () =>
      import('./pages/body-fat-calculator/body-fat-calculator').then(
        (m) => m.BodyFatCalculator,
      ),
  },
  {
    path: 'about',
    title: 'About — fitcalc',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    title: 'Contact — fitcalc',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'privacy',
    title: 'Privacy — fitcalc',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: '**',
    title: 'Page not found — fitcalc',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
