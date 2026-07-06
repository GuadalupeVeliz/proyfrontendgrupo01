export interface Cliente {
  id?: number;
  dni: string;
  nombreCompleto: string;
  telefono: string;
  eliminado?: boolean;
  usuarioId?: number;
  createdAt?: string;
  updatedAt?: string;
}
