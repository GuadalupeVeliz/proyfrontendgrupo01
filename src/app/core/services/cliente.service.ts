import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente } from '../../models/cliente.interface';

export type ClientePayload = Pick<Cliente, 'dni' | 'nombreCompleto' | 'telefono'>;

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<{ success: boolean; data: Cliente[] }> {
    return this.http.get<{ success: boolean; data: Cliente[] }>(this.apiUrl);
  }

  getClienteById(id: number): Observable<{ success: boolean; data: Cliente }> {
    return this.http.get<{ success: boolean; data: Cliente }>(`${this.apiUrl}/${id}`);
  }

  createCliente(cliente: ClientePayload): Observable<{ success: boolean; data: Cliente }> {
    return this.http.post<{ success: boolean; data: Cliente }>(this.apiUrl, cliente);
  }

  updateCliente(
    id: number,
    cliente: Partial<ClientePayload>
  ): Observable<{ success: boolean; data: Cliente }> {
    return this.http.put<{ success: boolean; data: Cliente }>(`${this.apiUrl}/${id}`, cliente);
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
