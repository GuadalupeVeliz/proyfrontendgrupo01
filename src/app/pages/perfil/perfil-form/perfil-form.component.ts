import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ToastService } from '../../../core/services/toast.service';
import { PerfilUpdatePayload, PerfilUsuario } from '../../../models/perfil.interface';
import { AdminPageHeaderComponent } from '../../../shared/components/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-perfil-form',
  imports: [ReactiveFormsModule, RouterLink, AdminPageHeaderComponent],
  templateUrl: './perfil-form.component.html',
  styleUrl: './perfil-form.component.css',
})
export class PerfilFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  perfil: PerfilUsuario | null = null;
  cargando = true;
  guardando = false;
  mensajeError = '';

  form = this.fb.group({
    correoElectronico: ['', [Validators.required, Validators.email]],
    nombreCompleto: [''],
    telefono: [''],
    sede: [''],
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private perfilService: PerfilService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;

    this.perfilService.getPerfil().subscribe({
      next: (respuesta) => {
        this.perfil = respuesta.data;
        this.configurarFormulario(respuesta.data);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar perfil', error);
        this.cargando = false;
        this.mensajeError = this.obtenerMensajeError(error, 'No se pudo cargar el perfil.');
        this.toastService.error('No se pudo cargar el perfil.');
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

    this.guardando = true;

    this.perfilService
      .updatePerfil(this.obtenerPayload())
      .pipe(
        timeout(10000),
        finalize(() => {
          this.guardando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          this.authService.actualizarCorreo(respuesta.data.correoElectronico);
          this.toastService.success('Perfil actualizado correctamente');
          this.router.navigate(['/perfil']);
        },
        error: (error) => {
          console.error('Error al actualizar perfil', error);
          this.mensajeError = this.obtenerMensajeError(error, 'No se pudo actualizar el perfil.');
          this.toastService.error(this.mensajeError);
        },
      });
  }

  campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  get esCliente(): boolean {
    return !!this.perfil?.cliente;
  }

  get esEmpleado(): boolean {
    return !!this.perfil?.empleado;
  }

  get cargo(): string {
    return this.perfil?.empleado?.esGerente ? 'Gerente' : 'Recepcionista';
  }

  private configurarFormulario(perfil: PerfilUsuario): void {
    this.form.patchValue({
      correoElectronico: perfil.correoElectronico,
      nombreCompleto: perfil.cliente?.nombreCompleto ?? '',
      telefono: perfil.cliente?.telefono ?? '',
      sede: perfil.empleado?.sede ?? '',
    });

    if (perfil.cliente) {
      this.form.controls.nombreCompleto.addValidators(Validators.required);
      this.form.controls.telefono.addValidators(Validators.required);
    }

    if (perfil.empleado) {
      this.form.controls.sede.addValidators(Validators.required);
    }

    this.form.controls.nombreCompleto.updateValueAndValidity();
    this.form.controls.telefono.updateValueAndValidity();
    this.form.controls.sede.updateValueAndValidity();
  }

  private obtenerPayload(): PerfilUpdatePayload {
    const valor = this.form.getRawValue();
    const payload: PerfilUpdatePayload = {
      correoElectronico: valor.correoElectronico!.trim(),
    };

    if (this.esCliente) {
      payload.nombreCompleto = valor.nombreCompleto!.trim();
      payload.telefono = valor.telefono!.trim();
    }

    if (this.esEmpleado) {
      payload.sede = valor.sede!.trim();
    }

    return payload;
  }

  private obtenerMensajeError(error: unknown, mensajePorDefecto: string): string {
    const httpError = error as {
      status?: number;
      name?: string;
      error?: { message?: string; error?: string; mensaje?: string };
    };

    const mensajeBackend =
      httpError.error?.message ?? httpError.error?.error ?? httpError.error?.mensaje;

    if (mensajeBackend) {
      return mensajeBackend;
    }

    if (httpError.status === 401) {
      return 'Tu sesion expiro. Volve a iniciar sesion.';
    }

    if (httpError.status === 403) {
      return 'No tenes permisos para editar este perfil.';
    }

    if (httpError.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que la API este corriendo.';
    }

    if (httpError.name === 'TimeoutError') {
      return 'El servidor no respondio a tiempo.';
    }

    return mensajePorDefecto;
  }
}
