import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SignupRequest } from '../../../models/auth.interface';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, TitleCasePipe, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  sedes = ['sucursal', 'central'];
  tiposDeUsuario = ['empleado', 'cliente'];
  tipoDeUsuarioSeleccionado = '';

  signupModel: SignupRequest = {
    correoElectronico: '',
    clave: '',
  };

  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    this.authService.onSignup(this.signupModel).subscribe({
      next: () => {
        console.log('Usuario registrado:\n', this.signupModel);
        setTimeout(() => {
          (this.router.navigate(['/login']), 1000);
        });
      },
      error: (error) => {
        console.error('Error al registrar usuario:\n', error);
      },
    });
  }
}
