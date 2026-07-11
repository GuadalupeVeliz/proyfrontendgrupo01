import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auditoria, AuditoriaFiltros } from '../../models/auditoria.interface';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private apiUrl = `${environment.apiUrl}/auditoria`;

  constructor(private http: HttpClient) { }

  getAuditorias(filtros: any): Observable<{ success: boolean; data: Auditoria[] }> {
    let params = new HttpParams();
    Object.keys(filtros).forEach(key => {
      const value = filtros[key];

      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });
    return this.http.get<{ success: boolean; data: Auditoria[] }>(this.apiUrl, { params });
  }

  getFiltros(): Observable<{ success: boolean; data: AuditoriaFiltros }> {
    return this.http.get<{ success: boolean; data: AuditoriaFiltros }>(
      `${this.apiUrl}/filtros`
    );
  }
}
