import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VacanteService {
  private apiUrl = `${environment.apiUrl}/vacantes`;

  constructor(private http: HttpClient) {}

  getVacantes() {
    return this.http.get<any>(this.apiUrl);
  }
}