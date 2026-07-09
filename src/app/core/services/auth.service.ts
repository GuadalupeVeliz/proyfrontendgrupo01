import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, SignupRequest } from '../../models/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private correoSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('correo'),
  );

  correo$: Observable<string | null> = this.correoSubject.asObservable();

  constructor(private http: HttpClient) { }

  onLogin(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('rol', res.data.rol);
        localStorage.setItem('correo', data.correoElectronico);
        localStorage.setItem('clienteId', res.data.clienteId?.toString() ?? '');
        localStorage.setItem('idCliente', res.data.clienteId?.toString() ?? '');
        localStorage.setItem('empleadoId', res.data.empleadoId?.toString() ?? '');
        this.correoSubject.next(data.correoElectronico);
      }),
    );
  }

  onSignup(data: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data).pipe(
      tap((res) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('correo', data.correoElectronico);
        this.correoSubject.next(data.correoElectronico);
      }),
    );
  }

  onSignupCliente(data: SignupRequest): Observable<AuthResponse> {
    console.log('onSignupCliente() =>', data);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data);
  }

  onLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('correo');
    localStorage.removeItem('clienteId');
    localStorage.removeItem('empleadoId');

    this.correoSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getCorreo(): string | null {
    return localStorage.getItem('correo');
  }

  actualizarCorreo(correoElectronico: string): void {
    localStorage.setItem('correo', correoElectronico);
    this.correoSubject.next(correoElectronico);
  }
}
