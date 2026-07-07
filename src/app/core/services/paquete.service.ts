import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaqueteTuristico } from '../../models/paquete.interface';

export type PaquetePayload = Pick<
  PaqueteTuristico,
  'nombre' | 'ubicacion' | 'descripcion' | 'precioBase' | 'duracionEnDias'
>;

@Injectable({
  providedIn: 'root',
})
export class PaqueteService {
  private apiUrl = `${environment.apiUrl}/paquetes-turisticos`;

  constructor(private http: HttpClient) {}

  getPaquetes(): Observable<{ success: boolean; data: PaqueteTuristico[] }> {
    return this.http.get<{ success: boolean; data: PaqueteTuristico[] }>(this.apiUrl);
  }

  getPaqueteById(id: number): Observable<{ success: boolean; data: PaqueteTuristico }> {
    return this.http.get<{ success: boolean; data: PaqueteTuristico }>(`${this.apiUrl}/${id}`);
  }

  createPaquete(paquete: PaquetePayload): Observable<{ success: boolean; data: PaqueteTuristico }> {
    return this.http.post<{ success: boolean; data: PaqueteTuristico }>(this.apiUrl, paquete);
  }

  updatePaquete(id: number, paquete: Partial<PaquetePayload>): Observable<{ success: boolean; data: PaqueteTuristico }> {
    return this.http.put<{ success: boolean; data: PaqueteTuristico }>(`${this.apiUrl}/${id}`, paquete);
  }

  deletePaquete(id: number): Observable<{ success: boolean; data: PaqueteTuristico }> {
    return this.http.delete<{ success: boolean; data: PaqueteTuristico }>(`${this.apiUrl}/${id}`);
  }
}
