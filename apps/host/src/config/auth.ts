/**
 * Configuraciones generales de autenticación para el BFF de Next.js y cliente.
 */
export const authConfig = {
  /** Nombre de la cookie para almacenar el token JWT de acceso */
  cookieName: "auth_token",

  /** Nombre de la cookie para almacenar el token de refresco (si aplica) */
  refreshTokenCookieName: "refresh_token",

  /** Duración de la cookie del token en segundos (Ej: 7 días = 604,800 segundos) */
  tokenMaxAge: 60 * 60 * 24 * 7,

  /** Duración del refresco del token en segundos (Ej: 30 días = 2,592,000 segundos) */
  refreshTokenMaxAge: 60 * 60 * 24 * 30,
};
