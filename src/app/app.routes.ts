import { Routes } from '@angular/router';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./routes/auth.routes').then((m) => m.authRoutes),
  },
  // {
  //   path: 'paquetes-turisticos',
  //   loadChildren: () => import('./routes/auth.routes').then((m) => m.authRoutes),
  // },
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
];
