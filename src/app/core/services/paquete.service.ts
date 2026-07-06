import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaqueteTuristico } from '../../models/paquete.interface';


@Injectable({
  providedIn: 'root',
})
export class PaqueteService {
  private apiUrl = `${environment.apiUrl}/paquetes-turisticos`;

  constructor(private http: HttpClient) {}

  getPaquetes(): Observable<PaqueteTuristico[]> {
    return this.http.get<PaqueteTuristico[]>(this.apiUrl);
  }
}