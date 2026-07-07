import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminModule } from '../../../models/admin-module.interface';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard-panel.component.html',
  styleUrl: './dashboard-panel.component.css',
})
export class DashboardPanelComponent {
  modulos: AdminModule[] = [
    {
      titulo: 'Paquetes',
      descripcion: 'Administre los paquetes turísticos disponibles.',
      icono: 'bi bi-box-seam',
      ruta: '/admin/paquetes',
      roles: ['Gerente', 'Recepcionista'],
    },
    {
      titulo: 'Vacantes',
      descripcion: 'Administre fechas de salida y cupos.',
      icono: 'bi bi-calendar-event',
      ruta: '/admin/vacantes',
      roles: ['Gerente', 'Recepcionista'],
    },
    {
      titulo: 'Reservas',
      descripcion: 'Consulte las reservas registradas.',
      icono: 'bi bi-journal-check',
      ruta: '/admin/reservas',
      roles: ['Gerente', 'Recepcionista'],
    },
    {
      titulo: 'Clientes',
      descripcion: 'Consulte los clientes registrados.',
      icono: 'bi bi-people',
      ruta: '/admin/clientes',
      roles: ['Gerente', 'Recepcionista'],
    },
    {
      titulo: 'Empleados',
      descripcion: 'Administre empleados y permisos del sistema.',
      icono: 'bi bi-person-badge',
      ruta: '/admin/empleados',
      roles: ['Gerente'],
    },
    {
      titulo: 'Estadisticaa',
      descripcion: 'Consulte las estadisticas generales del sistema.',
      icono: 'bi bi-bar-chart-line',
      ruta: '/admin/estadisticaa',
      roles: ['Gerente'],
    },
  ];

  constructor(private authService: AuthService) {}

  get rol(): string | null {
    return this.authService.getRol();
  }

  get modulosVisibles(): AdminModule[] {
    return this.modulos.filter((modulo) =>
      modulo.roles.includes(this.rol ?? '')
    );
  }
}
