export interface LoginRequest {
  correoElectronico: string;
  clave: string;
}

export interface AuthResponse {
  token: string;
  rol: string;
}

export interface SignupRequest {
  correoElectronico: string;
  clave: string;
  legajo?: string;
  sede?: string;
  esGerente?: boolean;
  dni?: string;
  nombreCompleto?: string;
  telefono?: string;
}
