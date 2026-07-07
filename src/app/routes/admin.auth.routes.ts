import { Routes } from '@angular/router';
import { AdminSignupComponent } from '../pages/admin/signup/admin-signup.component';
import { AdminLoginComponent } from '../pages/admin/login/admin-login.component';
import { authGuard } from '../core/guards/auth.guard';

export const adminAuthRoutes: Routes = [
  {
    path: 'signup',
    canActivate: [authGuard],
    data: { roles: ['Gerente'] },
    component: AdminSignupComponent
  },
  {
    path: 'login',
    data: { roles: ['Gerente', 'Empleado'] },
    component: AdminLoginComponent,
  },
  // {
  //   path: 'logout',
  //   component: LogoutComponent,
  // },
];
