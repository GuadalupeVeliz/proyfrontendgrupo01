import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
export class PaqueteFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  paqueteId: number | null = null;
  modoEditar = false;
  guardando = false;
  mensajeError = '';
  errorImagenes = '';
  imagenesSeleccionadas: File[] = [];
  previsualizaciones: string[] = [];
  imagenesActuales: string[] = [];

  form = this.fb.group({
    nombre: ['', Validators.required], ubicacion: ['', Validators.required], descripcion: ['', Validators.required],
    precioBase: [0, [Validators.required, Validators.min(1)]],
    duracionEnDias: [3, [Validators.required, this.duracionPermitida]],
    incluye: [''], noIncluye: [''], hotel: [''], puntoDeSalida: ['', Validators.required],
    recomendaciones: [''], dificultad: ['baja' as 'baja' | 'media' | 'alta', Validators.required],
  });

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService,
    private paqueteService: PaqueteService, private toastService: ToastService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.modoEditar = true; this.paqueteId = Number(id); this.cargarPaquete(this.paqueteId); }
  }

  ngOnDestroy(): void { this.limpiarPrevisualizaciones(); }

  cargarPaquete(id: number): void {
    this.paqueteService.getPaqueteById(id).subscribe({
      next: ({ data: paquete }) => {
        this.form.patchValue({ ...paquete, incluye: this.unirLista(paquete.incluye), noIncluye: this.unirLista(paquete.noIncluye), recomendaciones: this.unirLista(paquete.recomendaciones) });
        this.imagenesActuales = paquete.imagenes ?? [];
      },
      error: (error) => { this.mensajeError = this.obtenerMensajeError(error); },
    });
  }

  seleccionarImagenes(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);
    this.errorImagenes = '';
    if (archivos.length > 5) this.errorImagenes = 'Puedes seleccionar como máximo 5 imágenes.';
    else if (archivos.some((a) => !['image/jpeg', 'image/png', 'image/webp'].includes(a.type))) this.errorImagenes = 'Solo se permiten imágenes JPEG, PNG o WebP.';
    else if (archivos.some((a) => a.size > 5 * 1024 * 1024)) this.errorImagenes = 'Cada imagen puede pesar como máximo 5 MB.';
    if (this.errorImagenes) { input.value = ''; return; }
    this.limpiarPrevisualizaciones();
    this.imagenesSeleccionadas = archivos;
    this.previsualizaciones = archivos.map((archivo) => URL.createObjectURL(archivo));
  }

  guardar(): void {
    this.mensajeError = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); this.mensajeError = 'Revisa los campos marcados antes de guardar.'; return; }
    if (!this.modoEditar && !this.imagenesSeleccionadas.length) { this.errorImagenes = 'Debes seleccionar al menos una imagen.'; return; }
    if (!this.authService.getToken()) { this.mensajeError = 'Tenes que iniciar sesion como Gerente para guardar paquetes.'; return; }
    if (this.authService.getRol() !== 'Gerente') { this.mensajeError = 'Solo un usuario Gerente puede guardar paquetes.'; return; }
    this.guardando = true;
    const paquete = this.obtenerPaqueteDelForm();
    const request$ = this.modoEditar && this.paqueteId
      ? this.paqueteService.updatePaquete(this.paqueteId, paquete, this.imagenesSeleccionadas)
      : this.paqueteService.createPaquete(paquete, this.imagenesSeleccionadas);
    request$.pipe(timeout(30000), finalize(() => this.guardando = false)).subscribe({
      next: () => { this.toastService.success(this.modoEditar ? 'Paquete editado correctamente' : 'Paquete creado correctamente'); this.router.navigate(['/admin/paquetes']); },
      error: (error) => { this.mensajeError = this.obtenerMensajeError(error); this.toastService.error(this.mensajeError); },
    });
  }

  campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo]; return control.invalid && (control.touched || control.dirty);
  }

  private obtenerPaqueteDelForm(): PaquetePayload {
    const valor = this.form.getRawValue();
    return { nombre: valor.nombre!.trim(), ubicacion: valor.ubicacion!.trim(), descripcion: valor.descripcion!.trim(),
      precioBase: Number(valor.precioBase), duracionEnDias: Number(valor.duracionEnDias), incluye: this.obtenerLista(valor.incluye),
      noIncluye: this.obtenerLista(valor.noIncluye), hotel: valor.hotel?.trim() || null, puntoDeSalida: valor.puntoDeSalida!.trim(),
      recomendaciones: this.obtenerLista(valor.recomendaciones), dificultad: valor.dificultad ?? 'baja' };
  }

  private obtenerLista(valor: string | null): string[] { return (valor ?? '').split(/\r?\n/).map((i) => i.trim()).filter(Boolean); }
  private unirLista(valor: string[] | null | undefined): string { return (valor ?? []).join('\n'); }
  private limpiarPrevisualizaciones(): void { this.previsualizaciones.forEach((url) => URL.revokeObjectURL(url)); this.previsualizaciones = []; this.imagenesSeleccionadas = []; }
  private duracionPermitida(control: AbstractControl): ValidationErrors | null { const d = Number(control.value); return d === 3 || d === 7 ? null : { duracionNoPermitida: true }; }

  private obtenerMensajeError(error: unknown): string {
    const httpError = error as HttpLikeError; const mensaje = httpError.error?.message ?? httpError.error?.error;
    if (Array.isArray(mensaje)) return mensaje.join(' '); if (mensaje) return mensaje;
    if (httpError.status === 401) return 'Tu sesion expiro. Volve a iniciar sesion como Gerente.';
    if (httpError.status === 403) return 'No tenes permisos para guardar paquetes. Inicia sesion con un usuario Gerente.';
    if (httpError.status === 0) return 'No se pudo conectar con el servidor. Verifica que la API este corriendo.';
    if (httpError.name === 'TimeoutError') return 'El servidor no respondio a tiempo.';
    return httpError.status ? `No se pudo guardar el paquete. Error HTTP ${httpError.status}.` : 'No se pudo guardar el paquete. Intenta nuevamente.';
  }
}