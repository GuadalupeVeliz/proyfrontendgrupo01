import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const  authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = authService.getToken();
  const rol = authService.getRol()!;
  const rolesPermitidos = (route.data['roles'] as string[]) || [];

  if (token && !tokenExpirado(token) && (!rolesPermitidos.length || rolesPermitidos.includes(rol))) {
    return true;
  }

  if (!token) {
    router.navigate(['/auth/login']);
  } else {
    router.navigate(['/unauthorized']);
  }
  return false;
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
