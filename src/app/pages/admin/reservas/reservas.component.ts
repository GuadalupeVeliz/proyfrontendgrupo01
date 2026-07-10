import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PaqueteService } from '../../../core/services/paquete.service';
import { ReservaService } from '../../../core/services/reserva.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PaqueteTuristico } from '../../../models/paquete.interface';
import { Reserva, ReservaEstado } from '../../../models/reserva.interface';
import { AdminPageHeaderComponent } from '../../../shared/components/admin-page-header/admin-page-header.component';
import { AdminToolbarComponent } from '../../../shared/components/admin-toolbar/admin-toolbar.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import {
  CardAction,
  ManagementCardComponent,
} from '../../../shared/components/management-card/management-card.component';

type PaqueteConVacantes = PaqueteTuristico & {
  vacantes?: Array<{ id?: number }>;
};

@Component({
  selector: 'app-reservas',
  imports: [
    CurrencyPipe,
    DatePipe,
    AdminPageHeaderComponent,
    AdminToolbarComponent,
    ManagementCardComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css',
})
export class ReservasComponent implements OnInit {
  busqueda = '';
  reservas: Reserva[] = [];
  reservaDetalle: Reserva | null = null;
  reservaACancelar: Reserva | null = null;
  mostrarConfirmacion = false;
  modoDetalle = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService,
    private paqueteService: PaqueteService,
    private toastService: ToastService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modoDetalle = true;
      this.cargarDetalle(Number(id));
      return;
    }

    this.getReservas();
  }

  getReservas(): void {
    forkJoin({
      reservas: this.reservaService.getReservas(),
      paquetes: this.paqueteService.getPaquetes(),
    }).subscribe({
      next: ({ reservas, paquetes }) => {
        this.reservas = this.completarPaquetes(
          reservas.data,
          paquetes.data as PaqueteConVacantes[]
        );
      },
      error: (error) => {
        console.error('Error al obtener reservas', error);
        this.toastService.error(this.obtenerMensajeError(error, 'No se pudieron obtener las reservas'));
      },
    });
  }

  cargarDetalle(id: number): void {
    forkJoin({
      reserva: this.reservaService.getReservaById(id),
      paquetes: this.paqueteService.getPaquetes(),
    }).subscribe({
      next: ({ reserva, paquetes }) => {
        this.reservaDetalle = this.completarPaquetes(
          [reserva.data],
          paquetes.data as PaqueteConVacantes[]
        )[0];
        this.cargarCorreoDelCliente(this.reservaDetalle);
      },
      error: (error) => {
        console.error('Error al obtener reserva', error);
        this.toastService.error(
          this.obtenerMensajeError(error, 'No se pudo obtener el detalle de la reserva')
        );
        this.router.navigate(['/admin/reservas']);
      },
    });
  }

  get reservasFiltradas(): Reserva[] {
    const texto = this.busqueda.toLowerCase().trim();

    if (!texto) {
      return this.reservas;
    }

    return this.reservas.filter((reserva) => {
      const cliente = this.obtenerCliente(reserva).toLowerCase();
      const dni = reserva.cliente?.dni?.toLowerCase() ?? '';
      const paquete = this.obtenerPaquete(reserva).toLowerCase();

      return cliente.includes(texto) || dni.includes(texto) || paquete.includes(texto);
    });
  }

  get pendientes(): number {
    return this.contarPorEstado('pendiente');
  }

  get confirmadas(): number {
    return this.contarPorEstado('confirmada');
  }

  get canceladas(): number {
    return this.contarPorEstado('cancelada');
  }

  obtenerCliente(reserva: Reserva | null): string {
    return reserva?.cliente?.nombreCompleto ?? 'Cliente no disponible';
  }

  obtenerCorreo(reserva: Reserva | null): string {
    return reserva?.cliente?.correoElectronico ?? 'No disponible';
  }

  obtenerPaquete(reserva: Reserva | null): string {
    return (
      reserva?.paqueteTuristico?.nombre ??
      reserva?.vacante?.paqueteTuristico?.nombre ??
      'Paquete no disponible'
    );
  }

  obtenerFechaSalida(reserva: Reserva | null): string {
    return reserva?.vacante?.fechaDeSalida ?? 'Sin fecha';
  }

  obtenerPrecioTotal(reserva: Reserva | null): number {
    const precioBase = Number(
      reserva?.paqueteTuristico?.precioBase ?? reserva?.vacante?.paqueteTuristico?.precioBase ?? 0
    );

    return precioBase * Number(reserva?.cantidadDePersonas ?? 0);
  }

  obtenerEstado(reserva: Reserva): string {
    const estados: Record<ReservaEstado, string> = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada',
      check_in: 'Check-in',
      check_out: 'Check-out',
    };

    return estados[reserva.estado] ?? reserva.estado;
  }

  accionesReserva(reserva: Reserva): CardAction[] {
    const cancelada = reserva.estado === 'cancelada';
    const confirmada = reserva.estado === 'confirmada';

    return [
      {
        id: 'detalle',
        icono: 'bi bi-eye',
        titulo: 'Ver detalle',
        variante: 'primary',
      },
      {
        id: 'cancelar',
        icono: 'bi bi-x-lg',
        titulo: 'Cancelar',
        variante: 'danger',
        deshabilitada: cancelada,
      },
      {
        id: 'confirmar',
        icono: 'bi bi-credit-card',
        titulo: 'Confirmar y continuar al pago',
        variante: 'success',
        deshabilitada: cancelada || confirmada,
      },
    ];
  }

  ejecutarAccion(accion: string, reserva: Reserva): void {
    if (accion === 'detalle') {
      this.router.navigate(['/admin/reservas', reserva.id]);
      return;
    }

    if (accion === 'cancelar') {
      this.cancelarReserva(reserva);
      return;
    }

    if (accion === 'confirmar') {
      this.toastService.success('El módulo de pagos estará disponible próximamente.');
    }
  }

  cancelarReserva(reserva: Reserva): void {
    this.reservaACancelar = reserva;
    this.mostrarConfirmacion = true;
  }

  cancelarConfirmacion(): void {
    this.mostrarConfirmacion = false;
    this.reservaACancelar = null;
  }

  confirmarCancelacion(): void {
    if (!this.reservaACancelar?.id) return;

    this.reservaService.cancelarReserva(this.reservaACancelar.id).subscribe({
      next: () => {
        this.toastService.success('Reserva cancelada correctamente');
        this.getReservas();
        this.cancelarConfirmacion();
      },
      error: (error) => {
        console.error('Error al cancelar reserva', error);
        this.toastService.error(this.obtenerMensajeError(error, 'No se pudo cancelar la reserva'));
      },
    });
  }

  private contarPorEstado(estado: ReservaEstado): number {
    return this.reservas.filter((reserva) => reserva.estado === estado).length;
  }

  private cargarCorreoDelCliente(reserva: Reserva): void {
    const usuarioId = reserva.cliente?.usuarioId;
    if (!usuarioId || this.authService.getRol() !== 'Gerente') return;

    this.usuarioService.getUsuarioById(usuarioId).subscribe({
      next: ({ data }) => {
        if (this.reservaDetalle?.cliente) {
          this.reservaDetalle = {
            ...this.reservaDetalle,
            cliente: {
              ...this.reservaDetalle.cliente,
              correoElectronico: data.correoElectronico,
            },
          };
        }
      },
      error: () => {
        // El detalle de la reserva sigue siendo util aunque el correo no esté disponible.
      },
    });
  }

  private completarPaquetes(reservas: Reserva[], paquetes: PaqueteConVacantes[]): Reserva[] {
    return reservas.map((reserva) => ({
      ...reserva,
      paqueteTuristico: this.buscarPaqueteDeReserva(reserva, paquetes),
    }));
  }

  private buscarPaqueteDeReserva(
    reserva: Reserva,
    paquetes: PaqueteConVacantes[]
  ): PaqueteTuristico | undefined {
    const paqueteDesdeVacante = reserva.vacante?.paqueteTuristico;

    if (paqueteDesdeVacante) {
      return paqueteDesdeVacante;
    }

    const vacanteId = reserva.vacante?.id ?? reserva.vacanteId;
    return paquetes.find((paquete) =>
      paquete.vacantes?.some((vacante) => vacante.id === vacanteId)
    );
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
      return 'No tenes permisos o tu sesion expiro. Volve a iniciar sesion.';
    }

    if (httpError.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que la API este corriendo.';
    }

    return mensajePorDefecto;
  }
}
