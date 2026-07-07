export interface PaqueteTuristico {
  id?: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  precioBase: number;
  duracionEnDias: number;
  imagen: string;
  estado: string;
  eliminado?: boolean;
}