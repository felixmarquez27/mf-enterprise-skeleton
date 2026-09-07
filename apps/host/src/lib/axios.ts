import axios, { InternalAxiosRequestConfig } from "axios";

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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: string | null;
}

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

export default apiClient;
