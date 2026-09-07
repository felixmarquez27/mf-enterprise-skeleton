---
name: frontend-auth-session-pattern
description: "Instructions for managing authentication session flow, JWT token lifecycle, client-side auth hooks, Axios interceptors, and React Router DOM route protection in Microfrontends."
---

# Authentication, Session & Route Protection Pattern (Microfrontends)

This skill documents the end-to-end authentication flow, JWT token management, Axios HTTP interceptor, `react-router-dom` route protection, and client-side auth hooks for the Microfrontend architecture.

---

## 1. Authentication Lifecycle Overview

The frontend communicates with an external REST API backend:

```text
[ React UI (Host / Remote) ]
             │
             ▼ (Llamadas API vía apiClient)
[ Axios Interceptor (host/src/lib/axios.ts) ] ──(Authorization: Bearer <token>)──► [ Backend REST API ]
             │                                                                             │
             ▼ (Fallo 401 Unauthorized capturado por React Query)                          │
[ QueryProvider (Limpieza de Token, Caché, Toast y Redirección a /login) ] ◄───────────────┘
```

1. **Login:** El usuario envía credenciales a `POST /auth/login`. El backend responde con el token JWT y los datos del usuario.
2. **Almacenamiento de Sesión:** El token se almacena en `localStorage` (`"auth_token"`) y los datos del usuario se colocan en la caché de React Query (`authKeys.user()`).
3. **Peticiones Autenticadas:** El interceptor de petición de Axios inyecta automáticamente el encabezado `Authorization: Bearer <token>`.
4. **Expiración de Sesión (401):** Centralizada en `QueryProvider`. Al recibir un `401`, borra el token de `localStorage`, limpia `queryClient.clear()`, dispara el toast traducido (`unauthorized`) y redirige al usuario a `/login`.

---

## 2. Route Protection con `react-router-dom`

En lugar de middlewares de servidor, la protección de rutas se realiza en el cliente mediante **Route Guards** ubicados en `features/auth/components/guards`:

```tsx
// host/src/features/auth/components/guards/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  // Redirige al login guardando la ruta previa para regresar después de autenticar
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
```

### Rutas para Invitados (`GuestRoute.tsx`):
```tsx
// host/src/features/auth/components/guards/GuestRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // Si ya tiene sesión activa, no puede entrar a /login; redirige al dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

### Configuración del Router en el Host (`host/src/App.tsx`):
```tsx
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import QueryProvider from "@/providers/query-provider";
import { Toaster, Loader } from "design-system";
import "design-system/styles.css";

import { ProtectedRoute, GuestRoute } from "./features/auth/components";
import { MainLayout } from "./components/layout";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import NotFoundPage from "./pages/not-found";

const UsersMicrofrontend = lazy(() => import("users/users-app"));

export function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas / solo invitados */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Rutas protegidas dentro del Shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route
                path="/users/*"
                element={
                  <Suspense
                    fallback={
                      <div className="flex h-64 w-full items-center justify-center">
                        <Loader className="size-8 text-primary" />
                      </div>
                    }
                  >
                    <UsersMicrofrontend />
                  </Suspense>
                }
              />
            </Route>
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}
```

---

## 3. Axios Client (`host/src/lib/axios.ts`)

Axios solo mantiene el **interceptor de petición** para inyectar el Bearer token. La gestión de errores y salida de sesión se delega a React Query para evitar colisiones:

```typescript
import axios, { InternalAxiosRequestConfig } from "axios";

const getBaseUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) {
    return import.meta.env.PUBLIC_API_URL as string;
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

// Interceptor de Petición: adjuntar token si existe en storage
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
```

---

## 4. Client Auth Hooks (TanStack Query)

### 1. `useLogin` Hook
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService, authKeys } from "../services";
import { LoginCredentials } from "../types/auth.types";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem("auth_token", data.token);
      }
      if (data?.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
      navigate("/");
    },
  });
}
```

### 2. `useUser` Hook
```typescript
import { useQuery } from "@tanstack/react-query";
import { authService, authKeys } from "../services";

export function useUser() {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authService.me(),
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}
```

### 3. `useLogout` Hook
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../services";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      localStorage.removeItem("auth_token");
      queryClient.clear();
      navigate("/login");
    },
  });
}
```

---

## 5. Sesión en Microfrontends

1. **Host como Autoridad:** El Host valida la sesión antes de montar cualquier microfrontend remoto.
2. **Caché Compartida:** Gracias a que `@tanstack/react-query` es `singleton: true`, los datos del usuario autenticado en `authKeys.user()` están disponibles inmediatamente para cualquier microfrontend remoto sin hacer llamadas HTTP redundantes.

---

## 6. Emulación de Autenticación con Mocks (`mocks/auth.mock.ts`)

Durante el desarrollo frontend o pruebas de integración sin backend conectado, la autenticación se simula mediante una función pura que devuelve una estructura estándar OAuth2 / JWT:

```typescript
// host/src/features/auth/mocks/auth.mock.ts

import { AuthResponse } from "../types/auth.types";

export function getMockAuthResponse(): AuthResponse {
  const mockJwtToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTAwMSIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbS5hciIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcyNTcwMDAwMCwiZXhwIjoxNzU3MjM2MDAwfQ.mock_signature_hash";

  return {
    token_type: "Bearer",
    access_token: mockJwtToken,
    token: mockJwtToken,
    expires_in: 86400,
    refresh_token: "mock_refresh_token_xyz",
    user: {
      id: "usr_1001",
      name: "Administrador Corporativo",
      email: "admin@example.com.ar",
      role: "ADMIN",
    },
  };
}

export default getMockAuthResponse;
```

En `authService`, el método `login` retorna `getMockAuthResponse()` directamente, permitiendo que al desplegar la API real solo se cambie una línea por `await apiClient.post("/auth/login", credentials)` sin alterar los hooks ni los componentes de login.

---

## 7. Arquitectura de Seguridad: Cookies `HttpOnly` vs `localStorage`

- **En Desarrollo Frontend / Emulación:**  
  El token JWT se almacena temporalmente en `localStorage` (`"auth_token"`). Esto es necesario porque JavaScript en el cliente **no tiene permisos** para crear o configurar cookies con la bandera `HttpOnly`.
- **En Producción con Backend Real:**  
  1. El servidor de autenticación es el único que puede y debe emitir la cookie a través del encabezado HTTP:
     ```http
     Set-Cookie: auth_token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/
     ```
  2. Al estar configurado `withCredentials: true` en la instancia central de Axios (`host/src/lib/axios.ts`), el navegador adjunta automáticamente la cookie en todas las peticiones hacia el backend sin requerir manipulación manual ni exposición en `localStorage`.

