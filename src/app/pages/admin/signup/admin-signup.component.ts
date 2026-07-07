import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; 
import { SignupRequest } from '../../../models/auth.interface';

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

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  onSubmit(): void {
    this.cargando = true;
    this.cartelErrorAlRegistrar = false;
    this.mensajeError = '';
    console.log('signupmodel', this.signupModel);
    // registrar cliente/empleado desde vista gerente
    this.authService.onSignup(this.signupModel).subscribe({
      next: () => {
        this.cargando = false;
        this.cartelUsuarioRegistrado = true;
        localStorage.setItem('correo', this.signupModel.correoElectronico);
        this.authService.actualizarCorreo(this.signupModel.correoElectronico);
        this.limpiarCampos();
        setTimeout(() => {
          this.cartelUsuarioRegistrado = false;
        }, 10000);
      },
      error: (error: any) => {
        console.error(error.error);
        this.cargando = false;
        this.cartelErrorAlRegistrar = true;
        this.mensajeError = error.error.error;
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
