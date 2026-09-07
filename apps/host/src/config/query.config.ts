/**
 * Tiempos de frescura (staleTime) estandarizados para TanStack Query (en milisegundos).
 * Centraliza la configuración de la caché para evitar números mágicos en los hooks.
 */
export const STALE_TIME = {
  /** 0ms - Datos ultra dinámicos que cambian constantemente (notificaciones, chat) */
  INSTANT: 0,

  /** 10 segundos - Listas de refresco rápido */
  FAST: 1000 * 10,

  /** 1 minuto - Tablas y listados estándar de la app (usuarios, roles) */
  STANDARD: 1000 * 60 * 1,

  /** 5 minutos - Perfil de usuario, permisos, tokens de reseteo y Manifest de sesión */
  SESSION: 1000 * 60 * 5,

  /** 1 hora - Catálogos estáticos (países, idiomas, configuraciones) */
  STATIC: 1000 * 60 * 60,

  /** 24 horas - Datos inmutables */
  LONG: 1000 * 60 * 60 * 24,

  /** Infinito - Consultas de ejecución única inmutables (ej. verificación de correo) */
  NEVER: Infinity,
} as const;

export type StaleTimePreset = keyof typeof STALE_TIME;
