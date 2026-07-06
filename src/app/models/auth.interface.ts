export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    rol: string;
  };
}

export interface LoginRequest {
  correoElectronico: string;
  clave: string;
}

export interface SignupRequest {
  correoElectronico: string;
  clave: string;
  dni?: string;
  nombreCompleto?: string;
  telefono?: string;
  legajo?: string;
  sede?: 'central' | 'sucursal';
  esGerente?: boolean;
}