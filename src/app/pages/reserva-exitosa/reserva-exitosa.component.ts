import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { PaqueteTuristico } from '../../models/paquete.interface';
import { Reserva } from '../../models/reserva.interface';

interface ReservaExitosaState {
  reserva?: Reserva;
  paquete?: PaqueteTuristico;
  fechaDeSalida?: string;
  cantidadDePersonas?: number;
  total?: number;
}

@Component({
  selector: 'app-reserva-exitosa',
  imports: [CommonModule, RouterLink],
  templateUrl: './reserva-exitosa.component.html',
  styleUrl: './reserva-exitosa.component.css',
})
export class ReservaExitosaComponent {
  readonly detalle: ReservaExitosaState;

  constructor(
    private router: Router,
    private toastService: ToastService,
  ) {
    this.detalle = (this.router.getCurrentNavigation()?.extras.state ?? history.state) as ReservaExitosaState;
  }

  continuarPago(): void {
    this.toastService.success('El módulo de pagos estará disponible próximamente.');
  }
}
