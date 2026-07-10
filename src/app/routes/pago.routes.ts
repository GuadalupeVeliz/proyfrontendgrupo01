import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const pagoRoutes: Routes = [
  {
    path: 'pago',
    canActivate: [authGuard],
    children: [
      {
        path: 'exitoso',
        loadComponent: () =>
          import('../pages/cliente/pago/pago-exitoso/pago-exitoso.component')
            .then(m => m.PagoExitosoComponent),
      },
      {
        path: 'rechazado',
        loadComponent: () =>
          import('../pages/cliente/pago/pago-rechazado/pago-rechazado.component')
            .then(m => m.PagoRechazadoComponent),
      },
      {
        path: 'pendiente',
        loadComponent: () =>
          import('../pages/cliente/pago/pago-pendiente/pago-pendiente.component')
            .then(m => m.PagoPendienteComponent),
      },
    ],
  },
];