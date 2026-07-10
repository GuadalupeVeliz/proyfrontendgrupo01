export interface PaqueteTuristico {
  id?: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  precioBase: number;
  duracionEnDias: number;
  imagenes: string[];
  incluye: string[];
  noIncluye: string[];
  hotel?: string | null;
  puntoDeSalida: string;
  recomendaciones: string[];
  dificultad: 'baja' | 'media' | 'alta';
  estado: string;
  eliminado?: boolean;
}
