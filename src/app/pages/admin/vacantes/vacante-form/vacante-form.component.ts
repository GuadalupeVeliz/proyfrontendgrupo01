import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PaqueteService } from '../../../../core/services/paquete.service';
import { ToastService } from '../../../../core/services/toast.service';
import { VacantePayload, VacanteService } from '../../../../core/services/vacante.service';
import { PaqueteTuristico } from '../../../../models/paquete.interface';
import { AdminPageHeaderComponent } from '../../../../shared/components/admin-page-header/admin-page-header.component';

type HttpLikeError = {
  status?: number;
  name?: string;
  error?: {
    message?: string | string[];
    error?: string | string[];
  };
};

@Component({
  selector: 'app-vacante-form',
  imports: [ReactiveFormsModule, RouterLink, AdminPageHeaderComponent],
  templateUrl: './vacante-form.component.html',
  styleUrl: './vacante-form.component.css',
})
export class VacanteFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  vacanteId: number | null = null;
  modoEditar = false;
  guardando = false;
  mensajeError = '';
  paquetes: PaqueteTuristico[] = [];
  fechaMinima = this.obtenerFechaMinima();
  nombrePaqueteSeleccionado = '';

  form = this.fb.group({
    fechaDeSalida: ['', Validators.required],
    paqueteTuristicoId: [0, [Validators.required, Validators.min(1)]],
    cupoTotal: [1, [Validators.required, Validators.min(1)]],
    cupoDisponible: [1, [Validators.required, Validators.min(0)]],
    estado: ['disponible', Validators.required],
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private paqueteService: PaqueteService,
    private vacanteService: VacanteService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarPaquetes();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modoEditar = true;
      this.vacanteId = Number(id);
      this.cargarVacante(this.vacanteId);
    }
  }

  cargarPaquetes(): void {
    this.paqueteService.getPaquetes().subscribe({
      next: (respuesta) => {
        this.paquetes = respuesta.data;
        this.actualizarNombrePaqueteSeleccionado();
      },
      error: (error) => {
        console.error('Error al cargar paquetes', error);
        this.mensajeError = this.obtenerMensajeError(error);
      },
    });
  }

  cargarVacante(id: number): void {
    this.vacanteService.getVacanteById(id).subscribe({
      next: (respuesta) => {
        const vacante = respuesta.data;
        this.nombrePaqueteSeleccionado =
          vacante.paqueteTuristico?.nombre ?? this.obtenerNombrePaquetePorId(vacante.paqueteTuristicoId);

        this.form.patchValue({
          fechaDeSalida: this.formatearFechaParaInput(vacante.fechaDeSalida),
          paqueteTuristicoId: vacante.paqueteTuristicoId,
          cupoTotal: vacante.cupoTotal ?? vacante.cupoDisponible,
          cupoDisponible: vacante.cupoDisponible,
          estado: vacante.estado ?? 'disponible',
        });
      },
      error: (error) => {
        console.error('Error al cargar vacante', error);
        this.mensajeError = this.obtenerMensajeError(error);
      },
    });
  }

  guardar(): void {
    this.mensajeError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensajeError = 'Revisa los campos marcados antes de guardar.';
      return;
    }

    if (!this.authService.getToken()) {
      this.mensajeError = 'Tenes que iniciar sesion como Gerente para guardar vacantes.';
      return;
    }

    if (this.authService.getRol() !== 'Gerente') {
      this.mensajeError = 'Solo un usuario Gerente puede guardar vacantes.';
      return;
    }

    const vacante = this.obtenerVacanteDelForm();
    const vacanteEditar: Partial<VacantePayload> = {
      fechaDeSalida: vacante.fechaDeSalida,
      cupoTotal: vacante.cupoTotal,
      cupoDisponible: vacante.cupoDisponible,
      estado: vacante.estado,
    };

    if (vacante.cupoDisponible > (vacante.cupoTotal ?? vacante.cupoDisponible)) {
      this.mensajeError = 'Los cupos disponibles no pueden superar los cupos totales.';
      return;
    }

    this.guardando = true;
    const request$ = this.modoEditar && this.vacanteId
      ? this.vacanteService.updateVacante(this.vacanteId, vacanteEditar)
      : this.vacanteService.createVacante(vacante);

    request$
      .pipe(
        timeout(10000),
        finalize(() => {
          this.guardando = false;
        })
      )
      .subscribe({
        next: () => {
          const mensaje = this.modoEditar
            ? 'Vacante editada correctamente'
            : 'Vacante creada correctamente';

          this.toastService.success(mensaje);
          this.router.navigate(['/admin/vacantes']);
        },
        error: (error) => {
          console.error('Error al guardar vacante', error);
          this.mensajeError = this.obtenerMensajeError(error);
          this.toastService.error(this.mensajeError);
        },
      });
  }

  campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  private obtenerVacanteDelForm(): VacantePayload {
    const valor = this.form.getRawValue();

    return {
      fechaDeSalida: valor.fechaDeSalida!,
      paqueteTuristicoId: Number(valor.paqueteTuristicoId),
      cupoTotal: Number(valor.cupoTotal),
      cupoDisponible: Number(valor.cupoDisponible),
      estado: valor.estado === 'no_disponible' ? 'no_disponible' : 'disponible',
    };
  }

  private formatearFechaParaInput(fecha: string): string {
    return fecha.includes('T') ? fecha.split('T')[0] : fecha;
  }

  private obtenerFechaMinima(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 1);
    return fecha.toISOString().split('T')[0];
  }

  private actualizarNombrePaqueteSeleccionado(): void {
    if (!this.modoEditar || this.nombrePaqueteSeleccionado) return;

    const paqueteId = Number(this.form.controls.paqueteTuristicoId.value);
    this.nombrePaqueteSeleccionado = this.obtenerNombrePaquetePorId(paqueteId);
  }

  private obtenerNombrePaquetePorId(paqueteId: number): string {
    return this.paquetes.find((paquete) => paquete.id === paqueteId)?.nombre ?? 'Paquete seleccionado';
  }

  private obtenerMensajeError(error: unknown): string {
    const httpError = error as HttpLikeError;
    const mensajeBackend = httpError.error?.message ?? httpError.error?.error;

    if (Array.isArray(mensajeBackend)) {
      return mensajeBackend.join(' ');
    }

    if (mensajeBackend) {
      return mensajeBackend;
    }

    if (httpError.status === 401) {
      return 'Tu sesion expiro. Volve a iniciar sesion como Gerente.';
    }

    if (httpError.status === 403) {
      return 'No tenes permisos para guardar vacantes. Inicia sesion con un usuario Gerente.';
    }

    if (httpError.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que la API este corriendo.';
    }

    if (httpError.name === 'TimeoutError') {
      return 'El servidor no respondio a tiempo. Revisa que la API este corriendo y que el endpoint responda.';
    }

    if (httpError.status) {
      return `No se pudo guardar la vacante. Error HTTP ${httpError.status}.`;
    }

    return 'No se pudo guardar la vacante. Intenta nuevamente.';
  }
}
