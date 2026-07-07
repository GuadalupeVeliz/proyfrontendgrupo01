import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { ToastService } from '../../../core/services/toast.service';
import { Cliente } from '../../../models/cliente.interface';
import { AdminPageHeaderComponent } from '../../../shared/components/admin-page-header/admin-page-header.component';
import { AdminToolbarComponent } from '../../../shared/components/admin-toolbar/admin-toolbar.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ManagementCardComponent } from '../../../shared/components/management-card/management-card.component';

@Component({
  selector: 'app-clientes',
  imports: [
    AdminPageHeaderComponent,
    AdminToolbarComponent,
    ManagementCardComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
})
export class ClientesComponent implements OnInit {
  busqueda = '';
  clientes: Cliente[] = [];
  mostrarConfirmacion = false;
  clienteAEliminar: Cliente | null = null;

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getClientes();
  }

  getClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (respuesta) => {
        this.clientes = respuesta.data;
      },
      error: (error) => {
        console.error('Error al obtener clientes', error);
        this.toastService.error(this.obtenerMensajeError(error, 'No se pudieron obtener los clientes'));
      },
    });
  }

  get clientesFiltrados(): Cliente[] {
    const texto = this.busqueda.toLowerCase().trim();

    if (!texto) {
      return this.clientes;
    }

    return this.clientes.filter(
      (cliente) =>
        cliente.nombreCompleto.toLowerCase().includes(texto) ||
        cliente.dni.toLowerCase().includes(texto) ||
        cliente.telefono.toLowerCase().includes(texto)
    );
  }

  editarCliente(cliente: Cliente): void {
    this.router.navigate(['/admin/clientes/editar', cliente.id]);
  }

  eliminarCliente(cliente: Cliente): void {
    this.clienteAEliminar = cliente;
    this.mostrarConfirmacion = true;
  }

  cancelarEliminacion(): void {
    this.mostrarConfirmacion = false;
    this.clienteAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.clienteAEliminar?.id) return;

    this.clienteService.deleteCliente(this.clienteAEliminar.id).subscribe({
      next: () => {
        this.toastService.success('Cliente eliminado correctamente');
        this.getClientes();
        this.cancelarEliminacion();
      },
      error: (error) => {
        console.error('Error al eliminar cliente', error);
        this.toastService.error(this.obtenerMensajeError(error, 'No se pudo eliminar el cliente'));
      },
    });
  }

  obtenerEstado(cliente: Cliente): string {
    return cliente.eliminado ? 'Eliminado' : 'Activo';
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
      return 'No tenes permisos para administrar clientes.';
    }

    if (httpError.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que la API este corriendo.';
    }

    return mensajePorDefecto;
  }
}
