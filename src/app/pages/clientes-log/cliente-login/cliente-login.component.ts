import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../models/auth.interface';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-cliente-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './cliente-login.component.html',
  styleUrl: './cliente-login.component.css',
})
export class ClienteLoginComponent implements AfterViewInit {
  loginModel: LoginRequest = {
    correoElectronico: '',
    clave: '',
  };

  textoError: string = '';
  mostrarTextoError: boolean = false;

  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
  ) { }

  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    this.mostrarTextoError = false;
    this.googleAuthService.iniciarBotonGoogleSignin(this.googleBtn.nativeElement).subscribe({
      next: () => {
        console.log('inicio de sesion con google con exito');
        this.router.navigate(['/home'])
      },
      error: (error: any) => {
        console.error(error);
        this.textoError = 'No existe cuenta con este correo.';
        this.mostrarTextoError = true;
        setTimeout(() => {
          this.mostrarTextoError = false;
        }, 5000)
      }
    });
  }

  onSubmit(): void {
    this.textoError = '';
    this.mostrarTextoError = false;
    this.authService.onLogin(this.loginModel).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (error: any) => {
        console.error(error);
        this.textoError = 'Correo o contraseña incorrectos.';
        this.mostrarTextoError = true;
        setTimeout(() => {
          this.mostrarTextoError = false;
        }, 5000)
      },
    });
  }
}