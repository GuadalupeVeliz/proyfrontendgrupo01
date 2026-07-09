import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // ¡NO environment.development!

declare const google: any;

/**
 * Envoltorio FINO de Google Identity Services.
 * Su única responsabilidad: renderizar el botón y emitir el credential.
 * No llama al backend ni toca localStorage — eso es de AuthService.
 */
@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private readonly CLIENT_ID = environment.clientId;

  private readonly googleBtnConfig = {
    theme: 'outline',
    size: 'medium',
    text: 'continue_with',
    shape: 'rectangular',
    width: '350',
    locale: 'es',
  };

  constructor(private ngZone: NgZone) {}

  /**
   * Renderiza el botón de Google en el elemento dado y emite el credential
   * (JWT de Google) cada vez que el usuario se autentica.
   * El componente decide qué hacer con él (login o signup) vía AuthService.
   */
  obtenerCredential(buttonElement: HTMLElement): Observable<string> {
    return new Observable<string>((observer) => {
      google.accounts.id.initialize({
        client_id: this.CLIENT_ID,
        callback: (response: any) =>
          this.ngZone.run(() => observer.next(response.credential)),
      });
      google.accounts.id.renderButton(buttonElement, this.googleBtnConfig);
    });
  }
}