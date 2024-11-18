import { Routes } from '@angular/router';

import { CssComponent } from './css/css.component';
import { JsonComponent } from './json/json.component';

export const routes: Routes = [
  { path: '', redirectTo: 'css', pathMatch: 'full' },
  { path: 'css', component: CssComponent },
  { path: 'json', component: JsonComponent },
];
