import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable, Subject, tap } from 'rxjs';
import { GoogleSigninResponse, GoogleSignupResponse } from '../../models/auth.interface';
import { AuthService } from './auth.service';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  private readonly CLIENT_ID = environment.clientId;
  private apiUrl = `${environment.apiUrl}`;
  private readonly googleBtnConfig = {
    theme: "outline",
    size: "medium",
    text: "continue_with",
    shape: "rectangular",
    width: "350",
    locale: "es",
  }
  private signupResult$ = new Subject<GoogleSignupResponse>();
  private signinResult$ = new Subject<GoogleSigninResponse>();
  

  constructor(
    private ngZone: NgZone,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // registrarse como cliente
  iniciarBotonGoogleSignup(buttonElement: HTMLElement): Observable<GoogleSignupResponse> {
    google.accounts.id.initialize({
      client_id: this.CLIENT_ID,
      callback: (response: any) => {
        this.ngZone.run(() => {
          this.registrarseConGoogle(response.credential).subscribe({
            next: (result: GoogleSignupResponse) => {
              this.signupResult$.next(result);
            },
            error: (error: any) => {
              this.signupResult$.error(error);
            }
          });
        })
      }
    });
    google.accounts.id.renderButton(buttonElement, this.googleBtnConfig);
    return this.signupResult$.asObservable();
  }

  // iniciar sesion como cliente
  iniciarBotonGoogleSignin(buttonElement: HTMLElement): Observable<GoogleSigninResponse> {
    google.accounts.id.initialize({
      client_id: this.CLIENT_ID,
      callback: (response: any) => {
        this.ngZone.run(() => {
          this.iniciarSesionConGoogle(response.credential).subscribe({
            next: (result: GoogleSigninResponse) => {
              localStorage.setItem('token', result.data.token);
              localStorage.setItem('rol', result.data.rol);
              localStorage.setItem('correo', result.data.correo);
              localStorage.setItem('clienteId', result.data.clienteId || '');
              localStorage.setItem('empleadoId', result.data.empleadoId || '');
              this.authService.actualizarCorreo(result.data.correo);
              this.signinResult$.next(result);
            },
            error: (error: any) => {
              this.signinResult$.error(error);
            }
          });
        })
      }
    });
    google.accounts.id.renderButton(buttonElement, this.googleBtnConfig);
    return this.signinResult$.asObservable();
  }

  registrarseConGoogle(credential: string): Observable<GoogleSignupResponse> {
    return this.http.post<GoogleSignupResponse>(
      `${this.apiUrl}/auth/google/signup`,
      { credential }
    );
  }

  iniciarSesionConGoogle(credential: string): Observable<GoogleSigninResponse> {
    return this.http.post<GoogleSigninResponse>(
      `${this.apiUrl}/auth/google/signin`,
      { credential }
    );
  }

}
