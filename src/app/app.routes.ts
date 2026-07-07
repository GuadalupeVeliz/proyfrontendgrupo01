import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
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
  {
    path: 'vacantes/:id',
    loadComponent: () =>
      import('./pages/vacantes/vacantes.component').then(
        (m) => m.VacantesComponent
      ),
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
  path: 'admin',
  canActivate: [authGuard],
  data: { roles: ['Gerente', 'Recepcionista'] },
  loadComponent: () =>
    import('./pages/admin/dashboard/dashboard.component').then(
      m => m.DashboardComponent
    ),
},
{
  path: 'admin/paquetes',
  canActivate: [authGuard],
  data: { roles: ['Gerente', 'Recepcionista'] },
  loadComponent: () =>
    import('./pages/admin/paquetes/paquetes.component').then(
      m => m.PaquetesComponent
    ),
},
{
  path: 'admin/vacantes',
  canActivate: [authGuard],
  data: { roles: ['Gerente', 'Recepcionista'] },
  loadComponent: () =>
    import('./pages/admin/vacantes/vacantes.component').then(
      m => m.VacantesComponent
    ),
},
{
  path: 'admin/vacantes/nuevo',
  canActivate: [authGuard],
  data: { roles: ['Gerente'] },
  loadComponent: () =>
    import('./pages/admin/vacantes/vacante-form/vacante-form.component').then(
      m => m.VacanteFormComponent
    ),
},
{
  path: 'admin/vacantes/editar/:id',
  canActivate: [authGuard],
  data: { roles: ['Gerente'] },
  loadComponent: () =>
    import('./pages/admin/vacantes/vacante-form/vacante-form.component').then(
      m => m.VacanteFormComponent
    ),
},
{
  path: 'admin/reservas',
  canActivate: [authGuard],
  data: { roles: ['Gerente', 'Recepcionista'] },
  loadComponent: () =>
    import('./pages/admin/reservas/reservas.component').then(
      m => m.ReservasComponent
    ),
},
{
  path: 'admin/reservas/:id',
  canActivate: [authGuard],
  data: { roles: ['Gerente', 'Recepcionista'] },
  loadComponent: () =>
    import('./pages/admin/reservas/reservas.component').then(
      m => m.ReservasComponent
    ),
},
{
  path: 'admin/clientes',
  canActivate: [authGuard],
  data: { roles: ['Gerente', 'Recepcionista'] },
  loadComponent: () =>
    import('./pages/admin/clientes/clientes.component').then(
      m => m.ClientesComponent
    ),
},
{
  path: 'admin/clientes/nuevo',
  canActivate: [authGuard],
  data: { roles: ['Gerente', 'Recepcionista'] },
  loadComponent: () =>
    import('./pages/admin/clientes/cliente-form/cliente-form.component').then(
      m => m.ClienteFormComponent
    ),
},
{
  path: 'admin/clientes/editar/:id',
  canActivate: [authGuard],
  data: { roles: ['Gerente', 'Recepcionista'] },
  loadComponent: () =>
    import('./pages/admin/clientes/cliente-form/cliente-form.component').then(
      m => m.ClienteFormComponent
    ),
},
{
  path: 'admin/empleados',
  canActivate: [authGuard],
  data: { roles: ['Gerente'] },
  loadComponent: () =>
    import('./pages/admin/empleados/empleados.component').then(
      m => m.EmpleadosComponent
    ),
},
{
  path: 'admin/empleados/nuevo',
  canActivate: [authGuard],
  data: { roles: ['Gerente'] },
  loadComponent: () =>
    import('./pages/admin/empleados/empleado-form/empleado-form.component').then(
      m => m.EmpleadoFormComponent
    ),
},
{
  path: 'admin/empleados/editar/:id',
  canActivate: [authGuard],
  data: { roles: ['Gerente'] },
  loadComponent: () =>
    import('./pages/admin/empleados/empleado-form/empleado-form.component').then(
      m => m.EmpleadoFormComponent
    ),
},
{
  path: 'admin/estadisticaa',
  canActivate: [authGuard],
  data: { roles: ['Gerente'] },
  loadComponent: () =>
    import('./pages/admin/estadisticaa/estadisticaa.component').then(
      m => m.EstadisticaaComponent
    ),
},
{
  path: 'admin/paquetes/nuevo',
  canActivate: [authGuard],
  data: { roles: ['Gerente'] },
  loadComponent: () =>
    import('./pages/admin/paquetes/paquete-form/paquete-form.component').then(
      m => m.PaqueteFormComponent
    ),
},
{
  path: 'admin/paquetes/editar/:id',
  canActivate: [authGuard],
  data: { roles: ['Gerente'] },
  loadComponent: () =>
    import('./pages/admin/paquetes/paquete-form/paquete-form.component').then(
      m => m.PaqueteFormComponent
    ),
},
];
