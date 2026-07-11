import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PaqueteService } from '../../../../core/services/paquete.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PaqueteTuristico } from '../../../../models/paquete.interface';
import { Reserva, ReservaEstado } from '../../../../models/reserva.interface';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

type FiltroReserva = 'todas' | Extract<ReservaEstado, 'pendiente' | 'confirmada' | 'cancelada'>;

@Component({
  selector: 'app-reserva',
  imports: [CurrencyPipe, DatePipe, RouterLink, ConfirmModalComponent],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.css',
})
export class MisReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  filtroActivo: FiltroReserva = 'todas';
  reservaACancelar: Reserva | null = null;
  cargando = true;
  errorCarga = false;
  cancelando = false;

  readonly filtros: Array<{ valor: FiltroReserva; texto: string }> = [
    { valor: 'todas', texto: 'Todas' },
    { valor: 'pendiente', texto: 'Pendientes' },
    { valor: 'confirmada', texto: 'Confirmadas' },
    { valor: 'cancelada', texto: 'Canceladas' },
  ];

  private readonly apiBaseUrl = environment.apiUrl.replace(/\/api\/v\d+\/?$/, '');

  constructor(
    private reservaService: ReservaService,
    private paqueteService: PaqueteService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  get reservasFiltradas(): Reserva[] {
    if (this.filtroActivo === 'todas') return this.reservas;
    return this.reservas.filter((reserva) => reserva.estado === this.filtroActivo);
  }

  get mensajeCancelacion(): string {
    if (!this.reservaACancelar) return '';
    return `¿Querés cancelar la reserva de ${this.obtenerNombrePaquete(this.reservaACancelar)}?\nSalida: ${this.formatearFecha(this.reservaACancelar.vacante?.fechaDeSalida)}`;
  }

  cargarReservas(): void {
    this.cargando = true;
    this.errorCarga = false;

    forkJoin({
      reservas: this.reservaService.getReservas(),
      paquetes: this.paqueteService.getPaquetes(),
    })
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: ({ reservas, paquetes }) => {
          this.reservas = reservas.data.map((reserva) => ({
            ...reserva,
            paqueteTuristico: this.obtenerPaqueteDeReserva(reserva, paquetes.data),
          }));
        },
        error: (error) => {
          console.error('Error al cargar reservas', error);
          this.errorCarga = true;
          this.toastService.error('No se pudieron cargar tus reservas.');
        },
      });
  }

  seleccionarFiltro(filtro: FiltroReserva): void {
    this.filtroActivo = filtro;
  }

  abrirCancelacion(reserva: Reserva): void {
    this.reservaACancelar = reserva;
  }

  cerrarCancelacion(): void {
    if (!this.cancelando) this.reservaACancelar = null;
  }

  confirmarCancelacion(): void {
    if (!this.reservaACancelar?.id || this.cancelando) return;

    this.cancelando = true;
    this.reservaService.cancelarReserva(this.reservaACancelar.id)
      .pipe(finalize(() => (this.cancelando = false)))
      .subscribe({
        next: ({ data }) => {
          this.reservas = this.reservas.map((reserva) =>
            reserva.id === data.id ? { ...reserva, ...data } : reserva,
          );
          this.reservaACancelar = null;
          this.toastService.success('Reserva cancelada correctamente.');
        },
        error: (error) => {
          console.error('Error al cancelar reserva', error);
          this.toastService.error(this.obtenerMensajeError(error, 'No se pudo cancelar la reserva.'));
        },
      });
  }

  continuarPago(): void {
    this.toastService.success('El módulo de pagos estará disponible próximamente.');
  }

  obtenerNombrePaquete(reserva: Reserva): string {
    return reserva.paqueteTuristico?.nombre ?? 'Paquete turístico';
  }

  obtenerUbicacion(reserva: Reserva): string {
    return reserva.paqueteTuristico?.ubicacion ?? 'Ubicación no disponible';
  }

  obtenerImagen(reserva: Reserva): string | null {
    const imagen = reserva.paqueteTuristico?.imagenes?.[0];
    if (!imagen) return null;
    if (/^(https?:|data:)/.test(imagen)) return imagen;
    return `${this.apiBaseUrl}${imagen.startsWith('/') ? '' : '/'}${imagen}`;
  }

  obtenerPrecioUnitario(reserva: Reserva): number {
    return Number(reserva.paqueteTuristico?.precioBase ?? 0);
  }

  obtenerPrecioTotal(reserva: Reserva): number {
    return this.obtenerPrecioUnitario(reserva) * Number(reserva.cantidadDePersonas);
  }

  obtenerTextoEstado(estado: ReservaEstado): string {
    const textos: Record<ReservaEstado, string> = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada',
      check_in: 'Check-in',
      check_out: 'Check-out',
    };
    return textos[estado] ?? estado;
  }

  obtenerClaseEstado(estado: ReservaEstado): string {
    const clases: Record<ReservaEstado, string> = {
      pendiente: 'text-bg-warning',
      confirmada: 'text-bg-success',
      cancelada: 'text-bg-danger',
      check_in: 'text-bg-primary',
      check_out: 'text-bg-secondary',
    };
    return clases[estado] ?? 'text-bg-secondary';
  }

  private obtenerPaqueteDeReserva(
    reserva: Reserva,
    paquetes: PaqueteTuristico[],
  ): PaqueteTuristico | undefined {
    if (reserva.vacante?.paqueteTuristico) return reserva.vacante.paqueteTuristico;
    const paqueteId = reserva.vacante?.paqueteTuristicoId;
    return paquetes.find((paquete) => paquete.id === paqueteId);
  }

  private formatearFecha(fecha?: string): string {
    if (!fecha) return 'Sin fecha disponible';
    return new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC' }).format(new Date(fecha));
  }

  private obtenerMensajeError(error: unknown, mensajePorDefecto: string): string {
    const httpError = error as {
      error?: { message?: string; error?: string; mensaje?: string };
    };
    return httpError.error?.message ?? httpError.error?.error ?? httpError.error?.mensaje ?? mensajePorDefecto;
  }
}
