import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
 
  nombreUsuario = '';
  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

 
  ngOnInit(): void {
    this.authService.correo$.subscribe((correo) => {
      this.nombreUsuario = correo
        ? correo.substring(0, 8)
        : '';
    });
  }
  logout(): void {
    this.authService.onLogout();
    this.router.navigate(['/auth/login']);
  }

  get rol(): string | null {
    return this.authService.getRol();
  }
 
}
