import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reserva } from '../../models/reserva.interface';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  getReservas(): Observable<{ success: boolean; data: Reserva[] }> {
    return this.http.get<{ success: boolean; data: Reserva[] }>(this.apiUrl);
  }

  getReservaById(id: number): Observable<{ success: boolean; data: Reserva }> {
    return this.http.get<{ success: boolean; data: Reserva }>(`${this.apiUrl}/${id}`);
  }

  cancelarReserva(id: number): Observable<{ success: boolean; data: Reserva }> {
    return this.http.put<{ success: boolean; data: Reserva }>(`${this.apiUrl}/cancel/${id}`, {});
  }
}
