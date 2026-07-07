import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TraductorService {

  private idioma = new BehaviorSubject<string>('es');

  idioma$ = this.idioma.asObservable();

  setIdioma(lang: string) {
    this.idioma.next(lang);
  }

  getIdioma() {
    return this.idioma.value;
  }
}
