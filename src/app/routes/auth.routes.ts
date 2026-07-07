import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/login/login.component';
import { SignupComponent } from '../pages/signup/signup.component';

export const authRoutes: Routes = [
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  // {
  //   path: 'logout',
  //   component: LogoutComponent,
  // },
];
