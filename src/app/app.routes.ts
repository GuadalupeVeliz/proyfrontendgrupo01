import { Routes } from '@angular/router';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'admin',
    loadChildren: () => import('./routes/admin.auth.routes').then((m) => m.adminAuthRoutes),
  },
  {
    path: 'auth',
    loadChildren: () => import('./routes/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'paquetes-turisticos',
    loadChildren: () => import('./routes/paquete-turistico.routes').then((m) => m.paqueteTuristicoRoutes)
  },
  {
    path: 'vacantes/:id',
    loadComponent: () =>
      import('./pages/vacantes/vacantes.component').then(
        (m) => m.VacantesComponent
      ),
  },
  {
    path: 'mis-reservas', loadComponent: () => 
      import('./pages/reserva/reserva/reserva.component').then(
        (m) => m.ReservaComponent
      )
  },
  {
    path: 'perfil/editar',
    canActivate: [authGuard],
    data: { roles: ['Cliente', 'Recepcionista', 'Gerente'] },
    loadComponent: () =>
      import('./pages/perfil/perfil-form/perfil-form.component').then(
        (m) => m.PerfilFormComponent
      ),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    data: { roles: ['Cliente', 'Recepcionista', 'Gerente'] },
    loadComponent: () =>
      import('./pages/perfil/perfil.component').then((m) => m.PerfilComponent),
  },
  
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
