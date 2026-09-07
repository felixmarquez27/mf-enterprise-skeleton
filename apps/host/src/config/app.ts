/**
 * Configuraciones generales de la aplicación, proveedores (providers) y cliente.
 * Diseñado de forma extensible para agrupar distintas opciones globales.
 */
export const appConfig = {
  /**
   * Configuración de TanStack Query (React Query)
   */
  query: {
    /** Tiempo en milisegundos que los datos se consideran frescos (1 minuto) */
    staleTime: 60 * 1000,
    /** Número de reintentos automáticos al fallar una consulta */
    retry: 1,
    /** Controla si se re-evalúan las consultas al enfocar la ventana */
    refetchOnWindowFocus: false,
  },

  /**
   * Configuración de peticiones API y cliente HTTP
   */
  api: {
    /** Tiempo máximo de espera para peticiones HTTP en milisegundos (10 segundos) */
    timeout: 10000,
  },

  /**
   * Configuración de interfaz de usuario y componentes visuales globales
   */
  ui: {
    /** Duración por defecto de las notificaciones toast (4 segundos) */
    toastDuration: 4000,
  },
};

export type AppConfig = typeof appConfig;
