import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reserva, ReservaRequest } from '../../models/reserva.interface';

type ReservaResponse = { success: boolean; data: Reserva };

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) { }

  getReservas(): Observable<{ success: boolean; data: Reserva[] }> {
    return this.http.get<{ success: boolean; data: Reserva[] }>(this.apiUrl);
  }

  getReservaById(id: number): Observable<{ success: boolean; data: Reserva }> {
    return this.http.get<{ success: boolean; data: Reserva }>(`${this.apiUrl}/${id}`);
  }

  cancelarReserva(id: number): Observable<ReservaResponse> {
    return this.http.put<ReservaResponse>(`${this.apiUrl}/cancel/${id}`, {});
  }

  createReserva(data: ReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}`, data)
  }

  deleteReserva(reservaId: number): Observable<Reserva> {
    return this.http.delete<Reserva>(`${this.apiUrl}/${reservaId}`)
  }

  confirmReserva(reservaId: number): Observable<{ success: boolean; data: { init_point: string } }> {
    return this.http.put<{ success: boolean; data: { init_point: string } }>(
      `${this.apiUrl}/checkout/${reservaId}`, {}
    );
  }

  getReservasByClient(clienteId: number): Observable<{ success: boolean; data: Reserva[] }> {
    return this.http.get<{ success: boolean; data: Reserva[] }>(`${this.apiUrl}/cliente/${clienteId}`)
  }
}
