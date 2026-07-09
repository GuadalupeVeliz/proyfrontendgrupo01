import { Routes } from '@angular/router';
import { HomeComponent } from './pages/cliente/home/home.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'paquetes-turisticos', loadChildren: () => import('./routes/paquete-turistico.routes').then((m) => m.paqueteTuristicoRoutes) },
  { path: 'vacantes/:id', loadComponent: () => import('./pages/cliente/vacantes/vacantes.component').then((m) => m.VacantesComponent) },

  { path: 'auth', loadChildren: () => import('./routes/auth.routes').then((m) => m.authRoutes) },
  { path: 'admin', loadChildren: () => import('./routes/admin.routes').then((m) => m.adminRoutes) },

  { path: 'unauthorized', component: UnauthorizedComponent },

  { path: '', loadChildren: () => import('./routes/cliente.routes').then((m) => m.clienteRoutes) },

  { path: '**', redirectTo: 'home' },
];