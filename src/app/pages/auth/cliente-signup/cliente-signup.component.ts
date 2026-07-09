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

    if (!this.signupModel.token && !this.clienteRegistrandose) {
      this.clienteRegistrandose = true;
      return;
    }

    const payload: SignupRequest = { ...this.signupModel };
    if (this.esRegistroConGoogle) {
      delete payload.clave;
    }

    this.cargando = true;
    this.authService.onSignup(payload).subscribe({
      next: () => {
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