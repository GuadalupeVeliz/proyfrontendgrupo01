import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = authService.getToken();
  const rol = authService.getRol()!;
  const rolesPermitidos = (route.data['roles'] as string[]) || [];

  if (token && (!rolesPermitidos.length || rolesPermitidos.includes(rol))) {
    return true;
  }

  if (!token) {
    router.navigate(['/login']);
  } else {
    router.navigate(['/unauthorized']);
  }
  return false;
};
