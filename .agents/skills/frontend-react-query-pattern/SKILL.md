---
name: frontend-react-query-pattern
description: "Instructions for managing asynchronous server state, API services, query key factories, custom data-fetching queries, and mutation cache invalidation with TanStack Query in Microfrontends."
---

# TanStack Query (React Query) & Data Layer Pattern (Microfrontends)

This skill defines the architecture and standards for managing **Server State**, **REST API Data Fetching**, **Query Key Factories**, **Global Error Handling with i18n**, and **Cache Invalidation** using TanStack Query v5 in a Microfrontend architecture.

---

## 1. Core Architectural Layers

Data fetching strictly decouples UI components from HTTP communication through a 4-layer architecture:

```text
[ React Component ]
       │
       ▼
[ Custom Hook ] ────────► (useQuery / useMutation)
       │                        │
       ▼                        ▼
[ API Service Object ]   [ Query Key Factory ]
       │                        │
       ▼                        ▼
[ Axios Client (axios.ts) ] ──► [ TanStack Query Cache (Shared Singleton) ]
       │
       ▼
[ External REST API (https://api.backend.com/...) ]
```

### Layer Responsibilities:
1. **Query Key Factory (`<feature>.keys.ts`)**: Defines strongly-typed, immutable `as const` cache key tuples for precise cache invalidation across microfrontends.
2. **API Service (`<feature>.services.ts`)**: Pure async methods that call `apiClient` endpoints and unwrap `response.data`. Contains zero React state or hooks.
3. **Custom Hooks (`use<Entity>.ts`, `useCreate<Entity>.ts`)**: Wraps `useQuery` or `useMutation`. Connects services to the cache, manages stale time, options, and query invalidation.
4. **React Components**: Consumes custom hooks. Focuses strictly on UI rendering, loading states (`isLoading`, `isPending`), and user interactions.

---

## 2. Reglas de Module Federation para TanStack Query

Para que la caché de React Query funcione a través de todos los microfrontends sin errores de contexto:

1. **Singleton Obligatorio:** En `rsbuild.config.ts` (tanto en `host` como en todos los remotes):
   ```typescript
   shared: {
     "@tanstack/react-query": {
       singleton: true,
       requiredVersion: dependencies["@tanstack/react-query"],
     },
   }
   ```
2. **Provider Centralizado en el Host (`QueryProvider`):** El Host envuelve la aplicación con `<QueryProvider>` (`host/src/providers/query-provider.tsx`), que inicializa `QueryClient` y define el manejo global de errores.
3. **Remotes Heredan la Caché:** Como la librería es un singleton, cualquier hook `useQuery` ejecutado dentro de un microfrontend remoto (`users`) accede a la misma instancia de caché provista por el Host.
4. **Invalidaciones Cruzadas:** El Host o cualquier Remote puede invalidar claves (`queryClient.invalidateQueries({ queryKey: usersKeys.all })`) y todos los componentes montados en pantalla se refrescarán reactivamente.

---

## 3. Global Error Handling & i18n Translation Mapping

El Host intercepta todos los fallos globales de consultas (`QueryCache`) y mutaciones (`MutationCache`) dentro de `QueryProvider`, mapeando los códigos de estado HTTP a simples **llaves de traducción de `/locales`** (`common.json`):

```tsx
// host/src/providers/query-provider.tsx
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
```

### Reglas del Manejador Global:
1. **Error 422 (Validaciones):** Se omite el toast global para permitir que los formularios gestionados por `react-hook-form` muestren los errores en cada campo.
2. **Error 401 (Sesión Expirada):**
   - Remueve el token: `localStorage.removeItem("auth_token")`.
   - Limpia la memoria de React Query: `queryClient.clear()`.
   - Dispara la notificación traducida: `toast.error(i18n.t("unauthorized"))`.
   - Redirige a `/login` si el usuario no se encuentra allí.
3. **Silenciamiento Selectivo:** Si un hook o mutación desea omitir la alerta global de error (por ejemplo, para manejar su propio estado en pantalla):
   ```tsx
   useMutation({
     mutationFn: myAction,
     meta: { suppressToast: true },
   });
   ```
4. **Llave Personalizada:** Si una mutación desea forzar un mensaje de traducción específico:
   ```tsx
   useMutation({
     mutationFn: deleteUser,
     meta: { errorMessageKey: "users.deleteError" },
   });
   ```

---

## 4. Directory Structure per Feature

Cada microfrontend organiza sus llamadas a la API dentro de su respectiva feature:

```text
src/features/<feature>/
├── services/
│   ├── index.ts                 # Barrel export: export * from './<feature>.keys'; export * from './<feature>.services';
│   ├── <feature>.keys.ts        # Centralized Query Key Factory
│   └── <feature>.services.ts    # Async API calls using apiClient from '@/lib/axios'
├── hooks/
│   ├── index.ts                 # Barrel export of all custom hooks
│   ├── use<Entities>.ts         # Query hook (List/Get All)
│   ├── use<Entity>.ts           # Query hook (Single Detail)
│   ├── useCreate<Entity>.ts     # Mutation hook (POST)
│   ├── useUpdate<Entity>.ts     # Mutation hook (PUT/PATCH)
│   └── useDelete<Entity>.ts     # Mutation hook (DELETE)
└── types/
    └── <feature>.types.ts       # Domain interfaces & request payloads
```

---

## 5. Query Key Factory Pattern (`services/<feature>.keys.ts`)

```typescript
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...usersKeys.details(), id] as const,
};
```

---

## 6. API Service Pattern (`services/<feature>.services.ts`)

```typescript
import { apiClient } from '@/lib/axios';
import { User, CreateUserPayload, UpdateUserPayload } from '../types/users.types';

export const usersService = {
  async getAll(filters?: Record<string, unknown>): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users', { params: filters });
    return response.data;
  },

  async getById(id: string | number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const response = await apiClient.post<User>('/users', payload);
    return response.data;
  },

  async update(id: string | number, payload: UpdateUserPayload): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, payload);
    return response.data;
  },

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};

export default usersService;
```

---

## 7. Custom Hooks Pattern (`hooks/`)

### Query Hook
```typescript
import { useQuery } from '@tanstack/react-query';
import { usersService, usersKeys } from '../services';

export function useUsers(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: usersKeys.list(filters ?? {}),
    queryFn: () => usersService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos de validez en caché
  });
}
```

### Mutation Hook con Invalidación de Caché
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, usersKeys } from '../services';
import { CreateUserPayload } from '../types/users.types';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => {
      // Invalida automáticamente la lista de usuarios en toda la app
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}
```
