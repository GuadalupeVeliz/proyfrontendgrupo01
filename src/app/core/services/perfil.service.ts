import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PerfilUpdatePayload, PerfilUsuario } from '../../models/perfil.interface';

interface PerfilResponse {
  success: boolean;
  data: PerfilUsuario;
}

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  private apiUrl = `${environment.apiUrl}/perfiles`;

  constructor(private http: HttpClient) {}

  getPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(this.apiUrl);
  }

  updatePerfil(data: PerfilUpdatePayload): Observable<PerfilResponse> {
    return this.http.put<PerfilResponse>(this.apiUrl, data);
  }
}
