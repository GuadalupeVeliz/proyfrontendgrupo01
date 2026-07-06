export type TipoComprobante = 'reserva' | 'cancelacion';

export interface Comprobante {
  id?: number;
  numero: string;
  fechaDeEmision?: string;
  tipo?: TipoComprobante;
  eliminado?: boolean;
  reservaId: number;
  createdAt?: string;
  updatedAt?: string;
}
