import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ClientePayload, ClienteService } from '../../../../core/services/cliente.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminPageHeaderComponent } from '../../../../shared/components/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-cliente-form',
  imports: [ReactiveFormsModule, RouterLink, AdminPageHeaderComponent],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css',
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  clienteId: number | null = null;
  modoEditar = false;
  guardando = false;
  mensajeError = '';
  returnUrl: string | null = null;

  form = this.fb.group({
    nombreCompleto: ['', Validators.required],
    dni: ['', Validators.required],
    telefono: ['', Validators.required],
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private clienteService: ClienteService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const dni = this.route.snapshot.queryParamMap.get('dni');
    if (dni) this.form.controls.dni.setValue(dni);

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.modoEditar = true;
      this.clienteId = Number(id);
      this.cargarCliente(this.clienteId);
    }
  }

  cargarCliente(id: number): void {
    this.clienteService.getClienteById(id).subscribe({
      next: (respuesta) => {
        this.form.patchValue(respuesta.data);
      },
      error: (error) => {
        console.error('Error al cargar cliente', error);
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
      this.mensajeError = 'Tenes que iniciar sesion para guardar clientes.';
      return;
    }

    if (!['Gerente', 'Recepcionista'].includes(this.authService.getRol() ?? '')) {
      this.mensajeError = 'No tenes permisos para guardar clientes.';
      return;
    }

    this.guardando = true;
    const cliente = this.obtenerClienteDelForm();
    const request$ = this.modoEditar && this.clienteId
      ? this.clienteService.updateCliente(this.clienteId, cliente)
      : this.clienteService.createCliente(cliente);

    request$
      .pipe(
        timeout(10000),
        finalize(() => {
          this.guardando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const mensaje = this.modoEditar
            ? 'Cliente editado correctamente'
            : 'Cliente creado correctamente';

          this.toastService.success(mensaje);
          if (!this.modoEditar && this.returnUrl) {
            this.router.navigate([this.returnUrl], {
              queryParams: {
                dni: respuesta.data.dni,
                paqueteId: this.route.snapshot.queryParamMap.get('paqueteId'),
                vacanteId: this.route.snapshot.queryParamMap.get('vacanteId'),
                cantidad: this.route.snapshot.queryParamMap.get('cantidad'),
              },
            });
            return;
          }

          this.router.navigate(['/admin/clientes']);
        },
        error: (error) => {
          console.error('Error al guardar cliente', error);
          this.mensajeError = this.obtenerMensajeError(error);
          this.toastService.error(this.mensajeError);
        },
      });
  }

  campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  private obtenerClienteDelForm(): ClientePayload {
    const valor = this.form.getRawValue();

    return {
      nombreCompleto: valor.nombreCompleto!.trim(),
      dni: valor.dni!.trim(),
      telefono: valor.telefono!.trim(),
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
      return 'Tu sesion expiro. Volve a iniciar sesion.';
    }

    if (httpError.status === 403) {
      return 'No tenes permisos para guardar clientes.';
    }

    if (httpError.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que la API este corriendo.';
    }

    if (httpError.name === 'TimeoutError') {
      return 'El servidor no respondio a tiempo.';
    }

    return 'No se pudo guardar el cliente. Intenta nuevamente.';
  }
}
