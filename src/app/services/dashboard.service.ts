import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ReservaPorMes,
  ReservaPorEstado,
  IngresoEvolucion,
  ReservasFiltros,
  ReservasPaginadas,
  ResumenDashboard,
} from '../models/dashboard.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getReservasPorMes(anio: number): Observable<ReservaPorMes[]> {
    return this.http.get<ReservaPorMes[]>(`${this.apiUrl}/reservas-por-mes`, {
      params: { anio: anio.toString() },
    });
  }

  getReservasPorEstado(): Observable<ReservaPorEstado[]> {
    return this.http.get<ReservaPorEstado[]>(
      `${this.apiUrl}/reservas-por-estado`,
    );
  }

  getIngresosEvolucion(): Observable<IngresoEvolucion[]> {
    return this.http.get<IngresoEvolucion[]>(
      `${this.apiUrl}/ingresos-evolucion`,
    );
  }

  getReservas(filtros: ReservasFiltros): Observable<ReservasPaginadas> {
    let params = new HttpParams()
      .set('page', filtros.page)
      .set('limit', filtros.limit);

    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.search) {
      params = params.set('search', filtros.search);
    }

    return this.http.get<ReservasPaginadas>(`${this.apiUrl}/reservas`, {
      params,
    });
  }

  getResumen(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>(`${this.apiUrl}/resumen`);
  }

  exportarExcel(anio: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/exportar/excel`, {
    params: { anio: anio.toString() },
    responseType: 'blob',
  });
}

exportarPDF(anio: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/exportar/pdf`, {
    params: { anio: anio.toString() },
    responseType: 'blob',
  });
}
}

