import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { EmpleadoPayload, EmpleadoService } from '../../../../core/services/empleado.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminPageHeaderComponent } from '../../../../shared/components/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-empleado-form',
  imports: [ReactiveFormsModule, RouterLink, AdminPageHeaderComponent],
  templateUrl: './empleado-form.component.html',
  styleUrl: './empleado-form.component.css',
})
export class EmpleadoFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  empleadoId: number | null = null;
  modoEditar = false;
  guardando = false;
  mensajeError = '';

  form = this.fb.group({
    legajo: ['', Validators.required],
    sede: ['central', Validators.required],
    esGerente: [false, Validators.required],
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private empleadoService: EmpleadoService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modoEditar = true;
      this.empleadoId = Number(id);
      this.cargarEmpleado(this.empleadoId);
    }
  }

  cargarEmpleado(id: number): void {
    this.empleadoService.getEmpleadoById(id).subscribe({
      next: (respuesta) => {
        this.form.patchValue(respuesta.data);
      },
      error: (error) => {
        console.error('Error al cargar empleado', error);
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
      this.mensajeError = 'Tenes que iniciar sesion como Gerente para guardar empleados.';
      return;
    }

    if (this.authService.getRol() !== 'Gerente') {
      this.mensajeError = 'Solo un usuario Gerente puede guardar empleados.';
      return;
    }

    this.guardando = true;
    const empleado = this.obtenerEmpleadoDelForm();
    const request$ = this.modoEditar && this.empleadoId
      ? this.empleadoService.updateEmpleado(this.empleadoId, empleado)
      : this.empleadoService.createEmpleado(empleado);

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
            ? 'Empleado actualizado correctamente'
            : 'Empleado creado correctamente';

          this.toastService.success(mensaje);
          this.router.navigate(['/admin/empleados']);
        },
        error: (error) => {
          console.error('Error al guardar empleado', error);
          this.mensajeError = this.obtenerMensajeError(error);
          this.toastService.error(this.mensajeError);
        },
      });
  }

  campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  private obtenerEmpleadoDelForm(): EmpleadoPayload {
    const valor = this.form.getRawValue();

    return {
      legajo: valor.legajo!.trim(),
      sede: valor.sede === 'sucursal' ? 'sucursal' : 'central',
      esGerente: Boolean(valor.esGerente),
    };
  }

  private obtenerMensajeError(error: unknown): string {
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
      return 'Tu sesion expiro. Volve a iniciar sesion como Gerente.';
    }

    if (httpError.status === 403) {
      return 'No tenes permisos para guardar empleados.';
    }

    if (httpError.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que la API este corriendo.';
    }

    if (httpError.name === 'TimeoutError') {
      return 'El servidor no respondio a tiempo.';
    }

    return 'No se pudo guardar el empleado. Intenta nuevamente.';
  }
}
