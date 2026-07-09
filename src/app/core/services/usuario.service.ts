import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, SignupRequest } from '../../models/auth.interface';

/**
 * Llama a POST /usuarios (ruta protegida, solo Gerente).
 * Es la ÚNICA vía para crear empleados. Requiere que el interceptor
 * agregue el header Authorization con el token del Gerente.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  crearUsuario(data: SignupRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(this.apiUrl, data);
  }
}