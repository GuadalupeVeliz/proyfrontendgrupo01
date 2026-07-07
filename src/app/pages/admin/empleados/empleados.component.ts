import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { ToastService } from '../../../core/services/toast.service';
import { Empleado } from '../../../models/empleado.interface';
import { AdminPageHeaderComponent } from '../../../shared/components/admin-page-header/admin-page-header.component';
import { AdminToolbarComponent } from '../../../shared/components/admin-toolbar/admin-toolbar.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ManagementCardComponent } from '../../../shared/components/management-card/management-card.component';

@Component({
  selector: 'app-empleados',
  imports: [
    AdminPageHeaderComponent,
    AdminToolbarComponent,
    ManagementCardComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.css',
})
export class EmpleadosComponent implements OnInit {
  busqueda = '';
  empleados: Empleado[] = [];
  mostrarConfirmacion = false;
  empleadoAEliminar: Empleado | null = null;

  constructor(
    private empleadoService: EmpleadoService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getEmpleados();
  }

  getEmpleados(): void {
    this.empleadoService.getEmpleados().subscribe({
      next: (respuesta) => {
        this.empleados = respuesta.data;
      },
      error: (error) => {
        console.error('Error al obtener empleados', error);
        this.toastService.error(this.obtenerMensajeError(error, 'No se pudieron obtener los empleados'));
      },
    });
  }

  get empleadosFiltrados(): Empleado[] {
    const texto = this.busqueda.toLowerCase().trim();

    if (!texto) {
      return this.empleados;
    }

    return this.empleados.filter((empleado) => {
      const rol = this.obtenerRol(empleado).toLowerCase();

      return (
        empleado.legajo.toLowerCase().includes(texto) ||
        empleado.sede.toLowerCase().includes(texto) ||
        rol.includes(texto)
      );
    });
  }

  editarEmpleado(empleado: Empleado): void {
    this.router.navigate(['/admin/empleados/editar', empleado.id]);
  }

  eliminarEmpleado(empleado: Empleado): void {
    this.empleadoAEliminar = empleado;
    this.mostrarConfirmacion = true;
  }

  cancelarEliminacion(): void {
    this.mostrarConfirmacion = false;
    this.empleadoAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.empleadoAEliminar?.id) return;

    this.empleadoService.deleteEmpleado(this.empleadoAEliminar.id).subscribe({
      next: () => {
        this.toastService.success('Empleado eliminado correctamente');
        this.getEmpleados();
        this.cancelarEliminacion();
      },
      error: (error) => {
        console.error('Error al eliminar empleado', error);
        this.toastService.error(this.obtenerMensajeError(error, 'No se pudo eliminar el empleado'));
      },
    });
  }

  obtenerTitulo(empleado: Empleado): string {
    return `Empleado ${empleado.legajo}`;
  }

  obtenerRol(empleado: Empleado): string {
    return empleado.esGerente ? 'Gerente' : 'Recepcionista';
  }

  obtenerEstado(empleado: Empleado): string {
    return empleado.eliminado ? 'Eliminado' : 'Activo';
  }

  private obtenerMensajeError(error: unknown, mensajePorDefecto: string): string {
    const httpError = error as {
      status?: number;
      error?: { message?: string; error?: string; mensaje?: string };
    };

    const mensajeBackend =
      httpError.error?.message ?? httpError.error?.error ?? httpError.error?.mensaje;

    if (mensajeBackend) {
      return mensajeBackend;
    }

    if (httpError.status === 403) {
      return 'No tenes permisos para administrar empleados.';
    }

    if (httpError.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que la API este corriendo.';
    }

    return mensajePorDefecto;
  }
}
