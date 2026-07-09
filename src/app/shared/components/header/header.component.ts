import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TraductorService } from '../../../core/services/traductor.service';
import { Usuario } from '../../../models/auth.interface';


@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {

  idiomas = [
    { nombre: 'Español', codigo: 'es' },
    { nombre: 'English', codigo: 'en' },
    { nombre: 'Português', codigo: 'pt' },
    { nombre: 'Français', codigo: 'fr' },
    { nombre: 'Italiano', codigo: 'it' },
    { nombre: 'Deutsch', codigo: 'de' }
  ];

  idiomaSeleccionado = 'es';
  nombreUsuario = '';
  constructor(
    public authService: AuthService,
    private idiomaService: TraductorService,
    private router: Router,
  ) { }


  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario: Usuario | null) => {
      if (!usuario) {
        this.nombreUsuario = '';
        return;
      }
      this.nombreUsuario = usuario.correo.split('@')[0].length < 18
        ? usuario.correo.split('@')[0]
        : usuario.correo.substring(0, 18);
    });
  }
  
  logout(): void {
    this.authService.onLogout();
    this.router.navigate(['/auth/login']);
  }

  get rol(): string | null {
    return this.authService.getRol();
  }

  cambiarIdioma(event: Event) {
    const idioma = (event.target as HTMLSelectElement).value;
    this.idiomaService.setIdioma(idioma);
  }

}
