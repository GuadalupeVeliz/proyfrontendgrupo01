import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

declare const google: any;

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

  constructor(private ngZone: NgZone) { }

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