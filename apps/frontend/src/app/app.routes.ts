import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users',
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/pages/user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      ),
  },
  {
    path: 'smiley',
    loadComponent: () =>
      import('./smiley/smiley.component').then((m) => m.SmileyComponent),
  },
  {
    path: '**',
    redirectTo: 'users',
  },
];
