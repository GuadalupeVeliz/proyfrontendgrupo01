import { PaqueteTuristico } from './paquete.interface';

export interface Vacante {
  id?: number;
  fechaDeSalida: string;
  cupoDisponible: number;
  cupoTotal?: number;
  estado?: string;
  paqueteTuristicoId: number;
  paqueteTuristico?: PaqueteTuristico;
}
