import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { PaqueteService } from '../../../core/services/paquete.service';
import { ManagementCardComponent } from '../../../shared/components/management-card/management-card.component';
import { Router } from '@angular/router';
import { PaqueteTuristico } from '../../../models/paquete.interface';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../../core/services/toast.service';
import { AdminPageHeaderComponent } from '../../../shared/components/admin-page-header/admin-page-header.component';
import { AdminToolbarComponent } from '../../../shared/components/admin-toolbar/admin-toolbar.component';

@Component({
  selector: 'app-paquetes',
  imports: [
    AdminPageHeaderComponent,
    AdminToolbarComponent,
    ManagementCardComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './paquetes.component.html',
  styleUrls: ['./paquetes.component.css'],
})
export class PaquetesComponent implements OnInit {
  busqueda = '';
  paquetes: PaqueteTuristico[] = [];
  mostrarConfirmacion = false;
  paqueteAEliminar: PaqueteTuristico | null = null;

  constructor(
    private paqueteService: PaqueteService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}
  ngOnInit(): void {
    this.getPaquetes();
  }

  get esGerente(): boolean {
    return this.authService.getRol() === 'Gerente';
  }

  getPaquetes(): void {
    this.paqueteService.getPaquetes().subscribe({
      next: (respuesta) => {
        this.paquetes = respuesta.data;
      },
      error: (error) => {
        console.error('Error al obtener paquetes', error);
      },
    });
  }

  get paquetesFiltrados(): PaqueteTuristico[] {
    const texto = this.busqueda.toLowerCase().trim();

    if (!texto) {
      return this.paquetes;
    }

    return this.paquetes.filter(
      (paquete) =>
        paquete.nombre.toLowerCase().includes(texto) ||
        paquete.ubicacion.toLowerCase().includes(texto)
    );
  }

  seleccionarPaquete(paquete: PaqueteTuristico): void {
    this.router.navigate(['/vacantes', paquete.id]);
  }

  editarPaquete(paquete: PaqueteTuristico): void {
    this.router.navigate(['/admin/paquetes/editar', paquete.id]);
  }

  eliminarPaquete(paquete: PaqueteTuristico): void {
    this.paqueteAEliminar = paquete;
    this.mostrarConfirmacion = true;
  }

  cancelarEliminacion(): void {
    this.mostrarConfirmacion = false;
    this.paqueteAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.paqueteAEliminar?.id) return;

    this.paqueteService.deletePaquete(this.paqueteAEliminar.id).subscribe({
      next: () => {
        this.toastService.success('Paquete eliminado correctamente');
        this.getPaquetes();
        this.cancelarEliminacion();
      },
      error: () => {
        this.toastService.error('No se pudo eliminar el paquete');
      },
    });
  }
}
