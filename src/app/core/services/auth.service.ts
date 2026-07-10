import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  GoogleSigninResponse,
  GoogleSignupResponse,
  LoginRequest,
  SignupRequest,
  Usuario,
} from '../../models/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.leerUsuario());
  usuario$: Observable<Usuario | null> = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {}

  onLogin(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) =>
        this.guardarSesion(res.data.token, {
          correo: data.correoElectronico,
          rol: res.data.rol,
          clienteId: res.data.clienteId ?? null,
          empleadoId: res.data.empleadoId ?? null,
        }),
      ),
    );
  }

  onSignup(data: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data).pipe(
      tap((res) =>
        this.guardarSesion(res.data.token, {
          correo: data.correoElectronico,
          rol: res.data.rol,
          clienteId: res.data.clienteId ?? null,
        }),
      ),
    );
  }

  loginConGoogle(credential: string): Observable<GoogleSigninResponse> {
    return this.http
      .post<GoogleSigninResponse>(`${this.apiUrl}/google/signin`, { credential })
      .pipe(
        tap((res) =>
          this.guardarSesion(res.data.token, {
            correo: res.data.correo,
            rol: res.data.rol,
            clienteId: res.data.clienteId ? Number(res.data.clienteId) : null,
            empleadoId: null,
          }),
        ),
      );
  }

  signupConGoogle(credential: string): Observable<GoogleSignupResponse> {
    return this.http.post<GoogleSignupResponse>(`${this.apiUrl}/google/signup`, {
      credential,
    });
  }

  private guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  private leerUsuario(): Usuario | null {
    const usuarioJson = localStorage.getItem('usuario');
    try {
      const usuarioLogueado: Usuario | null = usuarioJson 
        ? (JSON.parse(usuarioJson) as Usuario) 
        : null;
      return usuarioLogueado;
    } catch {
      return null;
    }
  }

  onLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return this.usuarioSubject.value?.rol ?? null;
  }

  getCorreo(): string | null {
    return this.usuarioSubject.value?.correo ?? null;
  }

  getEmpleadoId(): number | null {
    return this.usuarioSubject.value?.empleadoId ?? null;
  }

  actualizarCorreo(correo: string): void {
    const usuario = this.usuarioSubject.value;
    const token = this.getToken();
    if (usuario && token) {
      this.guardarSesion(token, { ...usuario, correo });
    }
  }
}
