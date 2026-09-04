import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const getBaseUrl = (): string => {
  // Soporte para entornos modernos de empaquetado como Rsbuild / Vite
  if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) {
    return import.meta.env.PUBLIC_API_URL as string;
  }
  // Fallback seguro si process existe (Node / SSR) sin lanzar ReferenceError en el navegador
  if (typeof process !== "undefined" && process.env?.PUBLIC_API_URL) {
    return process.env.PUBLIC_API_URL;
  }
  return "https://api.ejemplo.com/v1";
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor de Petición: adjuntar token Bearer si existe en localStorage
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor de Respuesta: manejar expiración de sesión (401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
