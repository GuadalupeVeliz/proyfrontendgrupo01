import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PerfilService } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { PerfilUsuario } from '../../models/perfil.interface';

@Component({
  selector: 'app-perfil',
  imports: [DatePipe],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  perfil: PerfilUsuario | null = null;
  cargando = true;

  constructor(
    private router: Router,
    private perfilService: PerfilService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;

    this.perfilService.getPerfil().subscribe({
      next: (respuesta) => {
        this.perfil = respuesta.data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar perfil', error);
        this.cargando = false;
        this.toastService.error('No se pudo cargar el perfil.');
      },
    });
  }

  editarPerfil(): void {
    this.router.navigate(['/perfil/editar']);
  }

  get nombreVisible(): string {
    if (this.perfil?.cliente) {
      return this.perfil.cliente.nombreCompleto;
    }

    if (this.perfil?.empleado) {
      return `Legajo ${this.perfil.empleado.legajo}`;
    }

    return this.perfil?.correoElectronico ?? 'Usuario';
  }

  get rolVisible(): string {
    if (this.perfil?.cliente) {
      return 'Cliente';
    }

    if (this.perfil?.empleado?.esGerente) {
      return 'Gerente';
    }

    if (this.perfil?.empleado) {
      return 'Recepcionista';
    }

    return 'Usuario';
  }

  get ultimoAccesoVisible(): string | null {
    return this.perfil?.ultimoAcceso ?? null;
  }
}
