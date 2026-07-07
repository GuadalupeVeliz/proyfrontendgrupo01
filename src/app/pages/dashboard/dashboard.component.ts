import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';
import {
  ReservaPorMes,
  ReservaPorEstado,
  IngresoEvolucion,
  ResumenDashboard,
} from '../../models/dashboard.interface';
import {
  DEFAULT_COLORS,
  RESERVAS_POR_MES_OPTIONS,
  RESERVAS_POR_ESTADO_OPTIONS,
  INGRESOS_EVOLUCION_OPTIONS,
  crearReservasPorMesDataInicial,
  crearReservasPorEstadoDataInicial,
  crearIngresosEvolucionDataInicial,
} from './dashboard-chart.config';
import {
  completarMeses,
  obtenerPaletaDesdeCSS,
  PaletaColores,
} from './dashboard-chart.utils';
import { ReservasTablaComponent } from './reservas-tabla/reservas-tabla.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, ReservasTablaComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  anio: number = 2026;
  exportandoExcel = false;
  exportandoPDF = false;
  private colors: PaletaColores = DEFAULT_COLORS;

  paqueteMasVendido: string | null = null;
  totalReservas = 0;
  ingresosTotales = 0;
  cargandoResumen = true;

  constructor(private dashboardService: DashboardService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.cargarPaletaDesdeCSS();
    this.inicializarDatasets();

    this.cargarReservasPorMes(this.anio);
    this.cargarReservasPorEstado();
    this.cargarIngresosEvolucion();
    this.cargarResumen();
  }

  private cargarPaletaDesdeCSS(): void {
    this.colors = obtenerPaletaDesdeCSS(DEFAULT_COLORS);
  }

  private inicializarDatasets(): void {
    this.reservasPorMesData = {
      ...this.reservasPorMesData,
      datasets: [
        {
          ...this.reservasPorMesData.datasets[0],
          backgroundColor: this.colors.primary,
        },
      ],
    };

    this.reservasPorEstadoData = {
      ...this.reservasPorEstadoData,
      datasets: [
        {
          ...this.reservasPorEstadoData.datasets[0],
          backgroundColor: [
            this.colors.secondary,
            this.colors.primary,
            this.colors.error,
          ],
        },
      ],
    };

    this.ingresosEvolucionData = {
      ...this.ingresosEvolucionData,
      datasets: [
        {
          ...this.ingresosEvolucionData.datasets[0],
          borderColor: this.colors.secondary,
        },
      ],
    };
  }

  reservasPorMesData: ChartData<'bar'> = crearReservasPorMesDataInicial();
  reservasPorMesOptions = RESERVAS_POR_MES_OPTIONS;

  reservasPorEstadoData: ChartData<'pie'> = crearReservasPorEstadoDataInicial();
  reservasPorEstadoOptions = RESERVAS_POR_ESTADO_OPTIONS;

  ingresosEvolucionData: ChartData<'line'> =
    crearIngresosEvolucionDataInicial();
  ingresosEvolucionOptions = INGRESOS_EVOLUCION_OPTIONS;

  private cargarReservasPorMes(anio: number): void {
    this.dashboardService
      .getReservasPorMes(anio)
      .subscribe((data: ReservaPorMes[]) => {
        this.reservasPorMesData = {
          ...this.reservasPorMesData,
          datasets: [
            {
              ...this.reservasPorMesData.datasets[0],
              data: completarMeses(data),
            },
          ],
        };
      });
  }

  private cargarReservasPorEstado(): void {
    this.dashboardService
      .getReservasPorEstado()
      .subscribe((data: ReservaPorEstado[]) => {
        this.reservasPorEstadoData = {
          labels: data.map((d) => d.estado),
          datasets: [
            {
              ...this.reservasPorEstadoData.datasets[0],
              data: data.map((d) => Number(d.cantidad)),
            },
          ],
        };
      });
  }

  private cargarIngresosEvolucion(): void {
    this.dashboardService
      .getIngresosEvolucion()
      .subscribe((data: IngresoEvolucion[]) => {
        this.ingresosEvolucionData = {
          labels: data.map((d) => d.periodo),
          datasets: [
            {
              ...this.ingresosEvolucionData.datasets[0],
              data: data.map((d) => Number(d.total)),
            },
          ],
        };
      });
  }

  private cargarResumen(): void {
    this.cargandoResumen = true;
    this.dashboardService.getResumen().subscribe({
      next: (data: ResumenDashboard) => {
        this.totalReservas = data.totalReservas;
        this.ingresosTotales = Number(data.ingresosTotales);
        this.paqueteMasVendido = data.paqueteMasVendido;
        this.cargandoResumen = false;
      },
      error: () => {
        this.cargandoResumen = false;
      },
    });
  }
  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }
  exportarPDF(): void {
    this.exportandoPDF = true;
    this.dashboardService.exportarPDF(this.anio).subscribe({
      next: (blob) => {
        this.descargarArchivo(blob, `reporte-dashboard-${this.anio}.pdf`);
        this.exportandoPDF = false;
      },
      error: () => {
        this.exportandoPDF = false;
      },
    });
  }

  exportarExcel(): void {
    this.exportandoExcel = true;
    this.dashboardService.exportarExcel(this.anio).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-dashboard-${this.anio}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.exportandoExcel = false;
      },
      error: () => {
        this.exportandoExcel = false;
      },
    });
  }
}
