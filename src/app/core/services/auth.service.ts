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

/**
 * ÚNICO dueño de la sesión: todo lo que toque el backend de auth
 * o localStorage pasa por acá. GoogleAuthService solo entrega el credential.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.leerUsuario());
  usuario$: Observable<Usuario | null> = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ---------- Correo y contraseña ----------

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

  /** Signup público: SOLO crea clientes. A los empleados los crea el Gerente
   *  desde su panel con un endpoint protegido (p. ej. POST /empleados). */
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

  // ---------- Google (recibe el credential desde GoogleAuthService) ----------

  loginConGoogle(credential: string): Observable<GoogleSigninResponse> {
    return this.http
      .post<GoogleSigninResponse>(`${this.apiUrl}/google/signin`, { credential })
      .pipe(
        tap((res) =>
          this.guardarSesion(res.data.token, {
            correo: res.data.correo,
            rol: res.data.rol,
            clienteId: res.data.clienteId ? Number(res.data.clienteId) : null,
            empleadoId: null, // Google es solo para clientes
          }),
        ),
      );
  }

  /** Paso 1 del registro con Google: el backend valida el credential y
   *  devuelve un tempToken + datos precargados. La sesión NO se guarda
   *  hasta que el usuario complete el registro (paso 2). */
  signupConGoogle(credential: string): Observable<GoogleSignupResponse> {
    return this.http.post<GoogleSignupResponse>(`${this.apiUrl}/google/signup`, {
      credential,
    });
  }

  // ---------- Sesión ----------

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

  /** OJO: el rol en el cliente es solo para UX (mostrar/ocultar rutas).
   *  El backend SIEMPRE valida el rol real desde el JWT. */
  getRol(): string | null {
    return this.usuarioSubject.value?.rol ?? null;
  }

  getCorreo(): string | null {
    return this.usuarioSubject.value?.correo ?? null;
  }

  actualizarCorreo(correo: string): void {
    const usuario = this.usuarioSubject.value;
    const token = this.getToken();
    if (usuario && token) {
      this.guardarSesion(token, { ...usuario, correo });
    }
  }
}