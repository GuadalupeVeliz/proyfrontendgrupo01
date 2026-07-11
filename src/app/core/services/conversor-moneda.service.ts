import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConversorMonedaService {

  constructor(private http: HttpClient) { }

  convertir(from: string, to: string, amount: number): Observable<any> {
    console.log(from, to, amount);
    let httpOptions = {
      headers: new HttpHeaders({
        'x-rapidapi-key': 'cb3248b3e4mshcc7893fea728b6fp1044cejsnda64170dc028',
        'x-rapidapi-host': 'currency-exchange.p.rapidapi.com',
        'Content-Type': 'application/json',
      }),
    };
    const params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('amount', amount);

    return this.http.get("https://currency-exchange.p.rapidapi.com/exchange?from=USD&to=ARS&q=1.0", { headers: httpOptions.headers, params });
  }

}
