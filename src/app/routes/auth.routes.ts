import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'signup',
    loadComponent: () =>
      import('../pages/signup/signup.component').then(m => m.SignupComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../pages/login/login.component').then(m => m.LoginComponent),
  },
];