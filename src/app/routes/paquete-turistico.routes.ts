import { Routes } from '@angular/router';

export const paqueteTuristicoRoutes: Routes = [
  {
    path: ':id',
    loadComponent: () =>
      import('../pages/paquete-detalle/paquete-detalle.component').then(
        (m) => m.PaqueteDetalleComponent
      ),
  },
];
