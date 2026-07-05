import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  private BACKEND_URL = "";
  private readonly CLIENT_ID = '352988450917-kltn34b3fgpc7ko2lrveq5ee7k48rs8r.apps.googleusercontent.com';
  private codeClient: any;

  constructor(private http: HttpClient, private ngZone: NgZone) { }

  initGoogleButton(buttonElement: HTMLElement): void {
    google.accounts.id.initialize({
      client_id: this.CLIENT_ID,
      callback: (response: any) => {
        this.ngZone.run(() => this.handleCredential(response.credential));
      }
    });

    google.accounts.id.renderButton(buttonElement, {
      theme: "outline",
      size: "medium",
      text: "continue_with",
      shape: "rectangular",
      width: "400"
    });
  }

  openPopup(): void {
    this.codeClient.requestCode();
  }

  private handleCredential(idToken: string): void {
    // El idToken es un JWT: se puede decodificar para ver los datos.
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    console.log("Usuario", payload.name, payload.email, payload.picture);
    // this.sendCodeToBackend(payload);
    // En producción: enviás idToken a tu backend
    // para que lo verifique y te devuelva tu propio token de sesión.
  }

  private sendCodeToBackend(code: string): void {
    this.http.post(`${this.BACKEND_URL}/auth/google`, { code }).subscribe({
      next: (response: any) => {
        localStorage.setItem('session_token', response.token)
      },
      error: (error: any) => console.error('Error al enviar codigo al backend', error)
    })
  }

}
