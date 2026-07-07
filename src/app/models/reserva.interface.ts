import { PaqueteTuristico } from './paquete.interface';

export type ReservaEstado = 'pendiente' | 'confirmada' | 'cancelada' | 'check_in' | 'check_out';

export interface ClienteReserva {
  id?: number;
  dni: string;
  nombreCompleto: string;
  telefono?: string;
  correoElectronico?: string;
}

export interface VacanteReserva {
  id?: number;
  fechaDeSalida: string;
  cupoTotal?: number;
  cupoDisponible?: number;
  paqueteTuristicoId?: number;
  paqueteTuristico?: PaqueteTuristico;
}

export interface Reserva {
  id?: number;
  clienteId: number;
  vacanteId: number;
  fechaDeReservacion: string;
  cantidadDePersonas: number;
  montoPagado?: number | string | null;
  estado: ReservaEstado;
  cliente?: ClienteReserva;
  vacante?: VacanteReserva;
  paqueteTuristico?: PaqueteTuristico;
}
