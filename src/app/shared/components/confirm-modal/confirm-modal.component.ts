import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() titulo = 'Confirmar acción';
  @Input() mensaje = '';
  @Input() textoCancelar = 'Cancelar';
  @Input() textoConfirmar = 'Confirmar';

  @Output() cancelar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();
}