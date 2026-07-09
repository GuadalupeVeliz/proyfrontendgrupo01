import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';
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
  ) {}

  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    // El credential va a AuthService, que llama al backend y guarda la sesión.
    // El catchError DENTRO del switchMap deja el botón vivo tras un error.
    this.googleAuthService
      .obtenerCredential(this.googleBtn.nativeElement)
      .pipe(
        switchMap((credential) =>
          this.authService.loginConGoogle(credential).pipe(
            catchError((error) => {
              console.error(error);
              this.mostrarError(
                error.error?.error || 'No existe cuenta con este correo.',
              );
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe(() => this.router.navigate(['/home']));
  }

  onSubmit(): void {
    this.textoError = '';
    this.mostrarTextoError = false;

    this.authService.onLogin(this.loginModel).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (error: any) => {
        console.error(error);
        // El backend ahora avisa si la cuenta es solo-Google
        this.mostrarError(
          error.error?.error || 'Correo o contraseña incorrectos.',
        );
      },
    });
  }

  private mostrarError(mensaje: string): void {
    this.textoError = mensaje;
    this.mostrarTextoError = true;
    setTimeout(() => {
      this.mostrarTextoError = false;
    }, 5000);
  }
}