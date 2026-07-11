import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VacanteService } from '../../../../core/services/vacante.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Vacante } from '../../../../models/vacante.interface';
import { DetalleReservaState, ReservaConfirmadaResponse } from '../../../../models/reserva.interface';

@Component({
  selector: 'app-resumen-reserva',
  imports: [CommonModule, RouterLink],
  templateUrl: './resumen-reserva.component.html',
  styleUrl: './resumen-reserva.component.css',
})
export class ResumenReservaComponent {
  vacante: Vacante | null = null;
  reservaId: number | null = null;
  cantidadDePersonas: number = 1;
  estadoReserva: string | null = null;
  procesando: boolean = false;
  cargando: boolean = true;

  constructor(
    private router: Router,
    private vacanteService: VacanteService,
    private reservaService: ReservaService,
    private toastService: ToastService,
  ) {
    const state = this.router.getCurrentNavigation()?.extras?.state as DetalleReservaState | undefined;
    console.log(state);
    
    if (!state?.reserva?.id || !state.cantidadDePersonas || !state?.estado || !state?.vacanteId) {
      this.toastService.error('No se pudo cargar la información de la reserva.');
      this.router.navigate(['/home']);
      return;
    }

    this.reservaId = state.reserva.id;
    this.cantidadDePersonas = state.cantidadDePersonas;
    this.estadoReserva = state.estado;
    this.cargarVacante(state.vacanteId);
  }

  cargarVacante(id: number): void {
    this.vacanteService.getVacanteById(id).subscribe({
      next: (response: { success: boolean; data: Vacante }) => {
        this.vacante = response.data;
        this.cargando = false;
      },
      error: () => {
        this.toastService.error('No se pudo cargar la información de la vacante.');
        this.router.navigate(['/home']);
      },
    });
  }

  irAMercadoPago(): void {
    this.procesando = true;
    if (!this.vacante || !this.reservaId) {
      console.log('1. fallo al ir a mercado pago');
      this.procesando = false;
      this.toastService.error('No se pudo procesar el pago. Volvé a intentarlo desde Mis Reservas.');
      return;
    }
    const clienteId = localStorage.getItem('usuario') 
      ? Number(JSON.parse(localStorage.getItem('usuario') as string).clienteId) 
      : null;

    if (!clienteId) {
      console.log('2. fallo al ir a mercado pago');
      this.toastService.error('No se pudo identificar al cliente. Volvé a iniciar sesión.');
      this.procesando = false;
      return;
    }
    console.log('3. comenzando a confirmar reserva');
    this.reservaService.confirmReserva(this.reservaId).subscribe({
      next: (response: ReservaConfirmadaResponse) => {
        console.log('4. se confirmo la reserva');
        this.procesando = false;
        window.location.href = response.data.init_point;
      },
      error: (error) => {
        console.log('5. hubo un error al confirmar la reserva');
        this.procesando = false;
        console.error('confirmReserva error', error);
        this.toastService.error('La reserva se creó pero no se pudo iniciar el pago. Podés reintentarlo desde Mis Reservas.');
        this.router.navigate(['/mis-reservas']);
      },
    });
  }

  get paquete() {
    return this.vacante?.paqueteTuristico ?? null;
  }

  get precioUnitario(): number {
    return Number(this.paquete?.precioBase ?? 0);
  }

  get total(): number {
    return this.precioUnitario * this.cantidadDePersonas;
  }

}