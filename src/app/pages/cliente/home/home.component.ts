import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaqueteService } from '../../../core/services/paquete.service';
import { PaqueteTuristico } from '../../../models/paquete.interface';
import { RouterLink } from '@angular/router';
import { TraductorService } from '../../../core/services/traductor.service';
import { environment } from '../../../../environments/environment';
import { VacanteService } from '../../../core/services/vacante.service';
import { Vacante } from '../../../models/vacante.interface';
import { Subject, takeUntil } from 'rxjs';

interface BeneficioHome {
  icono: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-home',
  imports: [FormsModule,RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  busqueda = '';
  paquetes: PaqueteTuristico[] = [];
  vacantes: Vacante[] = [];
  readonly beneficios: BeneficioHome[] = [
    {
      icono: 'bi bi-person-heart',
      titulo: 'Atencion personalizada',
      descripcion: 'Te ayudamos a elegir el viaje ideal para tu forma de viajar.',
    },
    {
      icono: 'bi bi-bus-front',
      titulo: 'Salidas programadas',
      descripcion: 'Fechas organizadas para que puedas reservar con claridad.',
    },
    {
      icono: 'bi bi-shield-check',
      titulo: 'Viajes seguros',
      descripcion: 'Paquetes pensados para que disfrutes cada destino con tranquilidad.',
    },
    {
      icono: 'bi bi-credit-card',
      titulo: 'Reserva simple',
      descripcion: 'Elegis fecha, cantidad de personas y confirmas en pocos pasos.',
    },
  ];

  private readonly destroy$ = new Subject<void>();
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/api\/v\d+\/?$/, '');

  constructor(
    private paqueteService: PaqueteService,
    private idiomaService: TraductorService,
    private vacanteService: VacanteService,
  ) {}

  ngOnInit(): void {
    this.idiomaService.idioma$.pipe(takeUntil(this.destroy$)).subscribe(lang => {
      this.getPaquetes(lang);
    });
    this.getVacantes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPaquetes(lang:string): void {
    this.paqueteService.getPaquetes(lang).subscribe({
      next: (respuesta) => {
        this.paquetes = respuesta.data;
      },
      error: (error) => {
        console.error('Error al obtener paquetes turísticos', error);
      },
    });
  }

  getVacantes(): void {
    this.vacanteService.getVacantes().subscribe({
      next: (respuesta) => {
        this.vacantes = respuesta.data;
      },
      error: (error) => {
        console.error('Error al obtener vacantes', error);
      },
    });
  }

  get paquetesFiltrados() {
    const texto = this.busqueda.toLowerCase().trim();

    if (!texto) {
      return this.paquetes;
    }

    return this.paquetes.filter((paquete) =>
      paquete.nombre.toLowerCase().includes(texto) ||
      paquete.ubicacion.toLowerCase().includes(texto)
    );
  }

  get proximasSalidas(): Vacante[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.vacantes
      .filter((vacante) => {
        const fecha = new Date(vacante.fechaDeSalida);
        fecha.setHours(0, 0, 0, 0);

        return (
          fecha >= hoy &&
          vacante.cupoDisponible > 0 &&
          !vacante.eliminado &&
          (vacante.estado ?? 'disponible') === 'disponible'
        );
      })
      .sort(
        (primera, segunda) =>
          new Date(primera.fechaDeSalida).getTime() -
          new Date(segunda.fechaDeSalida).getTime(),
      )
      .slice(0, 4);
  }

  get destinosPopulares(): PaqueteTuristico[] {
    return this.paquetes.slice(0, 6);
  }

  obtenerImagenPrincipal(paquete: PaqueteTuristico): string | null {
    const imagen = paquete.imagenes?.[0];

    if (!imagen) {
      return null;
    }

    if (/^(https?:|data:)/.test(imagen)) {
      return imagen;
    }

    return `${this.apiBaseUrl}${imagen.startsWith('/') ? '' : '/'}${imagen}`;
  }

  obtenerPaqueteDeVacante(vacante: Vacante): PaqueteTuristico | undefined {
    return (
      vacante.paqueteTuristico ??
      this.paquetes.find((paquete) => paquete.id === vacante.paqueteTuristicoId)
    );
  }

  obtenerNombrePaquete(vacante: Vacante): string {
    return this.obtenerPaqueteDeVacante(vacante)?.nombre ?? 'Paquete turistico';
  }

  obtenerPaqueteId(vacante: Vacante): number {
    return this.obtenerPaqueteDeVacante(vacante)?.id ?? vacante.paqueteTuristicoId;
  }

  scrollACatalogo(): void {
    document.getElementById('paquetes-destacados')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
