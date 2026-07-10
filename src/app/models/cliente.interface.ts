export interface Cliente {
  id?: number;
  dni: string;
  nombreCompleto: string;
  telefono: string;
  eliminado?: boolean;
  usuarioId?: number;
  usuario?: {
    correoElectronico?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
