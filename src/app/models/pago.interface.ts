export type MetodoPago = 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA';
export type EstadoPago = 'pagado' | 'pendiente' | 'cancelado';

export interface Pago {
  id?: number;
  fecha?: string;
  monto: number;
  metodoPago: MetodoPago;
  estado?: EstadoPago;
  eliminado?: boolean;
  reservaId: number;
}

export interface PagoResponse {
  success: boolean;
  data: {
    init_point: string;
  };
}