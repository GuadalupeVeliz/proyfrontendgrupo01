import { PaqueteTuristico } from './paquete.interface';

export type VacanteEstado = 'disponible' | 'no_disponible';

export interface Vacante {
  id?: number;
  fechaDeSalida: string;
  cupoDisponible: number;
  cupoTotal?: number;
  estado?: VacanteEstado;
  eliminado?: boolean;
  paqueteTuristicoId: number;
  paqueteTuristico?: PaqueteTuristico;
  createdAt?: string;
  updatedAt?: string;
}
