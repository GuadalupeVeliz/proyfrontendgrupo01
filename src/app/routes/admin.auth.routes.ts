import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const adminAuthRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../pages/auth/admin-login/admin-login.component')
      .then(m => m.AdminLoginComponent),
  },

  {
    path: '',
    canActivate: [authGuard],
    data: { roles: ['Gerente'] },
    children: [
      { path: 'signup', loadComponent: () => import('../pages/admin/signup/admin-signup.component').then(m => m.AdminSignupComponent) },
      { path: 'vacantes/nuevo', loadComponent: () => import('../pages/admin/vacantes/vacante-form/vacante-form.component').then(m => m.VacanteFormComponent) },
      { path: 'vacantes/editar/:id', loadComponent: () => import('../pages/admin/vacantes/vacante-form/vacante-form.component').then(m => m.VacanteFormComponent) },
      { path: 'empleados', loadComponent: () => import('../pages/admin/empleados/empleados.component').then(m => m.EmpleadosComponent) },
      { path: 'empleados/nuevo', loadComponent: () => import('../pages/admin/empleados/empleado-form/empleado-form.component').then(m => m.EmpleadoFormComponent) },
      { path: 'empleados/editar/:id', loadComponent: () => import('../pages/admin/empleados/empleado-form/empleado-form.component').then(m => m.EmpleadoFormComponent) },
      { path: 'estadisticas', loadComponent: () => import('../pages/admin/estadisticaa/estadisticaa.component').then(m => m.EstadisticaaComponent) },
      { path: 'paquetes/nuevo', loadComponent: () => import('../pages/admin/paquetes/paquete-form/paquete-form.component').then(m => m.PaqueteFormComponent) },
      { path: 'paquetes/editar/:id', loadComponent: () => import('../pages/admin/paquetes/paquete-form/paquete-form.component').then(m => m.PaqueteFormComponent) },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    data: { roles: ['Gerente', 'Recepcionista'] },
    children: [
      { path: '', loadComponent: () => import('../pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'paquetes', loadComponent: () => import('../pages/admin/paquetes/paquetes.component').then(m => m.PaquetesComponent) },
      { path: 'vacantes', loadComponent: () => import('../pages/admin/vacantes/vacantes.component').then(m => m.VacantesComponent) },
      { path: 'reservas', loadComponent: () => import('../pages/admin/reservas/reservas.component').then(m => m.ReservasComponent) },
      { path: 'reservas/:id', loadComponent: () => import('../pages/admin/reservas/reservas.component').then(m => m.ReservasComponent) },
      { path: 'clientes', loadComponent: () => import('../pages/admin/clientes/clientes.component').then(m => m.ClientesComponent) },
      { path: 'clientes/nuevo', loadComponent: () => import('../pages/admin/clientes/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent) },
      { path: 'clientes/editar/:id', loadComponent: () => import('../pages/admin/clientes/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent) },
    ],
  },
];