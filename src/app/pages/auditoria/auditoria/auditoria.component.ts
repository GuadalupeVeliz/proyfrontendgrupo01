import { Component, OnInit } from '@angular/core';
import { Auditoria, AuditoriaFiltros } from '../../../models/auditoria.interface';
import { AuditoriaService } from '../../../core/services/auditoria.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auditoria',
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.component.html',
  styleUrl: './auditoria.component.css'
})
export class AuditoriaComponent implements OnInit {
  auditorias: Auditoria[] = [];
  auditoriaSeleccionada: Auditoria | null = null;
  opcionesFiltro: AuditoriaFiltros = {
    accion: [],
    resultado: [],
    modelo: [],
    rol: []
  }
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

  buscar = false;

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

  constructor(
    private auditoriaService: AuditoriaService,
  ) { }

  ngOnInit(): void {
    this.cargarFiltros();
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
    this.buscar = true
  }

  cargarFiltros() {
  this.auditoriaService.getFiltros().subscribe({
    next: (result) => {
      this.opcionesFiltro = result.data;
    },
    error: (error) => {
      console.error(error);
    }
  });
}

  verDetalle(auditoria: Auditoria) {
    this.auditoriaSeleccionada = auditoria;
  }
}
