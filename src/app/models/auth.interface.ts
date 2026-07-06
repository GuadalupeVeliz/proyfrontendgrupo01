export interface LoginRequest {
  correoElectronico: string;
  contrasena: string;
}

export interface AuthResponse {
  token: string;
  rol: string;
}

export interface SignupRequest {
  correoElectronico: string;
  contrasena: string;
  legajo?: string;
  sede?: string;
  esGerente?: boolean;
  dni?: string;
  nombreCompleto?: string;
  telefono?: string;
}
