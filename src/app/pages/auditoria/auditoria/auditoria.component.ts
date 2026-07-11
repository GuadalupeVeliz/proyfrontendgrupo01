import { Component, OnInit } from '@angular/core';
import { Auditoria } from '../../../models/auditoria.interface';
import { AuditoriaService } from '../../../core/services/auditoria.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auditoria',
  imports: [CommonModule,FormsModule],
  templateUrl: './auditoria.component.html',
  styleUrl: './auditoria.component.css'
})
export class AuditoriaComponent implements OnInit{
  auditorias : Auditoria[] = [] ;
  auditoriaSeleccionada: Auditoria | null = null;
  filtros = {
    usuarioId: '',
    accion: '',
    rol: '',
    metodo: '',
    modelo: '',
    resultado: '',
    fechaDesde: '',
    fechaHasta: ''
  };

  buscar=false;

  limpiarFiltros() {
  this.filtros = {
    usuarioId: '',
    accion: '',
    rol: '',
    metodo: '',
    modelo: '',
    resultado: '',
    fechaDesde: '',
    fechaHasta: ''
  };

  this.buscarAuditorias();
}

  constructor (
    private auditoriaService : AuditoriaService,
  ) {}

  ngOnInit(): void {
    
  }

  buscarAuditorias() {
    this.auditoriaService.getAuditorias(this.filtros).subscribe({
      next: (result) => {
        this.auditorias = result.data;
        console.log(result.data)
      },
      error: (error) => {
        console.error(error);
      }
    })
    this.buscar=true
  }

  verDetalle(auditoria: Auditoria) {
  this.auditoriaSeleccionada = auditoria;
}
}
