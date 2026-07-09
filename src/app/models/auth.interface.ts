/** Forma genérica de respuesta de la API: { success, data } */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    rol: string;
    correo: string;
    clienteId?: number | null;
    empleadoId?: number | null;
    usuario?: unknown;
  };
}

export interface GoogleSigninResponse {
  success: boolean;
  data: {
    token: string;
    rol: string;
    correo: string;
    clienteId?: number | null;
    empleadoId?: number | null;
  };
}

export interface GoogleSignupResponse {
  success: boolean;
  data: {
    tempToken: string;
    email: string;
    name: string;
    picture: string;
  };
}

export interface LoginRequest {
  correoElectronico: string;
  clave: string;
}

export interface SignupRequest {
  correoElectronico: string;
  clave?: string;
  dni?: string;
  nombreCompleto?: string;
  telefono?: string;
  legajo?: string;
  sede?: 'central' | 'sucursal';
  esGerente?: boolean;
  token?: string;
}

export interface Usuario {
  correo: string;
  rol: string;
  clienteId?: number | null;
  empleadoId?: number | null;
}