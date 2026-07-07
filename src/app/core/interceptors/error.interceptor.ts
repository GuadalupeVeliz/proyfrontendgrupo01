import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje = `${error.error?.message ?? error.error?.error ?? error.error?.mensaje ?? ''}`;
      const tokenInvalido = mensaje.toLowerCase().includes('token');

      if (error.status === 401 || (error.status === 403 && tokenInvalido)) {
        authService.onLogout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
