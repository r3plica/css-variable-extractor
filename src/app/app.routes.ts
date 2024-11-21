import { Routes } from '@angular/router';

import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'css',
    loadChildren: () => import('./css/css.module').then((m) => m.CssModule),
  },
  {
    path: 'json',
    loadChildren: () => import('./json/json.module').then((m) => m.JsonModule),
  },
  {
    path: 'colors',
    loadChildren: () =>
      import('./colors/colors.module').then((m) => m.ColorsModule),
  },
];
