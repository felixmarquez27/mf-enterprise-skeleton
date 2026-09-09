import { AuthResponse } from "../types/auth.types";

/**
 * Función que simula la respuesta de un servidor de autenticación
 * con propiedades estándar de OAuth2 / JWT hardcodeadas.
 */
export function getMockAuthResponse(): AuthResponse {
  const mockJwtToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTAwMSIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIENsYXJvIiwiZW1haWwiOiJhZG1pbkBjbGFyby5jb20uYXIiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MjU3MDAwMDAsImV4cCI6MTc1NzIzNjAwMH0.mock_signature_hash";

  return {
    token_type: "Bearer",
    access_token: mockJwtToken,
    token: mockJwtToken,
    expires_in: 86400,
    refresh_token: "mock_refresh_token_xyz",
    user: {
      id: "usr_1001",
      name: "Administrador",
      email: "admin@example.com",
      role: "ADMIN",
    },
  };
}

export default getMockAuthResponse;
