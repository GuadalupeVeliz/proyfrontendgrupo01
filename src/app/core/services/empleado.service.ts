import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empleado } from '../../models/empleado.interface';

export type EmpleadoPayload = Pick<Empleado, 'legajo' | 'sede' | 'esGerente'>;

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private apiUrl = `${environment.apiUrl}/empleados`;

  constructor(private http: HttpClient) {}

  getEmpleados(): Observable<{ success: boolean; data: Empleado[] }> {
    return this.http.get<{ success: boolean; data: Empleado[] }>(this.apiUrl);
  }

  getEmpleadoById(id: number): Observable<{ success: boolean; data: Empleado }> {
    return this.http.get<{ success: boolean; data: Empleado }>(`${this.apiUrl}/${id}`);
  }

  createEmpleado(empleado: EmpleadoPayload): Observable<{ success: boolean; data: Empleado }> {
    return this.http.post<{ success: boolean; data: Empleado }>(this.apiUrl, empleado);
  }

  updateEmpleado(
    id: number,
    empleado: Partial<EmpleadoPayload>
  ): Observable<{ success: boolean; data: Empleado }> {
    return this.http.put<{ success: boolean; data: Empleado }>(`${this.apiUrl}/${id}`, empleado);
  }

  deleteEmpleado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
