import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../../services/dashboard.service';
import { Reserva } from '../../../../models/reserva.interface';

@Component({
  selector: 'app-reservas-tabla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas-tabla.component.html',
  styleUrl: './reservas-tabla.component.css',
})
export class ReservasTablaComponent implements OnInit {
  estados = ['Confirmada', 'Pendiente', 'Cancelada'];

  reservas: Reserva[] = [];
  total = 0;
  pagina = 1;
  totalPaginas = 0;
  limit = 10;

  estadoSeleccionado: string = '';
  searchInput: string = '';
  cargando = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  buscar(): void {
    this.pagina = 1;
    this.cargarReservas();
  }

  limpiarFiltros(): void {
    this.estadoSeleccionado = '';
    this.searchInput = '';
    this.pagina = 1;
    this.cargarReservas();
  }

  irAPagina(nuevaPagina: number): void {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas) return;
    this.pagina = nuevaPagina;
    this.cargarReservas();
  }

  private cargarReservas(): void {
    this.cargando = true;
    this.dashboardService
      .getReservas({
        estado: this.estadoSeleccionado || undefined,
        search: this.searchInput || undefined,
        page: this.pagina,
        limit: this.limit,
      })
      .subscribe({
        next: (data) => {
          this.reservas = data.reservas;
          this.total = data.total;
          this.pagina = data.pagina;
          this.totalPaginas = data.totalPaginas;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        },
      });
  }
}
