import { Reserva } from './reserva.interface'

export interface ReservaPorMes {
  mes: string;
  cantidad: string;
}

export interface ReservaPorEstado {
  estado: string;
  cantidad: string;
}

export interface IngresoEvolucion {
  periodo: string;
  total: string;
}

export interface ReservasPaginadas {
  total: number;
  pagina: number;
  totalPaginas: number;
  reservas: Reserva[];
}

export interface ReservasFiltros {
  estado?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface ResumenDashboard {
  totalReservas: number;
  reservasPorEstado: ReservaPorEstado[];
  ingresosTotales: number;
  paqueteMasVendido: string | null;
}
