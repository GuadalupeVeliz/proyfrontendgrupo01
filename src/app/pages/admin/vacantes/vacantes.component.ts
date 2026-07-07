import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { VacanteService } from '../../../core/services/vacante.service';
import { Vacante } from '../../../models/vacante.interface';
import { AdminPageHeaderComponent } from '../../../shared/components/admin-page-header/admin-page-header.component';
import { AdminToolbarComponent } from '../../../shared/components/admin-toolbar/admin-toolbar.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ManagementCardComponent } from '../../../shared/components/management-card/management-card.component';

@Component({
  selector: 'app-vacantes',
  imports: [
    DatePipe,
    AdminPageHeaderComponent,
    AdminToolbarComponent,
    ManagementCardComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './vacantes.component.html',
  styleUrl: './vacantes.component.css',
})
export class VacantesComponent implements OnInit {
  busqueda = '';
  vacantes: Vacante[] = [];
  mostrarConfirmacion = false;
  vacanteAEliminar: Vacante | null = null;

  constructor(
    private vacanteService: VacanteService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getVacantes();
  }

  get esGerente(): boolean {
    return this.authService.getRol() === 'Gerente';
  }

  get esRecepcionista(): boolean {
    return this.authService.getRol() === 'Recepcionista';
  }

  getVacantes(): void {
    this.vacanteService.getVacantes().subscribe({
      next: (respuesta) => {
        this.vacantes = respuesta.data;
      },
      error: (error) => {
        console.error('Error al obtener vacantes', error);
        this.toastService.error('No se pudieron obtener las vacantes');
      },
    });
  }

  get vacantesFiltradas(): Vacante[] {
    const texto = this.busqueda.toLowerCase().trim();

    if (!texto) {
      return this.vacantes;
    }

    return this.vacantes.filter((vacante) =>
      this.obtenerNombrePaquete(vacante).toLowerCase().includes(texto) ||
      this.obtenerEstado(vacante).toLowerCase().includes(texto) ||
      vacante.fechaDeSalida.toLowerCase().includes(texto)
    );
  }

  editarVacante(vacante: Vacante): void {
    this.router.navigate(['/admin/vacantes/editar', vacante.id]);
  }

  eliminarVacante(vacante: Vacante): void {
    this.vacanteAEliminar = vacante;
    this.mostrarConfirmacion = true;
  }

  reservarVacante(vacante: Vacante): void {
    this.router.navigate(['/admin/reservas'], {
      queryParams: { vacanteId: vacante.id },
    });
  }

  cancelarEliminacion(): void {
    this.mostrarConfirmacion = false;
    this.vacanteAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.vacanteAEliminar?.id) return;

    this.vacanteService.deleteVacante(this.vacanteAEliminar.id).subscribe({
      next: () => {
        this.toastService.success('Vacante eliminada correctamente');
        this.getVacantes();
        this.cancelarEliminacion();
      },
      error: () => {
        this.toastService.error('No se pudo eliminar la vacante');
      },
    });
  }

  obtenerNombrePaquete(vacante: Vacante | null): string {
    return vacante?.paqueteTuristico?.nombre ?? 'Paquete turistico';
  }

  obtenerCupos(vacante: Vacante): string {
    const cupoTotal = vacante.cupoTotal ?? vacante.cupoDisponible;
    return `${vacante.cupoDisponible} / ${cupoTotal} lugares disponibles`;
  }

  obtenerEstado(vacante: Vacante): string {
    if (vacante.estado) {
      return vacante.estado;
    }

    return vacante.cupoDisponible > 0 ? 'Disponible' : 'Completa';
  }
}
