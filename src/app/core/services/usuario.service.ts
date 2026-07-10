import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, SignupRequest } from '../../models/auth.interface';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  crearUsuario(data: SignupRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(this.apiUrl, data);
  }

  getUsuarioById(id: number): Observable<ApiResponse<{ correoElectronico: string }>> {
    return this.http.get<ApiResponse<{ correoElectronico: string }>>(`${this.apiUrl}/${id}`);
  }
}
