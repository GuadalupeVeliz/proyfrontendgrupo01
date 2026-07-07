import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-toolbar',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-toolbar.component.html',
  styleUrl: './admin-toolbar.component.css',
})
export class AdminToolbarComponent {
  @Input() busqueda = '';
  @Input() placeholder = 'Buscar...';
  @Input() botonTexto = '';
  @Input() botonRuta: string | null = null;
  @Input() mostrarBoton = true;

  @Output() busquedaChange = new EventEmitter<string>();
}
