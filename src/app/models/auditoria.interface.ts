export interface Auditoria {
    id: number;
    usuarioId: number | null;
    correoElectronico: string | null;
    rol: string | null;
    ultimoAcceso: string | null;
    accion: string;
    modelo: string;
    entidadId: number | null;
    metodo: string;
    ruta: string;
    ip: string;
    resultado: string;
    detalle: string | null;
    detalleError: string | null;
    createdAt: string
}

export interface AuditoriaFiltros {
  accion: string[];
  resultado: string[];
  modelo: string[];
  rol: string[];
}