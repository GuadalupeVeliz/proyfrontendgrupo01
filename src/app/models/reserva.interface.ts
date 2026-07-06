import { Cliente } from './cliente.interface';
import { Vacante } from './vacante.interface';

export interface Reserva {
  id?: number;
  fechaDeReservacion: string;
  cantidadDePersonas: number;
  montoPagado?: number | null;
  estado?: 'pendiente' | 'confirmada' | 'cancelada';
  eliminado?: boolean;
  clienteId: number;
  vacanteId: number;
  cliente?: Cliente;
  vacante?: Vacante;
  createdAt?: string;
  updatedAt?: string;
}
