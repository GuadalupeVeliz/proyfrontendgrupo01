import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { VacanteService } from '../../core/services/vacante.service';
import { Vacante } from '../../models/vacante.interface';
import { ReservaRequest } from '../../models/reserva.interface';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../core/services/reserva.service';

@Component({
  selector: 'app-vacantes',
  imports: [RouterLink, FormsModule],
  templateUrl: './vacantes.component.html',
  styleUrl: './vacantes.component.css',
})
export class VacantesComponent implements OnInit {
  paqueteId!: number;
  paquete: any = null;
  vacantes: any[] = [];
  vacanteSeleccionada: any;

  reservaModel: ReservaRequest = {
    fechaDeReservacion: '',
    cantidadDePersonas: 1,
    clienteId: Number(localStorage.getItem('idCliente')),
    vacanteId: 0
  };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vacanteService: VacanteService,
    public authService: AuthService,
    private reservaService: ReservaService,
  ) { }

  ngOnInit(): void {
    this.paqueteId = Number(this.route.snapshot.paramMap.get('id'));
    this.getVacantes();
  }

  getVacantes(): void {
    this.vacanteService.getVacantes().subscribe({
      next: (respuesta: any) => {
        this.vacantes = respuesta.data.filter(
          (vacante: any) => vacante.paqueteTuristicoId === this.paqueteId
        );

        this.paquete = this.vacantes[0]?.paqueteTuristico;
      },
      error: (error) => {
        console.error('Error al obtener vacantes', error);
      },
    });
  }

  seleccionarVacante(vacante : Vacante) {
    this.vacanteSeleccionada=vacante;
    this.reservaModel.fechaDeReservacion= vacante.fechaDeSalida;
    this.reservaModel.vacanteId = Number(vacante.id)
    console.log(vacante)
  }

  registrarReserva(): void {
    console.log(this.reservaModel)
    this.reservaService.createReserva(this.reservaModel).subscribe({
      next: () => {
        (document.getElementById('btnCancelarModal') as HTMLButtonElement).click();
        this.router.navigate([`/`]);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  aumentarCantidad(): void {
    if (
      this.vacanteSeleccionada &&
      this.reservaModel.cantidadDePersonas < this.vacanteSeleccionada.cupoDisponible
    ) {
      this.reservaModel.cantidadDePersonas++;
    }
  }

  disminuirCantidad(): void {
    if (this.reservaModel.cantidadDePersonas > 1) {
      this.reservaModel.cantidadDePersonas--;
    }
  }
}