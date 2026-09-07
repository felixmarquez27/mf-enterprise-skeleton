---
name: frontend-feature-structure
description: "Instructions for creating and structuring feature modules in the Microfrontend architecture (Rsbuild, Module Federation, React Router DOM, TanStack Query, and design-system)."
---

# Microfrontend Architecture & Feature Structure

This frontend follows a Microfrontend architecture managed with **Turborepo**, **pnpm workspaces**, **Rsbuild**, and **Module Federation**, consisting of:
- **Host (Shell)**: Manages global routing (`react-router-dom`), shell layout (Sidebar, Header), session authentication, i18n translation configuration, and global providers (`QueryProvider`, `Toaster`).
- **Remotes (e.g. `users`)**: Domain-specific microfrontends exposing independent federated views and components.
- **Shared Packages (`packages/design-system`)**: Centralized design system (`design-system`) providing shadcn/ui primitives, theme tokens, Toaster, Spinner, and Tailwind presets.

Inside each application or microfrontend, business logic is organized into **Modular Feature Modules** (`src/features/<feature-name>/`).

---

## 0. Overall Microfrontend Project Structure

```text
mf-platform/
├── apps/
│   ├── host/                           # Host Shell Application (Port 3000)
│   │   ├── src/
│   │   │   ├── components/             # Shell-level components (Layout)
│   │   │   │   └── layout/             # Shell layout (Sidebar, Header, MainLayout)
│   │   │   ├── config/                 # Shell configurations (brand, i18n, appConfig)
│   │   │   ├── features/               # Shell features (e.g. auth with guards & login-form)
│   │   │   │   └── auth/               # Authentication feature module
│   │   │   ├── lib/                    # Shared clients (axios.ts instance)
│   │   │   ├── locales/                # i18n translation dictionaries (es/en)
│   │   │   ├── providers/              # Application providers (QueryProvider)
│   │   │   ├── App.tsx                 # Root router with <BrowserRouter>, <Routes> and <Toaster>
│   │   │   └── bootstrap.tsx           # Microfrontend entry point
│   │   └── rsbuild.config.ts           # Module Federation Host configuration
│   └── users/                          # Remote Microfrontend (Port 3001)
│       ├── src/
│       │   ├── features/               # Domain features (e.g. users)
│       │   │   └── users/              # Users feature module (see Section 1)
│       │   ├── pages/                  # Remote views / screens (UsersListPage, UserDetailPage)
│       │   ├── App.tsx                 # Federated entry component with relative <Routes> (exposed as ./users-app)
│       │   └── bootstrap.tsx           # Standalone runner entry point (isolated BrowserRouter + QueryClientProvider)
│       └── rsbuild.config.ts           # Module Federation Remote configuration
└── packages/
    └── design-system/                  # Shared UI library (design-system)
        ├── src/
        │   ├── components/ui/          # shadcn/ui components (Button, Card, Input, Badge, Sonner, Spinner)
        │   ├── lib/utils.ts            # cn() utility function
        │   ├── styles/globals.css      # Baseline styles & @layer base
        │   └── styles/theme.css        # Design tokens & HSL variables
        └── tailwind.preset.js          # Shared Tailwind preset
```

---

## 1. Feature Module Directory Structure

Every domain capability inside a microfrontend MUST follow the standard feature folder layout inside `src/features/<feature-name>/`:

```text
src/features/<feature>/
├── components/
│   ├── index.ts                        # Barrel export for all feature components
│   └── <component-slug>/               # Sub-component Colocation folder per view
│       ├── index.ts                    # Local barrel export for the component slug
│       ├── <component-slug>.tsx        # Main orchestrator component
│       ├── <subcomponent-1>.tsx        # Specialized child component (e.g. stats cards)
│       └── <subcomponent-2>.tsx        # Specialized child component (e.g. table, dialog)
├── hooks/
│   ├── index.ts                        # Barrel export for all hooks
│   ├── use<Entity>.ts                  # Query hook (GET single/list)
│   └── useCreate<Entity>.ts            # Mutation hook (POST/PUT/DELETE)
├── mocks/
│   └── <feature>.mock.ts               # Mock data, filter simulation & emulated network latency
├── services/
│   ├── index.ts                        # Barrel export for keys + service
│   ├── <feature>.keys.ts               # TanStack Query key factory
│   └── <feature>.services.ts           # Async API service calling external REST API or mock
├── types/
│   └── <feature>.types.ts              # TypeScript interfaces/types
└── index.ts                            # Root barrel export (re-exports all)
```

---

## 2. Types File (`types/<feature>.types.ts`)

Define all TypeScript interfaces and request/response payloads in a single file. Use `export interface` (not `export type` for object shapes).

```typescript
// users/src/features/users/types/users.types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
}
```

**Rules:**
- Suffix request/write payloads with `Payload` (e.g., `CreateUserPayload`, `UpdateUserPayload`).
- Mark optional fields with `?`.
- Types are re-exported from the feature root `index.ts` directly via `export * from './types/<feature>.types'`.

---

## 3. Query Keys Factory (`services/<feature>.keys.ts`)

Create a centralized query key factory object for TanStack Query cache management using `as const` assertions.

```typescript
// users/src/features/users/services/users.keys.ts

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};
```

**Rules:**
- Name the constant as `<feature>Keys` (camelCase, plural).
- `all` is always the root key `['<feature>']`.
- Derive all sub-keys from `all` using spread syntax.
- Use factory functions returning `as const` tuples for parameterized keys.

---

## 4. Mock Data Layer (`mocks/<feature>.mock.ts`)

Durante el desarrollo frontend o cuando el backend aún no está disponible, cada feature define un archivo mock con datos realistas, emulación de latencia de red y soporte para filtros/búsqueda.

```typescript
// users/src/features/users/mocks/users.mock.ts

import { User, UserFilters } from "../types/users.types";

export const MOCK_USERS_DATA: User[] = [
  {
    id: "usr_101",
    name: "Carlos Gómez",
    email: "carlos.gomez@example.com.ar",
    role: "ADMIN",
    status: "ACTIVE",
    phone: "+54 11 4022-8811",
    department: "Infraestructura y Redes",
    createdAt: "2024-01-15T09:30:00Z",
  },
  // ... más registros representativos
];

/**
 * Simula la respuesta asíncrona de la API con latencia y soporte de filtros
 */
export async function getMockUsers(filters?: UserFilters): Promise<User[]> {
  await new Promise((resolve) => setTimeout(resolve, 400)); // Latencia de red emulada

  let result = [...MOCK_USERS_DATA];
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }
  return result;
}

export async function getMockUserById(id: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_USERS_DATA.find((u) => u.id === id) || null;
}
```

**Reglas para Mocks:**
1. **Dominios Neutros:** Usar siempre dominios estándar para ejemplos (ej. `@example.com.ar` o `@example.com`, RFC 2606), evitando nombres de empresas reales en datasets de prueba.
2. **Latencia Emulada:** Usar `setTimeout(..., 300-500)` para que los loaders, skeletons y estados de carga de la UI se comporten de forma realista.
3. **Firma Idéntica a la API:** La función mock debe devolver exactamente el mismo tipo de datos tipado (`Promise<User[]>`) que devolverá el backend REST.

---

## 5. API Service Object (`services/<feature>.services.ts`)

Crea un objeto único que encapsula las llamadas HTTP del feature. Durante la emulación consume las funciones del mock; al pasar a producción, se sustituye por `apiClient` con 1 sola línea de cambio sin afectar hooks ni vistas.

```typescript
// users/src/features/users/services/users.services.ts

import { apiClient } from "@/lib/axios";
import { User, CreateUserPayload, UpdateUserPayload, UserFilters } from "../types/users.types";
import { getMockUsers, getMockUserById } from "../mocks/users.mock";

export const usersService = {
  async getAll(filters?: UserFilters): Promise<User[]> {
    // Modo Mock durante desarrollo:
    return getMockUsers(filters);

    // Modo Producción (simplemente descomentar):
    // const response = await apiClient.get<User[]>('/users', { params: filters });
    // return response.data;
  },

  async getById(id: string): Promise<User> {
    const user = await getMockUserById(id);
    if (!user) throw new Error("Usuario no encontrado");
    return user;

    // Modo Producción:
    // const response = await apiClient.get<User>(`/users/${id}`);
    // return response.data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const response = await apiClient.post<User>('/users', payload);
    return response.data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};

export default usersService;
```

---

## 6. Services Barrel Export (`services/index.ts`)

```typescript
export * from './<feature>.keys';
export * from './<feature>.services';
```

---

## 7. Hooks (`hooks/`)

### 7.1 Query Hook (Read Data)
```typescript
// users/src/features/users/hooks/useUsers.ts

import { useQuery } from '@tanstack/react-query';
import { usersService, usersKeys } from '../services';

export function useUsers(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: usersKeys.list(filters ?? {}),
    queryFn: () => usersService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
}

export default useUsers;
```

### 7.2 Mutation Hook (Create / Update / Delete)
```typescript
// users/src/features/users/hooks/useCreateUser.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, usersKeys } from '../services';
import { CreateUserPayload } from '../types/users.types';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => {
      // Invalida la lista de usuarios en la caché compartida de TanStack Query
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export default useCreateUser;
```

---

## 8. Hooks Barrel Export (`hooks/index.ts`)

```typescript
export * from './useUsers';
export * from './useCreateUser';
export * from './useUpdateUser';
export * from './useDeleteUser';
```

---

## 9. Components (`components/`) & Colocation Pattern

Organize complex views using the **Sub-component Colocation Pattern**:

```text
src/features/users/components/
├── users-table/                         # Folder per component slug
│   ├── users-stats-cards.tsx            # Specialized child component
│   ├── users-filter-bar.tsx             # Specialized child component
│   ├── users-table-grid.tsx             # Specialized child component
│   ├── users-table.tsx                  # Main orchestrator component
│   └── index.ts                         # Local barrel export
└── index.ts                             # Feature components barrel export
```

### Component Implementation:
```tsx
import { useState } from 'react';
import { Button, Card } from 'design-system';
import { useUsers } from '../../hooks';
import { UsersFilterBar } from './users-filter-bar';
import { UsersTableGrid } from './users-table-grid';

export function UsersTable() {
  const [filters, setFilters] = useState({});
  const { data: users, isLoading } = useUsers(filters);

  return (
    <Card className="p-6 space-y-4">
      <UsersFilterBar onFilterChange={setFilters} />
      <UsersTableGrid data={users} loading={isLoading} />
    </Card>
  );
}

export default UsersTable;
```

---

## 10. Feature Root Barrel Export (`index.ts`)

```typescript
export * from './components';
export * from './hooks';
export * from './services';
export * from './types/users.types';
```

External consumers inside the microfrontend import from `@/features/<feature>`, never from internal subpaths.

---

## 11. Remote Microfrontend Pages & Relative Routing (`pages/` y `App.tsx`)

Los microfrontends remotos que manejan múltiples pantallas organizan sus vistas completas dentro de `src/pages/` y declaran rutas **relativas** en su `App.tsx`:

```text
users/src/
├── pages/
│   ├── users-list-page.tsx              # Vista principal (Buscador, Cards/Tabla, Badges)
│   ├── user-detail-page.tsx             # Vista de detalle de la entidad (Card resumen, Back button)
│   └── index.ts                         # Barrel export
├── App.tsx                              # Enrutador relativo federado
└── bootstrap.tsx                        # Runner standalone con providers
```

### Enrutamiento Relativo (`users/src/App.tsx`):
```tsx
import { Routes, Route } from "react-router-dom";
import { UsersListPage, UserDetailPage } from "./pages";

export function UsersApp() {
  return (
    <Routes>
      <Route path="/" element={<UsersListPage />} />
      <Route path=":id" element={<UserDetailPage />} />
    </Routes>
  );
}

export default UsersApp;
```

### Montaje en el Host Shell (`host/src/App.tsx`):
El Shell monta el componente remoto bajo una ruta con comodín `/*`:
```tsx
<Route
  path="/users/*"
  element={
    <Suspense fallback={<Loader className="size-8" />}>
      <UsersMicrofrontend />
    </Suspense>
  }
/>
```
De esta forma:
- `/users` renderiza automáticamente `UsersListPage`.
- `/users/usr_101` renderiza `UserDetailPage` recibiendo `const { id } = useParams()`.

---

## 12. Remote Standalone Execution (`bootstrap.tsx`)

Para permitir que cada microfrontend pueda desarrollarse, probarse y desplegarse de manera 100% aislada en su propio puerto (ej. `localhost:3001`):

```tsx
// users/src/bootstrap.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "design-system/styles.css"; // Solo en bootstrap se cargan estilos base para standalone
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```
Cuando se monta dentro del Host Shell, el Host ya provee el `<BrowserRouter>` y el `<QueryClientProvider>` singleton, permitiendo integración transparente sin duplicar contextos.
