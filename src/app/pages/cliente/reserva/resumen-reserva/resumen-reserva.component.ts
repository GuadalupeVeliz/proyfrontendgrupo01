import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VacanteService } from '../../../../core/services/vacante.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Vacante } from '../../../../models/vacante.interface';
import { ReservaRequest } from '../../../../models/reserva.interface';
import { Usuario } from '../../../../models/auth.interface';
import { Cliente } from '../../../../models/cliente.interface';

@Component({
  selector: 'app-resumen-reserva',
  imports: [CommonModule, RouterLink],
  templateUrl: './resumen-reserva.component.html',
  styleUrl: './resumen-reserva.component.css',
})
export class ResumenReservaComponent implements OnInit {
  vacante: Vacante | null = null;
  cantidad = 1;
  cargando = true;
  procesando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vacanteService: VacanteService,
    private reservaService: ReservaService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    const vacanteId = Number(this.route.snapshot.queryParamMap.get('vacanteId'));
    this.cantidad = Number(this.route.snapshot.queryParamMap.get('cantidad')) || 1;

    if (!vacanteId) {
      this.router.navigate(['/home']);
      return;
    }

    this.cargarVacante(vacanteId);
  }

  cargarVacante(id: number): void {
    this.vacanteService.getVacanteById(id).subscribe({
      next: (result: { success: boolean; data: Vacante }) => {
        this.vacante = result.data;
        this.cargando = false;
      },
      error: () => {
        this.toastService.error('No se pudo cargar la información de la reserva.');
        this.router.navigate(['/home']);
      },
    });
  }

  irAMercadoPago(): void {
    if (this.procesando || !this.vacante?.id) return;

    const raw = localStorage.getItem('usuario');
    const clienteId: number | null = raw ? Number(JSON.parse(raw).clienteId) : null;
    
    if (!clienteId) {
      this.toastService.error('No se pudo identificar al cliente. Volvé a iniciar sesión.');
      return;
    }

    this.procesando = true;

    const reserva: ReservaRequest = {
      fechaDeReservacion: this.vacante.fechaDeSalida,
      cantidadDePersonas: this.cantidad,
      clienteId,
      vacanteId: this.vacante.id,
    };

    this.reservaService.createReserva(reserva).subscribe({
      next: (response: any) => {
        const reservaId = response.data?.id ?? response.id;
        console.log('createReserva result =>', response, response.data?.id);
        this.reservaService.confirmReserva(reservaId).subscribe({
          next: (r) => {
            console.log('confirmReserva result =>', r);
            window.location.href = r.data.init_point;
          },
          error: (error) => {
            this.procesando = false;
            console.error(error);
            this.toastService.error('La reserva se creó pero no se pudo iniciar el pago. Podés reintentarlo desde Mis Reservas.');
            this.router.navigate(['/mis-reservas']);
          },
        });
      },
      error: (error) => {
        this.procesando = false;
        console.error(error);
        this.toastService.error(
          error.error?.error ?? error.error?.mensaje ?? 'No se pudo crear la reserva.',
        );
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
    return this.precioUnitario * this.cantidad;
  }

}