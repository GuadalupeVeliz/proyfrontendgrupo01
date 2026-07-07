import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-page-header',
  imports: [RouterLink],
  templateUrl: './admin-page-header.component.html',
  styleUrl: './admin-page-header.component.css',
})
export class AdminPageHeaderComponent {
  @Input() titulo = '';
  @Input() subtitulo = '';
  @Input() volverRuta: string | null = null;
  @Input() textoVolver = 'Volver';
}
