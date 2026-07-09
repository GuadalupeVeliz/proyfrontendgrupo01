import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { LoginRequest } from '../../../models/auth.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  loginModel: LoginRequest = {
    correoElectronico: '',
    clave: '',
  };

  textoError: string = '';
  mostrarTextoError: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }


  onSubmit(): void {
    this.textoError = '';
    this.mostrarTextoError = false;
    this.authService.onLogin(this.loginModel).subscribe({
      next: () => this.router.navigate(['/admin/']),
      error: (error: any) => {
        console.error(error);
        this.textoError = error.error?.error || 'error al iniciar sesion';
        this.mostrarTextoError = true;
        setTimeout(() => {
          this.mostrarTextoError = false;
        }, 5000)
      },
    });
  }
}
