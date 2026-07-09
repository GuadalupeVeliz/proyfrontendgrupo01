import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaqueteService } from '../../../core/services/paquete.service';
import { PaqueteTuristico } from '../../../models/paquete.interface';
import { RouterLink } from '@angular/router';
import { TraductorService } from '../../../core/services/traductor.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule,RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  busqueda = '';
  paquetes: PaqueteTuristico[] = [];

  constructor(
    private paqueteService: PaqueteService,
    private idiomaService: TraductorService
  ) {}

  ngOnInit(): void {
    this.idiomaService.idioma$.subscribe(lang => {
    this.getPaquetes(lang);
  });
  }

  getPaquetes(lang:string): void {
    this.paqueteService.getPaquetes(lang).subscribe({
      next: (respuesta: any) => {
        console.log(respuesta);
        this.paquetes = respuesta.data;
      },
      error: (error) => {
        console.error('Error al obtener paquetes turísticos', error);
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
  verFechas(id: number) {
    console.log('Paquete seleccionado:', id);
  }
}