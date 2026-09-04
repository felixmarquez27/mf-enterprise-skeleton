---
name: frontend-auth-session-pattern
description: "Instructions for managing authentication session flow, JWT token lifecycle, client-side auth hooks, Axios interceptors, and React Router DOM route protection in Microfrontends."
---

# Authentication, Session & Route Protection Pattern (Microfrontends)

This skill documents the end-to-end authentication flow, JWT token management, Axios HTTP interceptors, `react-router-dom` route protection, and client-side auth hooks for the Microfrontend architecture.

---

## 1. Authentication Lifecycle Overview

The frontend communicates with an external REST API backend:

```text
[ React UI (Host / Remote) ]
             │
             ▼ (Llamadas API vía apiClient)
[ Axios Interceptor (apiClient) ] ──(Authorization: Bearer <token> o HttpOnly Cookie)──► [ Backend REST API ]
             │                                                                                  │
             ▼ (Respuesta 401 Unauthorized)                                                      │
[ Refresh Token Flow / Redirección /login ] ◄────────────────────────────────────────────────────┘
```

1. **Login:** El usuario envía credenciales a `POST /auth/login`. El backend responde con el token JWT (o setea cookie HttpOnly) y los datos del usuario/permisos.
2. **Almacenamiento de Sesión:** El token se almacena en memoria / cookie segura y se sincroniza en el estado global (`useAuth`).
3. **Peticiones Autenticadas:** El interceptor de Axios inyecta automáticamente el encabezado `Authorization: Bearer <token>` (o `withCredentials: true` para cookies).
4. **Expiración de Token (401):** El interceptor detecta el 401, intenta renovar el token en `POST /auth/refresh` y, si falla, invalida la sesión y redirige al usuario a `/login`.

---

## 2. Route Protection con `react-router-dom`

En lugar de middlewares de servidor (como `proxy.ts`), la protección de rutas se realiza en el cliente mediante **Route Guards**:

```tsx
// host/src/components/guards/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Cargando sesión...</div>;
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
// host/src/components/guards/GuestRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/guards/ProtectedRoute";
import { GuestRoute } from "./components/guards/GuestRoute";
import { MainLayout } from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import UsersMicrofrontend from "users/users-app";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas / solo invitados */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Rutas protegidas dentro del Shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            {/* El microfrontend de usuarios maneja sus sub-rutas */}
            <Route path="/users/*" element={<UsersMicrofrontend />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 3. Axios Client con Interceptors (`lib/apiClient.ts`)

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const apiClient = axios.create({
  baseURL: process.env.PUBLIC_API_URL || "https://api.tu-backend.com/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor de Petición: adjuntar token si existe en storage/memoria
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuesta: manejar expiración de sesión (401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Limpiar sesión local y redirigir
      localStorage.removeItem("auth_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 4. Client Auth Hooks (TanStack Query + `react-router-dom`)

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
    onSuccess: (response) => {
      // Guardar token e hidratar la caché del usuario
      localStorage.setItem("auth_token", response.data.token);
      queryClient.setQueryData(authKeys.user(), response.data.user);
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
  const token = localStorage.getItem("auth_token");

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
2. **Caché Compartida:** Gracias a que `@tanstack/react-query` es `singleton: true`, los datos del usuario autenticado en `authKeys.user()` están disponibles inmediatamente para cualquier microfrontend remoto sin hacer llamadas redundantes.
