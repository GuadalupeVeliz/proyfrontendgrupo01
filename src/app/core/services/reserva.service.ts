import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reserva, ReservaConfirmadaResponse, ReservaRequest } from '../../models/reserva.interface';

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

  createReserva(data: ReservaRequest): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(this.apiUrl, {
      ...data,
      fechaDeReservacion: this.obtenerFechaValidaDeReservacion(),
    });
  }

  deleteReserva(reservaId: number): Observable<Reserva> {
    return this.http.delete<Reserva>(`${this.apiUrl}/${reservaId}`)
  }

  confirmReserva(reservaId: number): Observable<ReservaConfirmadaResponse> {
    return this.http.put<ReservaConfirmadaResponse>(
      `${this.apiUrl}/checkout/${reservaId}`, {}
    );
  }

  getReservasByClient(clienteId: number): Observable<{ success: boolean; data: Reserva[] }> {
    return this.http.get<{ success: boolean; data: Reserva[] }>(`${this.apiUrl}/cliente/${clienteId}`)
  }

  private obtenerFechaValidaDeReservacion(): string {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const anio = manana.getFullYear();
    const mes = String(manana.getMonth() + 1).padStart(2, '0');
    const dia = String(manana.getDate()).padStart(2, '0');
    console.log('fecha mañana:', `${anio}-${mes}-${dia}`);
    
    return `${anio}-${mes}-${dia}`;
  }
}
