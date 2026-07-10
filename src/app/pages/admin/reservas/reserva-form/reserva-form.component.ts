import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { PaqueteService } from '../../../../core/services/paquete.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { ToastService } from '../../../../core/services/toast.service';
import { VacanteService } from '../../../../core/services/vacante.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Cliente } from '../../../../models/cliente.interface';
import { PaqueteTuristico } from '../../../../models/paquete.interface';
import { ReservaRequest } from '../../../../models/reserva.interface';
import { Vacante } from '../../../../models/vacante.interface';
import { AdminPageHeaderComponent } from '../../../../shared/components/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-reserva-form',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    AdminPageHeaderComponent,
  ],
  templateUrl: './reserva-form.component.html',
  styleUrl: './reserva-form.component.css',
})
export class ReservaFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    busquedaPaquete: [''],
    paqueteId: [0, Validators.min(1)],
    vacanteId: [0, Validators.min(1)],
    dni: ['', Validators.required],
    cantidadDePersonas: [1, [Validators.required, Validators.min(1)]],
  });

  paquetes: PaqueteTuristico[] = [];
  vacantes: Vacante[] = [];
  clientes: Cliente[] = [];
  paqueteSeleccionado: PaqueteTuristico | null = null;
  vacanteSeleccionada: Vacante | null = null;
  clienteSeleccionado: Cliente | null = null;
  clienteBuscado = false;
  cargando = true;
  buscandoCliente = false;
  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private clienteService: ClienteService,
    private paqueteService: PaqueteService,
    private reservaService: ReservaService,
    private toastService: ToastService,
    private vacanteService: VacanteService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    const dni = this.route.snapshot.queryParamMap.get('dni');
    const paqueteId = Number(this.route.snapshot.queryParamMap.get('paqueteId'));
    const vacanteId = Number(this.route.snapshot.queryParamMap.get('vacanteId'));
    const cantidad = Number(this.route.snapshot.queryParamMap.get('cantidad')) || 1;
    if (dni) this.form.controls.dni.setValue(dni);

    forkJoin({
      paquetes: this.paqueteService.getPaquetes(),
      vacantes: this.vacanteService.getVacantes(),
      clientes: this.clienteService.getClientes(),
    })
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: ({ paquetes, vacantes, clientes }) => {
          this.paquetes = paquetes.data;
          this.vacantes = vacantes.data;
          this.clientes = clientes.data;
          this.restaurarSeleccion(paqueteId, vacanteId, cantidad);
          if (dni) this.buscarCliente();
        },
        error: () => this.toastService.error('No se pudieron cargar los datos para registrar la reserva.'),
      });
  }

  get paquetesFiltrados(): PaqueteTuristico[] {
    const texto = this.form.controls.busquedaPaquete.value.toLowerCase().trim();
    if (!texto) return this.paquetes;
    return this.paquetes.filter((paquete) =>
      paquete.nombre.toLowerCase().includes(texto) ||
      paquete.ubicacion.toLowerCase().includes(texto),
    );
  }

  get vacantesDisponibles(): Vacante[] {
    if (!this.paqueteSeleccionado?.id) return [];
    return this.vacantes.filter(
      (vacante) =>
        vacante.paqueteTuristicoId === this.paqueteSeleccionado?.id &&
        vacante.estado !== 'no_disponible' &&
        !vacante.eliminado &&
        this.permiteRegistrar(vacante),
    );
  }

  get cantidad(): number {
    return this.form.controls.cantidadDePersonas.value;
  }

  get precioUnitario(): number {
    return Number(this.paqueteSeleccionado?.precioBase ?? 0);
  }

  get precioTotal(): number {
    return this.precioUnitario * this.cantidad;
  }

  get puedeRegistrar(): boolean {
    return Boolean(
      !this.guardando &&
      this.paqueteSeleccionado &&
      this.vacanteSeleccionada?.id &&
      this.vacanteSeleccionada.cupoDisponible >= this.cantidad &&
      this.clienteSeleccionado?.id &&
      this.form.valid,
    );
  }

  seleccionarPaquete(paquete: PaqueteTuristico): void {
    this.paqueteSeleccionado = paquete;
    this.vacanteSeleccionada = null;
    this.form.patchValue({ paqueteId: paquete.id ?? 0, vacanteId: 0, cantidadDePersonas: 1 });
  }

  seleccionarVacante(vacante: Vacante): void {
    if (!vacante.id || vacante.cupoDisponible <= 0) return;
    this.vacanteSeleccionada = vacante;
    this.form.patchValue({ vacanteId: vacante.id, cantidadDePersonas: 1 });
  }

  buscarCliente(): void {
    const dni = this.form.controls.dni.value.trim();
    this.clienteBuscado = true;
    this.clienteSeleccionado = null;
    if (!dni) {
      this.form.controls.dni.markAsTouched();
      return;
    }

    this.buscandoCliente = true;
    this.clienteSeleccionado = this.clientes.find((cliente) => cliente.dni === dni) ?? null;
    this.buscandoCliente = false;

    if (
      this.clienteSeleccionado?.usuarioId &&
      this.authService.getRol() === 'Gerente'
    ) {
      this.usuarioService.getUsuarioById(this.clienteSeleccionado.usuarioId).subscribe({
        next: ({ data }) => {
          if (this.clienteSeleccionado) {
            this.clienteSeleccionado = {
              ...this.clienteSeleccionado,
              usuario: { correoElectronico: data.correoElectronico },
            };
          }
        },
      });
    }
  }

  cambiarDni(): void {
    this.clienteBuscado = false;
    this.clienteSeleccionado = null;
  }

  aumentarCantidad(): void {
    const maximo = this.vacanteSeleccionada?.cupoDisponible ?? 0;
    if (this.cantidad < maximo) this.form.controls.cantidadDePersonas.setValue(this.cantidad + 1);
  }

  disminuirCantidad(): void {
    if (this.cantidad > 1) this.form.controls.cantidadDePersonas.setValue(this.cantidad - 1);
  }

  registrarReserva(): void {
    if (!this.puedeRegistrar || !this.clienteSeleccionado?.id || !this.vacanteSeleccionada?.id) {
      this.form.markAllAsTouched();
      this.toastService.error('Completa todos los pasos antes de registrar la reserva.');
      return;
    }

    const empleadoId = this.authService.getEmpleadoId();
    if (!empleadoId) {
      this.toastService.error('No se pudo identificar al empleado. Volvé a iniciar sesión.');
      return;
    }

    const payload: ReservaRequest = {
      fechaDeReservacion: this.obtenerFechaDeReservacion(),
      clienteId: this.clienteSeleccionado.id,
      vacanteId: this.vacanteSeleccionada.id,
      cantidadDePersonas: this.cantidad,
      empleadoId,
    };

    this.guardando = true;
    this.reservaService.createReserva(payload)
      .pipe(finalize(() => (this.guardando = false)))
      .subscribe({
        next: ({ data: reserva }) => this.router.navigate(['/reserva-exitosa'], {
          state: {
            reserva,
            paquete: this.paqueteSeleccionado,
            fechaDeSalida: this.vacanteSeleccionada?.fechaDeSalida,
            cantidadDePersonas: this.cantidad,
            total: this.precioTotal,
            origenAdmin: true,
          },
        }),
        error: (error) => this.toastService.error(
          error.error?.error ?? error.error?.mensaje ?? 'No se pudo registrar la reserva.',
        ),
      });
  }

  private restaurarSeleccion(paqueteId: number, vacanteId: number, cantidad: number): void {
    if (!paqueteId) return;

    const paquete = this.paquetes.find((item) => item.id === paqueteId);
    if (!paquete) return;

    this.seleccionarPaquete(paquete);
    const vacante = this.vacantes.find(
      (item) => item.id === vacanteId && item.paqueteTuristicoId === paqueteId,
    );
    if (!vacante || !this.permiteRegistrar(vacante)) return;

    this.seleccionarVacante(vacante);
    this.form.controls.cantidadDePersonas.setValue(
      Math.min(Math.max(cantidad, 1), vacante.cupoDisponible),
    );
  }

  private permiteRegistrar(vacante: Vacante): boolean {
    return vacante.cupoDisponible > 0 && vacante.fechaDeSalida > this.obtenerFechaDeReservacion();
  }

  private obtenerFechaDeReservacion(): string {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const anio = manana.getFullYear();
    const mes = String(manana.getMonth() + 1).padStart(2, '0');
    const dia = String(manana.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
