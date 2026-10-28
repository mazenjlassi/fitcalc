import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'calorie-calculator',
    loadComponent: () =>
      import('./pages/calorie-calculator/calorie-calculator').then(
        (m) => m.CalorieCalculator,
      ),
  },
  {
    path: 'protein-calculator',
    loadComponent: () =>
      import('./pages/protein-calculator/protein-calculator').then(
        (m) => m.ProteinCalculator,
      ),
  },
  {
    path: 'body-fat-calculator',
    loadComponent: () =>
      import('./pages/body-fat-calculator/body-fat-calculator').then(
        (m) => m.BodyFatCalculator,
      ),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
