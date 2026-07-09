import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = authService.getToken();
  const rolesPermitidos = (route.data['roles'] as string[]) ?? [];

  const loginUrl = state.url.startsWith('/admin') ? '/admin/login' : '/auth/login';

  if (!token || tokenExpirado(token)) {
    return router.parseUrl(loginUrl);
  }

  const rol = authService.getRol();
  if (rolesPermitidos.length && (!rol || !rolesPermitidos.includes(rol))) {
    return router.parseUrl('/unauthorized');
  }

  return true;
};

function tokenExpirado(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const ahora = Math.floor(Date.now() / 1000);
    return payload.exp < ahora;
  } catch {
    return true;
  }
}