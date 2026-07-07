import { Component, OnInit } from '@angular/core';
import { RouterLink} from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
 
  nombreUsuario = '';
  constructor(public authService: AuthService) {}

 
  ngOnInit(): void {
    this.authService.correo$.subscribe((correo) => {
      this.nombreUsuario = !correo
        ? ''
        : correo.split('@')[0].length < 16
          ? correo.split('@')[0]
          : correo.substring(0, 16);
        
    });
  }
  logout(): void {
    this.authService.onLogout();
  }

  get rol(): string | null {
    return this.authService.getRol();
  }
 
}