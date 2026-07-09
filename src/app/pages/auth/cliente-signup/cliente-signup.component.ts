import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';
import { SignupRequest } from '../../../models/auth.interface';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, CommonModule],
  templateUrl: './cliente-signup.component.html',
  styleUrl: './cliente-signup.component.css',
})
export class ClienteSignupComponent implements AfterViewInit {
  cargando: boolean = false;
  clienteRegistrandose: boolean = false;
  esRegistroConGoogle: boolean = false;
  mostrarTextoDeErrorAlRegistrarse: boolean = false;
  mostrarTextoDeExitoAlRegistrarse: boolean = false;
  mensajeErrorAlRegistrarse: string = '';

  signupModel: SignupRequest = {
    correoElectronico: '',
    clave: '',
  };

  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
  ) {}

  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    // Paso 1: el botón de Google emite el credential → lo validamos en el
    // backend, que devuelve un tempToken + datos precargados. El catchError
    // va DENTRO del switchMap para que un error no "mate" el botón.
    this.googleAuthService
      .obtenerCredential(this.googleBtn.nativeElement)
      .pipe(
        switchMap((credential) =>
          this.authService.signupConGoogle(credential).pipe(
            catchError((error) => {
              console.error(error);
              this.mensajeErrorAlRegistrarse =
                'No se pudo validar la cuenta de Google.';
              this.mostrarTextoDeErrorAlRegistrarse = true;
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe((response) => {
        // Paso 2: mostramos el formulario con los datos de Google precargados
        this.esRegistroConGoogle = true;
        this.clienteRegistrandose = true;
        this.signupModel.nombreCompleto = response.data.name;
        this.signupModel.correoElectronico = response.data.email;
        this.signupModel.token = response.data.tempToken;
      });
  }

  onSubmit(): void {
    this.mensajeErrorAlRegistrarse = '';
    this.mostrarTextoDeErrorAlRegistrarse = false;
    this.mostrarTextoDeExitoAlRegistrarse = false;

    // Primera fase del form manual: pasar a completar los datos del cliente
    if (!this.signupModel.token && !this.clienteRegistrandose) {
      this.clienteRegistrandose = true;
      return;
    }

    const payload: SignupRequest = { ...this.signupModel };
    if (this.esRegistroConGoogle) {
      // La cuenta se autentica con Google: no mandamos contraseña vacía
      delete payload.clave;
    }

    this.cargando = true;
    this.authService.onSignup(payload).subscribe({
      next: () => {
        // onSignup ya guardó la sesión → entra directo, sin pasar por login
        this.cargando = false;
        this.mostrarTextoDeExitoAlRegistrarse = true;
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);
      },
      error: (error: any) => {
        this.cargando = false;
        this.mostrarTextoDeErrorAlRegistrarse = true;
        this.mensajeErrorAlRegistrarse =
          error.error?.error || 'Ocurrió un error al registrarse';
      },
    });
  }
}