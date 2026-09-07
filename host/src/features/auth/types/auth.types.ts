export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  access_token?: string;
  token_type?: "Bearer" | string;
  expires_in?: number;
  refresh_token?: string;
  user: User;
}
