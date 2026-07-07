export type SedeEmpleado = 'central' | 'sucursal';

export interface Empleado {
  id?: number;
  legajo: string;
  sede: SedeEmpleado;
  esGerente: boolean;
  eliminado: boolean;
  usuarioId?: number;
}
