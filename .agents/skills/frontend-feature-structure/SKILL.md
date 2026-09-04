---
name: frontend-feature-structure
description: "Instructions for creating and structuring feature modules in the Microfrontend architecture (Rsbuild, Module Federation, React Router DOM, TanStack Query, and design-system)."
---

# Microfrontend Architecture & Feature Structure

This frontend follows a Microfrontend architecture managed with **Turborepo**, **pnpm workspaces**, **Rsbuild**, and **Module Federation**, consisting of:
- **Host (Shell)**: Manages global routing (`react-router-dom`), shell layout (Sidebar, Header), session authentication, and global providers (TanStack `QueryClientProvider`).
- **Remotes (e.g. `users`)**: Domain-specific microfrontends exposing independent federated views and components.
- **Shared Packages (`packages/design-system`)**: Centralized design system (`design-system`) providing shadcn/ui primitives, theme tokens, and Tailwind presets.

Inside each application or microfrontend, business logic is organized into **Modular Feature Modules** (`src/features/<feature-name>/`).

---

## 0. Overall Microfrontend Project Structure

```text
mf-platform/
├── host/                               # Host Shell Application (Port 3000)
│   ├── src/
│   │   ├── components/                 # Shell-level components (Layouts, Guards)
│   │   │   ├── layout/                 # Shell layout (Sidebar, Header, MainLayout)
│   │   │   └── guards/                 # Route guards (ProtectedRoute, GuestRoute)
│   │   ├── config/                     # Shell configurations (routes, queryClient)
│   │   ├── lib/                        # Shared clients (apiClient axios instance)
│   │   ├── App.tsx                     # Root router with <BrowserRouter> and <Routes>
│   │   └── bootstrap.tsx               # Microfrontend entry point
│   └── rsbuild.config.ts               # Module Federation Host configuration
├── users/                              # Remote Microfrontend (Port 3001)
│   ├── src/
│   │   ├── features/                   # Domain features (e.g. users)
│   │   │   └── users/                  # Users feature module (see Section 1)
│   │   ├── App.tsx                     # Federated entry component (exposed as ./users-app)
│   │   └── bootstrap.tsx               # Standalone runner entry point
│   └── rsbuild.config.ts               # Module Federation Remote configuration
└── packages/
    └── design-system/                  # Shared UI library (design-system)
        ├── src/
        │   ├── components/ui/          # shadcn/ui components (Button, Card, Input, Badge)
        │   ├── lib/utils.ts            # cn() utility function
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
├── services/
│   ├── index.ts                        # Barrel export for keys + service
│   ├── <feature>.keys.ts               # TanStack Query key factory
│   └── <feature>.services.ts           # Async API service calling external REST API
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

## 4. API Service Object (`services/<feature>.services.ts`)

Create a single object that groups all HTTP calls for the feature against the external REST API using `apiClient`.

```typescript
// users/src/features/users/services/users.services.ts

import { apiClient, ApiResponse } from '@/lib/apiClient';
import { User, CreateUserPayload, UpdateUserPayload } from '../types/users.types';

export const usersService = {
  async getAll(filters?: Record<string, unknown>): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  async create(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/users', payload);
    return response.data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/users/${id}`);
    return response.data;
  },
};

export default usersService;
```

---

## 5. Services Barrel Export (`services/index.ts`)

```typescript
export * from './<feature>.keys';
export * from './<feature>.services';
```

---

## 6. Hooks (`hooks/`)

### 6.1 Query Hook (Read Data)
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

### 6.2 Mutation Hook (Create / Update / Delete)
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

## 7. Hooks Barrel Export (`hooks/index.ts`)

```typescript
export * from './useUsers';
export * from './useCreateUser';
export * from './useUpdateUser';
export * from './useDeleteUser';
```

---

## 8. Components (`components/`) & Colocation Pattern

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

## 9. Feature Root Barrel Export (`index.ts`)

```typescript
export * from './components';
export * from './hooks';
export * from './services';
export * from './types/users.types';
```

External consumers inside the microfrontend import from `@/features/<feature>`, never from internal subpaths.
