import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vacante } from '../../models/vacante.interface';

export type VacantePayload = Pick<
  Vacante,
  'fechaDeSalida' | 'cupoDisponible' | 'paqueteTuristicoId'
> & {
  cupoTotal?: number;
  estado?: string;
};

@Injectable({
  providedIn: 'root',
})
export class VacanteService {
  private apiUrl = `${environment.apiUrl}/vacantes`;

  constructor(private http: HttpClient) {}

  getVacantes(): Observable<{ success: boolean; data: Vacante[] }> {
    return this.http.get<{ success: boolean; data: Vacante[] }>(this.apiUrl);
  }

  getVacanteById(id: number): Observable<{ success: boolean; data: Vacante }> {
    return this.http.get<{ success: boolean; data: Vacante }>(`${this.apiUrl}/${id}`);
  }

  createVacante(vacante: VacantePayload): Observable<{ success: boolean; data: Vacante }> {
    return this.http.post<{ success: boolean; data: Vacante }>(this.apiUrl, vacante);
  }

  updateVacante(id: number, vacante: Partial<VacantePayload>): Observable<{ success: boolean; data: Vacante }> {
    return this.http.put<{ success: boolean; data: Vacante }>(`${this.apiUrl}/${id}`, vacante);
  }

  deleteVacante(id: number): Observable<{ success: boolean; data: Vacante }> {
    return this.http.delete<{ success: boolean; data: Vacante }>(`${this.apiUrl}/${id}`);
  }
}
