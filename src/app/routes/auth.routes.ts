import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'signup',
    loadComponent: () =>
      import('../pages/auth/cliente-signup/cliente-signup.component').then(m => m.ClienteSignupComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../pages/auth/cliente-login/cliente-login.component').then(m => m.ClienteLoginComponent),
  },
];