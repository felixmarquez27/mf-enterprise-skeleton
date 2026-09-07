import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "design-system";
import i18n from "@/config/i18n";
import { appConfig } from "@/config";

/**
 * Mapea el código de estado HTTP a una llave de traducción en /locales
 */
function getErrorTranslationKey(status?: number): string {
  if (!status) return "networkError";

  switch (status) {
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "notFound";
    case 500:
    case 502:
    case 503:
    case 504:
      return "serverError";
    default:
      return "unexpectedError";
  }
}

/**
 * Manejador global simplificado de errores para React Query
 */
function handleGlobalError(
  error: unknown,
  meta?: Record<string, unknown>,
  queryClient?: QueryClient,
) {
  // Permite silenciar el toast si la mutación/consulta lo indica
  if (meta?.suppressToast) return;

  const status = isAxiosError(error) ? error.response?.status : undefined;

  // 422: Los errores de validación los gestiona el formulario (react-hook-form)
  if (status === 422) return;

  // 401: Sesión expirada o no autorizada
  if (status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    queryClient?.clear();
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.href = "/login";
    }
  }

  // Llave de traducción personalizada desde meta o resuelta por status HTTP
  const errorKey =
    typeof meta?.errorMessageKey === "string"
      ? meta.errorMessageKey
      : getErrorTranslationKey(status);

  toast.error(i18n.t(errorKey));
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            handleGlobalError(error, mutation.meta, queryClient);
          },
        }),
        queryCache: new QueryCache({
          onError: (error, query) => {
            handleGlobalError(error, query.meta, queryClient);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: appConfig.query.staleTime,
            retry: appConfig.query.retry,
            refetchOnWindowFocus: appConfig.query.refetchOnWindowFocus,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
