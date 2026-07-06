import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { VacanteService } from '../../core/services/vacante.service';

@Component({
  selector: 'app-vacantes',
  imports: [RouterLink],
  templateUrl: './vacantes.component.html',
  styleUrl: './vacantes.component.css',
})
export class VacantesComponent implements OnInit {
  paqueteId!: number;
  paquete: any = null;
  vacantes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private vacanteService: VacanteService,
    public authService: AuthService
  ) {}

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
}