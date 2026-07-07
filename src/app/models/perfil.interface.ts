export interface PerfilCliente {
  id: number;
  dni: string;
  nombreCompleto: string;
  telefono: string;
}

export interface PerfilEmpleado {
  id: number;
  legajo: string;
  sede: string;
  esGerente: boolean;
}

export interface PerfilUsuario {
  id: number;
  correoElectronico: string;
  ultimoAcceso: string | null;
  eliminado: boolean;
  cliente: PerfilCliente | null;
  empleado: PerfilEmpleado | null;
}

export interface PerfilUpdatePayload {
  correoElectronico?: string;
  nombreCompleto?: string;
  telefono?: string;
  sede?: string;
}
