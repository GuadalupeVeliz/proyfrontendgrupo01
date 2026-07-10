import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService } from '../../../core/services/auth.service';
import { Reserva } from '../../../models/reserva.interface';
import { CommonModule } from '@angular/common';
import { PaqueteService } from '../../../core/services/paquete.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reserva',
  imports: [CommonModule],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit {
  reservas: any = [];
  reservaSeleccionada: any;
  clienteId: number = 0;
  paquete: any;

  constructor(
    private reservaService: ReservaService,
    public authService: AuthService,
    private paqueteService: PaqueteService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.clienteId = Number(localStorage.getItem('clienteId') || localStorage.getItem('idCliente'))
    this.cargarReservas();
  }

  mostrarReserva(reserva: Reserva): void {
    this.reservaSeleccionada = reserva;
    this.buscarPaquete(this.reservaSeleccionada.vacante.paqueteTuristicoId);
  }

  buscarPaquete(paqueteId: number): void {
    this.paqueteService.getPaqueteById(paqueteId).subscribe({
      next: (response) => {
        this.paquete = response.data;
      },
      error: (error) => {
        console.error('Error al cargar paquete', error)
        this.toastService.error('No se pudo cargar el paquete de la reserva.');
      }
    })
  }

  cargarReservas(): void {
    this.reservaService.getReservasByClient(this.clienteId).subscribe({
      next: (response) => {
        this.reservas = response.data;
      },
      error: (error) => {
        console.error('Error al cargar reservas', error);
        this.toastService.error(this.obtenerMensajeError(error, 'No se pudieron cargar las reservas.'));
      }
    });
  }



  cancelarReserva(id: number): void {
    this.reservaService.cancelarReserva(id)
      .subscribe({
        next: () => {
          this.cargarReservas();
          this.cerrarModal();
          this.toastService.success('Reserva cancelada correctamente.');
        },
        error: (error) => {
          console.error(error);
          this.toastService.error(this.obtenerMensajeError(error, 'No se pudo cancelar la reserva.'));
        }
      });
  }

  confirmarReserva(id: number): void {
    this.reservaService.confirmReserva(id).subscribe({
      next: (response) => {
        window.location.href = response.data.init_point;
      },
      error: (error) => {
        console.error(error);
        this.toastService.error(this.obtenerMensajeError(error, 'No se pudo iniciar el pago.'));
      }
    });
  }

  obtenerMontoTotal(): number {
    const precioBase = Number(this.paquete?.precioBase ?? 0);
    const cantidad = Number(this.reservaSeleccionada?.cantidadDePersonas ?? 0);

    return precioBase * cantidad;
  }

  obtenerMensajeError(error: unknown, mensajePorDefecto: string): string {
    const httpError = error as {
      status?: number;
      error?: { message?: string; error?: string; mensaje?: string };
    };

    const mensajeBackend =
      httpError.error?.message ?? httpError.error?.error ?? httpError.error?.mensaje;

    if (mensajeBackend) {
      return mensajeBackend;
    }

    if (httpError.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }

    return mensajePorDefecto;
  }


  cerrarModal(): void {
    const botonCerrar = document.querySelector(
      '#detalleReservaModal [data-bs-dismiss="modal"]') as HTMLElement;
    botonCerrar?.click();
  }
}
