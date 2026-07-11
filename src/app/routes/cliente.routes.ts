import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const clienteRoutes: Routes = [
  {
    path: 'perfil',
    canActivate: [authGuard],
    data: { roles: ['Cliente', 'Recepcionista', 'Gerente'] },
    loadComponent: () =>
      import('../pages/cliente/perfil/perfil.component').then((m) => m.PerfilComponent),
  },
  {
    path: 'perfil/editar',
    canActivate: [authGuard],
    data: { roles: ['Cliente', 'Recepcionista', 'Gerente'] },
    loadComponent: () =>
      import('../pages/cliente/perfil/perfil-form/perfil-form.component').then(
        (m) => m.PerfilFormComponent
      ),
  },
  {
    path: 'mis-reservas',
    canActivate: [authGuard],
    data: { roles: ['Cliente'] },
    loadComponent: () =>
      import('../pages/cliente/reserva/mis-reservas/mis-reserva.scomponent').then((m) => m.MisReservasComponent),
  },
  {
    path: 'resumen-reserva',
    canActivate: [authGuard],
    data: { roles: ['Cliente'] },
    loadComponent: () => import('../pages/cliente/reserva/resumen-reserva/resumen-reserva.component').then((m) => m.ResumenReservaComponent),
  }
  // {
  //   path: 'mis-comprobantes',
  //   canActivate: [authGuard],
  //   data: { roles: ['Cliente'] },
  //   loadComponent: () =>
  //     import('../pages/cliente/comprobantes/comprobantes.component').then((m) => m.ComprobantesComponent),
  // },
];