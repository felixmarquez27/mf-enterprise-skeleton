# API Services & Axios Client Reference

This reference documents the API Service layer (`<feature>.services.ts`) and how it interacts with the client-side `apiClient` Axios instance.

---

## 1. The Axios Client (`src/lib/axios.ts`)

The application configures a central Axios instance for all client-side HTTP calls directed to the Next.js BFF layer (`/api/...`).

### ApiResponse<T> Contract:
```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, unknown> | Array<unknown> | string | null;
}
```

### Axios Instance (`apiClient`):
- **baseURL:** Defaults to `process.env.NEXT_PUBLIC_API_BFF_URL || '/api'`.
- **timeout:** 15,000ms.
- **withCredentials:** `true` (enables automatic HttpOnly cookie transmission to Next.js BFF).
- **Interceptors:** Clean, zero client-side interceptors. Global error handling (Toasts, `ApiErrorCode` i18n, token expiration redirects, and 422 form error suppression) is managed centrally by `QueryProvider` (`src/providers/query-provider.tsx`).

---

## 2. API Service Standard Template

API Services are plain JavaScript objects grouping methods for a domain entity. They MUST NOT contain React hooks or React state.

```typescript
// frontend/src/features/users/services/users.services.ts

import apiClient, { ApiResponse } from '@/lib/axios';
import { User, CreateUserPayload, UpdateUserPayload } from '../types/users.types';

/**
 * Servicio para consumir los endpoints BFF de usuarios desde el cliente.
 */
export const usersService = {
  /**
   * Obtiene la lista de usuarios con filtros opcionales.
   */
  async getAll(filters?: Record<string, unknown>): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtiene la información detallada de un usuario por su ID.
   */
  async getById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo usuario en la plataforma.
   */
  async create(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/users', payload);
    return response.data;
  },

  /**
   * Actualiza los datos de un usuario existente.
   */
  async update(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, payload);
    return response.data;
  },

  /**
   * Elimina un usuario por su ID.
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/users/${id}`);
    return response.data;
  },
};

export default usersService;
```

---

## 3. Strict Service Rules

1. **Unwrap Response Data:** Always return `response.data` so the caller receives the `ApiResponse<T>` payload directly without Axios wrapper metadata.
2. **Explicit Type Generic:** Always pass `apiClient.get<ApiResponse<T>>(...)` generic type parameter.
3. **No Catch Blocks in Service Methods:** Do NOT wrap service methods in `try/catch`. Let errors bubble up to TanStack Query so `useQuery` or `useMutation` can handle error states (`isError`, `error`).
4. **Dual Export:** Export both a named const (`export const usersService`) and a default export (`export default usersService`).
5. **Barrel Export:** Always re-export services and keys from `services/index.ts`:
   ```typescript
   export * from './users.keys';
   export * from './users.services';
   ```
