import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PaquetePayload, PaqueteService } from '../../../../core/services/paquete.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminPageHeaderComponent } from '../../../../shared/components/admin-page-header/admin-page-header.component';

type PaqueteFormValue = {
  nombre: string | null;
  ubicacion: string | null;
  descripcion: string | null;
  precioBase: number | null;
  duracionEnDias: number | null;
  imagenes: string | null;
  incluye: string | null;
  noIncluye: string | null;
  hotel: string | null;
  puntoDeSalida: string | null;
  recomendaciones: string | null;
  dificultad: 'baja' | 'media' | 'alta' | null;
};

type HttpLikeError = {
  status?: number;
  name?: string;
  error?: {
    message?: string | string[];
    error?: string | string[];
  };
};

@Component({
  selector: 'app-paquete-form',
  imports: [ReactiveFormsModule, RouterLink, AdminPageHeaderComponent],
  templateUrl: './paquete-form.component.html',
  styleUrl: './paquete-form.component.css',
})
export class PaqueteFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  paqueteId: number | null = null;
  modoEditar = false;
  guardando = false;
  mensajeError = '';

  form = this.fb.group({
    nombre: ['', Validators.required],
    ubicacion: ['', Validators.required],
    descripcion: ['', Validators.required],
    precioBase: [0, [Validators.required, Validators.min(1)]],
    duracionEnDias: [3, [Validators.required, this.duracionPermitida]],
    imagenes: ['', Validators.required],
    incluye: [''],
    noIncluye: [''],
    hotel: [''],
    puntoDeSalida: ['', Validators.required],
    recomendaciones: [''],
    dificultad: ['baja' as 'baja' | 'media' | 'alta', Validators.required],
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private paqueteService: PaqueteService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modoEditar = true;
      this.paqueteId = Number(id);
      this.cargarPaquete(this.paqueteId);
    }
  }

  cargarPaquete(id: number): void {
    this.paqueteService.getPaqueteById(id).subscribe({
      next: (respuesta) => {
        const paquete = respuesta.data;

        this.form.patchValue({
          ...paquete,
          imagenes: this.unirLista(paquete.imagenes),
          incluye: this.unirLista(paquete.incluye),
          noIncluye: this.unirLista(paquete.noIncluye),
          recomendaciones: this.unirLista(paquete.recomendaciones),
        });
      },
      error: (error) => {
        console.error('Error al cargar paquete', error);
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
      this.mensajeError = 'Tenes que iniciar sesion como Gerente para guardar paquetes.';
      return;
    }

    if (this.authService.getRol() !== 'Gerente') {
      this.mensajeError = 'Solo un usuario Gerente puede guardar paquetes.';
      return;
    }

    this.guardando = true;
    const paquete = this.obtenerPaqueteDelForm();
    const request$ = this.modoEditar && this.paqueteId
      ? this.paqueteService.updatePaquete(this.paqueteId, paquete)
      : this.paqueteService.createPaquete(paquete);

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
          ? 'Paquete editado correctamente'
          : 'Paquete creado correctamente';

        this.toastService.success(mensaje);
        this.router.navigate(['/admin/paquetes']);
      },
      error: (error) => {
        console.error('Error al guardar paquete', error);
        this.mensajeError = this.obtenerMensajeError(error);
        this.toastService.error(this.mensajeError);
      },
    });
  }

  campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  private obtenerPaqueteDelForm(): PaquetePayload {
    const valor: PaqueteFormValue = this.form.getRawValue();

    return {
      nombre: valor.nombre!.trim(),
      ubicacion: valor.ubicacion!.trim(),
      descripcion: valor.descripcion!.trim(),
      precioBase: Number(valor.precioBase),
      duracionEnDias: Number(valor.duracionEnDias),
      imagenes: this.obtenerLista(valor.imagenes),
      incluye: this.obtenerLista(valor.incluye),
      noIncluye: this.obtenerLista(valor.noIncluye),
      hotel: valor.hotel?.trim() || null,
      puntoDeSalida: valor.puntoDeSalida!.trim(),
      recomendaciones: this.obtenerLista(valor.recomendaciones),
      dificultad: valor.dificultad ?? 'baja',
    };
  }

  private obtenerLista(valor: string | null): string[] {
    return (valor ?? '')
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private unirLista(valor: string[] | null | undefined): string {
    return (valor ?? []).join('\n');
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
      return 'No tenes permisos para guardar paquetes. Inicia sesion con un usuario Gerente.';
    }

    if (httpError.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que la API este corriendo.';
    }

    if (httpError.name === 'TimeoutError') {
      return 'El servidor no respondio a tiempo. Revisa que la API este corriendo y que el endpoint responda.';
    }

    if (httpError.status) {
      return `No se pudo guardar el paquete. Error HTTP ${httpError.status}.`;
    }

    return 'No se pudo guardar el paquete. Intenta nuevamente.';
  }

  private duracionPermitida(control: AbstractControl): ValidationErrors | null {
    const duracion = Number(control.value);
    return duracion === 3 || duracion === 7 ? null : { duracionNoPermitida: true };
  }
}