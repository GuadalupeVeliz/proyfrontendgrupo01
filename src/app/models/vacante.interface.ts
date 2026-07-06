import { PaqueteTuristico } from './paquete.interface';

export interface Vacante {
  id?: number;
  fechaDeSalida: string;
  cupoTotal: number;
  cupoDisponible?: number;
  estado?: 'disponible' | 'no_disponible';
  eliminado?: boolean;
  paqueteTuristicoId: number;
  paqueteTuristico?: PaqueteTuristico;
  createdAt?: string;
  updatedAt?: string;
}
