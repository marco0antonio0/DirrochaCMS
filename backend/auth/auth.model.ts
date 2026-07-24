export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export interface AuthVisibility {
  loginEnabled: boolean;
  registerEnabled: boolean;
  logoutEnabled: boolean;
}

export interface AuthTokenResponse {
  message: string;
  token: string;
}
