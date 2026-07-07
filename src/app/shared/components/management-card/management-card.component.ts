import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface CardDetail {
  icono: string;
  texto: string;
}

export interface CardAction {
  id: string;
  icono: string;
  titulo: string;
  variante?: 'primary' | 'warning' | 'success' | 'danger' | 'secondary';
  deshabilitada?: boolean;
}

@Component({
  selector: 'app-management-card',
  imports: [],
  templateUrl: './management-card.component.html',
  styleUrl: './management-card.component.css',
})
export class ManagementCardComponent {

  @Input() titulo = '';

  @Input() descripcion = '';

  @Input() estado = '';

  @Input() detalles: CardDetail[] = [];

  @Input() acciones: CardAction[] = [];

  @Input() mostrarAcciones = false;

  @Input() mostrarReservar = false;

  @Input() textoReservar = 'Reservar';

  @Output() editar = new EventEmitter<void>();

  @Output() eliminar = new EventEmitter<void>();

  @Output() reservar = new EventEmitter<void>();

  @Output() accion = new EventEmitter<string>();

  @Input() clickable = false;
  
  @Output() cardClick = new EventEmitter<void>();
}
