import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleSignupResponse, SignupRequest } from '../../../models/auth.interface';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, CommonModule],
  templateUrl: './cliente-signup.component.html',
  styleUrl: './cliente-signup.component.css'
})
export class ClienteSignupComponent implements AfterViewInit {
  sedes = ['sucursal', 'central'];
  tiposDeUsuario = ['empleado', 'cliente'];
  tipoDeUsuarioSeleccionado = 'cliente';

  cargando: boolean = false;
  clienteRegistrandose: boolean = false;
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
  ) { }

  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    // al tocar el boton de google se ejecuta esto
    this.googleAuthService.iniciarBotonGoogleSignup(this.googleBtn.nativeElement).subscribe({
      next: (response: GoogleSignupResponse) => {
        console.log('response google sign up', response);
        this.clienteRegistrandose = true;
        this.signupModel.nombreCompleto = response.name;
        this.signupModel.correoElectronico = response.email;
        this.signupModel.token = response.token;
      },
      error: (error: any) => {
        console.error(error);
      }
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

    this.cargando = true;
    this.authService.onSignupCliente(this.signupModel).subscribe({
      next: () => {
        this.mostrarTextoDeExitoAlRegistrarse = true;
        setTimeout(() => {
          this.clienteRegistrandose = false;
          this.cargando = false;
          this.mostrarTextoDeExitoAlRegistrarse = false;
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.cargando = false;
        this.mostrarTextoDeErrorAlRegistrarse = true;
        this.mensajeErrorAlRegistrarse = error.error?.error || 'Ocurrió un error al registrarse';
      },
    });
  }

}
