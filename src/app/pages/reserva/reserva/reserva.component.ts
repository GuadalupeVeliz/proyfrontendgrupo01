import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService } from '../../../core/services/auth.service';
import { Reserva } from '../../../models/reserva.interface';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { VacanteService } from '../../../core/services/vacante.service';
import { PaqueteService } from '../../../core/services/paquete.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reserva',
  imports: [CurrencyPipe,FormsModule,CommonModule],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit {
  reservas: any = [];
  reservaSeleccionada: any;
  clienteId :number = 0;
  paquete:any;

  constructor(
    private reservaService: ReservaService,
    public authService: AuthService,
    private paqueteService: PaqueteService
  ) {}

  ngOnInit(): void {
    this.clienteId = Number(localStorage.getItem('idCliente'))
    this.cargarReservas();
  }

  mostrarReserva (reserva : Reserva) :void {
    this.reservaSeleccionada = reserva;
    this.buscarPaquete (this.reservaSeleccionada.vacante.paqueteTuristicoId);
  }

  buscarPaquete(paqueteId : number) : void {
    this.paqueteService.getPaqueteById(paqueteId).subscribe({
      next: (response) => {
        this.paquete = response.data;
      },
      error: (error) => {
        console.error('Error al cargar paquete',error)
      }
    })
  }

  cargarReservas(): void {
    this.reservaService.getReservasByClient(this.clienteId).subscribe({
        next: (response) => {
          this.reservas = response.data;
        },
        error: (error) => {
          console.error('Error al cargar reservas', error);
        }
      });
  }



  cancelarReserva(id: number): void {
    this.reservaService.cancelarReserva(id)
      .subscribe({
        next: () => {
          this.cargarReservas();
          this.cerrarModal();
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  confirmarReserva(id: number): void {
    this.reservaService.confirmReserva(id)
      .subscribe({
        next: () => {
          this.cargarReservas();
          this.cerrarModal();
        },
        error: (error) => {
          console.error(error);
        }
      });
  }


  cerrarModal(): void {
    const botonCerrar = document.querySelector(
      '#detalleReservaModal [data-bs-dismiss="modal"]') as HTMLElement;
    botonCerrar?.click();
  }
}
