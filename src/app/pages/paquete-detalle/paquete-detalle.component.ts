import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { PaqueteService } from '../../core/services/paquete.service';
import { ReservaService } from '../../core/services/reserva.service';
import { ToastService } from '../../core/services/toast.service';
import { VacanteService } from '../../core/services/vacante.service';
import { environment } from '../../../environments/environment';
import { PaqueteTuristico } from '../../models/paquete.interface';
import { Reserva, ReservaRequest } from '../../models/reserva.interface';
import { Vacante } from '../../models/vacante.interface';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

interface DetalleReservaState {
  reserva?: Reserva;
  paquete: PaqueteTuristico;
  fechaDeSalida: string;
  cantidadDePersonas: number;
  total: number;
}

type ReservaCreateResponse = Reserva | { success: boolean; data: Reserva };

@Component({
  selector: 'app-paquete-detalle',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ConfirmModalComponent],
  templateUrl: './paquete-detalle.component.html',
  styleUrl: './paquete-detalle.component.css',
})
export class PaqueteDetalleComponent implements OnInit, OnDestroy {
  paquete: PaqueteTuristico | null = null;
  vacantes: Vacante[] = [];
  cargando = true;
  mostrarConfirmacion = false;
  visorAbierto = false;
  fechasDropdownAbierto = false;
  imagenActivaIndex = 0;
  imagenGaleriaIndex = 0;
  cantidadPersonas = 1;

  vacanteControl = new FormControl<number | null>(null);

  private destroy$ = new Subject<void>();
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/api\/v\d+\/?$/, '');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paqueteService: PaqueteService,
    private vacanteService: VacanteService,
    private reservaService: ReservaService,
    private toastService: ToastService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.cargarDetalle();
    this.vacanteControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.ajustarCantidadAlCupo();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get imagenes(): string[] {
    return this.paquete?.imagenes ?? [];
  }

  get imagenesCollage(): string[] {
    return this.imagenes.slice(0, 5);
  }

  get imagenGaleriaActual(): string | null {
    return this.imagenes[this.imagenGaleriaIndex] ?? null;
  }

  get tieneIncluye(): boolean {
    return this.tieneItems(this.paquete?.incluye);
  }

  get tieneNoIncluye(): boolean {
    return this.tieneItems(this.paquete?.noIncluye);
  }

  get tieneRecomendaciones(): boolean {
    return this.tieneItems(this.paquete?.recomendaciones);
  }

  get vacanteSeleccionada(): Vacante | undefined {
    const id = this.vacanteControl.value;
    return this.vacantes.find((vacante) => vacante.id === id);
  }

  get cupoMaximo(): number {
    return Math.max(Number(this.vacanteSeleccionada?.cupoDisponible ?? 0), 0);
  }

  get total(): number {
    return Number(this.paquete?.precioBase ?? 0) * this.cantidadPersonas;
  }

  get resumenConfirmacion(): string {
    return [
      `Paquete: ${this.paquete?.nombre ?? ''}`,
      `Fecha seleccionada: ${this.vacanteSeleccionada?.fechaDeSalida ?? ''}`,
      `Cantidad de personas: ${this.cantidadPersonas}`,
      `Precio total: $${this.total}`,
    ].join('\n');
  }

  get dificultadTexto(): string {
    const dificultad = this.paquete?.dificultad ?? 'baja';
    return dificultad.charAt(0).toUpperCase() + dificultad.slice(1);
  }

  get dificultadBadgeClass(): string {
    switch (this.paquete?.dificultad) {
      case 'alta':
        return 'text-bg-danger';
      case 'media':
        return 'text-bg-warning';
      default:
        return 'text-bg-success';
    }
  }

  cargarDetalle(): void {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        switchMap((paqueteId) => {
          if (!paqueteId) {
            return of(null);
          }

          return combineLatest([
            this.paqueteService.getPaqueteById(paqueteId),
            this.vacanteService.getVacantes(),
          ]).pipe(
            map(([paqueteResponse, vacantesResponse]) => ({
              paquete: paqueteResponse.data,
              vacantes: vacantesResponse.data.filter(
                (vacante) => vacante.paqueteTuristicoId === paqueteId && !vacante.eliminado,
              ),
            })),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (detalle) => {
          this.cargando = false;

          if (!detalle) {
            this.router.navigate(['/home']);
            return;
          }

          this.paquete = detalle.paquete;
          this.vacantes = detalle.vacantes;
          this.seleccionarPrimeraVacanteDisponible();
        },
        error: (error) => {
          this.cargando = false;
          console.error('Error al cargar detalle del paquete', error);
          this.toastService.error('No se pudo cargar el detalle del paquete.');
        },
      });
  }

  seleccionarPrimeraVacanteDisponible(): void {
    const disponible = this.vacantes.find((vacante) => Number(vacante.cupoDisponible) > 0);
    this.vacanteControl.setValue(disponible?.id ?? this.vacantes[0]?.id ?? null);
  }

  seleccionarVacante(vacante: Vacante): void {
    this.vacanteControl.setValue(vacante.id ?? null);
    this.fechasDropdownAbierto = false;
  }

  alternarFechas(event: MouseEvent): void {
    event.stopPropagation();
    this.fechasDropdownAbierto = !this.fechasDropdownAbierto;
  }

  aumentarCantidad(): void {
    if (this.cantidadPersonas < this.cupoMaximo) {
      this.cantidadPersonas++;
    }
  }

  disminuirCantidad(): void {
    if (this.cantidadPersonas > 1) {
      this.cantidadPersonas--;
    }
  }

  abrirConfirmacion(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.vacanteSeleccionada || this.cupoMaximo <= 0) {
      this.toastService.error('Selecciona una fecha con cupos disponibles.');
      return;
    }

    this.mostrarConfirmacion = true;
  }

  cancelarConfirmacion(): void {
    this.mostrarConfirmacion = false;
  }

  confirmarReserva(): void {
    const clienteId = Number(localStorage.getItem('clienteId') || localStorage.getItem('idCliente'));
    const vacante = this.vacanteSeleccionada;

    if (!clienteId) {
      this.toastService.error('No se pudo identificar al cliente. Volve a iniciar sesion.');
      return;
    }

    if (!vacante?.id || !this.paquete) {
      this.toastService.error('No se pudo completar la reserva.');
      return;
    }

    const reserva: ReservaRequest = {
      fechaDeReservacion: vacante.fechaDeSalida,
      cantidadDePersonas: this.cantidadPersonas,
      clienteId,
      vacanteId: vacante.id,
    };

    this.reservaService.createReserva(reserva).subscribe({
      next: (response) => {
        const reservaCreada = this.obtenerReservaCreada(response as ReservaCreateResponse);
        const state: DetalleReservaState = {
          reserva: reservaCreada,
          paquete: this.paquete as PaqueteTuristico,
          fechaDeSalida: vacante.fechaDeSalida,
          cantidadDePersonas: this.cantidadPersonas,
          total: this.total,
        };

        this.mostrarConfirmacion = false;
        this.router.navigate(['/reserva-exitosa'], { state });
      },
      error: (error) => {
        console.error(error);
        this.toastService.error(
          error.error?.error ?? error.error?.mensaje ?? 'No se pudo registrar la reserva.',
        );
      },
    });
  }

  abrirVisor(index = 0): void {
    if (this.imagenes.length === 0) {
      return;
    }

    this.imagenActivaIndex = index;
    this.visorAbierto = true;
  }

  cerrarVisor(): void {
    this.visorAbierto = false;
  }

  @HostListener('document:keydown.escape')
  cerrarVisorConEscape(): void {
    this.cerrarVisor();
    this.fechasDropdownAbierto = false;
  }

  @HostListener('document:click')
  cerrarFechasDropdown(): void {
    this.fechasDropdownAbierto = false;
  }

  imagenAnterior(): void {
    this.imagenActivaIndex =
      this.imagenActivaIndex === 0 ? this.imagenes.length - 1 : this.imagenActivaIndex - 1;
  }

  imagenSiguiente(): void {
    this.imagenActivaIndex =
      this.imagenActivaIndex === this.imagenes.length - 1 ? 0 : this.imagenActivaIndex + 1;
  }

  imagenGaleriaAnterior(): void {
    this.imagenGaleriaIndex =
      this.imagenGaleriaIndex === 0 ? this.imagenes.length - 1 : this.imagenGaleriaIndex - 1;
  }

  imagenGaleriaSiguiente(): void {
    this.imagenGaleriaIndex =
      this.imagenGaleriaIndex === this.imagenes.length - 1 ? 0 : this.imagenGaleriaIndex + 1;
  }

  obtenerUrlImagen(imagen: string): string {
    if (/^(https?:|data:)/.test(imagen)) {
      return imagen;
    }

    return `${this.apiBaseUrl}${imagen.startsWith('/') ? '' : '/'}${imagen}`;
  }

  private ajustarCantidadAlCupo(): void {
    if (this.cupoMaximo <= 0) {
      this.cantidadPersonas = 1;
      return;
    }

    this.cantidadPersonas = Math.min(Math.max(this.cantidadPersonas, 1), this.cupoMaximo);
  }

  private obtenerReservaCreada(response: ReservaCreateResponse): Reserva | undefined {
    if ('data' in response) {
      return response.data;
    }

    return response;
  }

  private tieneItems(items: string[] | null | undefined): boolean {
    return (items ?? []).length > 0;
  }
}
