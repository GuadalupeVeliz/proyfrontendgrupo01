import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignupRequest } from '../../../models/auth.interface';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, TitleCasePipe, CommonModule],
  templateUrl: './admin-signup.component.html',
  styleUrl: './admin-signup.component.css',
})
export class AdminSignupComponent {
  sedes = ['sucursal', 'central'];
  tiposDeUsuario = ['empleado', 'cliente'];
  tipoDeUsuarioSeleccionado = 'cliente';
  cargando: boolean = false;
  cartelUsuarioRegistrado: boolean = false;
  cartelErrorAlRegistrar: boolean = false;
  mensajeError: string = '';

  signupModel: SignupRequest = {
    correoElectronico: '',
    clave: '',
  };

  submitted = false;

  // FIX: antes usaba AuthService.onSignup → POST /auth/signup (público),
  // que ya no permite crear empleados. Ahora usa POST /usuarios (protegido,
  // solo Gerente). Además NO toca la sesión: el Gerente está creando a OTRO
  // usuario, no logueándose como él (antes le pisaba el correo de sesión).
  constructor(
    private usuarioService: UsuarioService
  ) { }

  onSubmit(): void {
    this.cargando = true;
    this.cartelErrorAlRegistrar = false;
    this.mensajeError = '';

    this.usuarioService.crearUsuario(this.signupModel).subscribe({
      next: () => {
        this.cargando = false;
        this.cartelUsuarioRegistrado = true;
        this.limpiarCampos();
        setTimeout(() => {
          this.cartelUsuarioRegistrado = false;
        }, 10000);
      },
      error: (error: any) => {
        console.error(error.error);
        this.cargando = false;
        this.cartelErrorAlRegistrar = true;
        this.mensajeError =
          error.error?.error || 'Ocurrió un error al registrar el usuario';
      },
    });
  }

  limpiarCampos(): void {
    this.signupModel.correoElectronico = '';
    this.signupModel.clave = '';
    this.signupModel.dni = '';
    this.signupModel.nombreCompleto = '';
    this.signupModel.telefono = '';
    this.signupModel.legajo = '';
    this.signupModel.sede = 'sucursal';
  }
}