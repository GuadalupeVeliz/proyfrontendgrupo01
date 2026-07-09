export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    rol: string;
    clienteId?: string | number | null;
    empleadoId?: string | number | null;
  };
}

export interface GoogleSigninResponse {
  success: boolean;
  data: {
    token: string;
    rol: string;
    correo: string;
    clienteId?: string;
    empleadoId?: string;
  };
}

export interface GoogleSignupResponse {
  name: string;
  email: string;
  picture_url: string;
  token: string;
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
  token?: string;
}
