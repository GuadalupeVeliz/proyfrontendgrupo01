import { Routes } from '@angular/router';
import { LoginComponent } from '../components/auth/login/login.component';
import { SignupComponent } from '../components/auth/signup/signup.component';

export const authRoutes: Routes = [
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  //   {
  //     path: 'logout',
  //     component: LogoutComponent,
  //   },
];
