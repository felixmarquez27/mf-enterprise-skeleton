# Custom Query Hooks (useQuery) Reference

This reference documents how to build custom data-fetching hooks wrapping TanStack Query `useQuery` v5.

---

## 1. List Query Hook Template (`useUsers.ts`)

```typescript
// frontend/src/features/users/hooks/useUsers.ts

import { useQuery } from '@tanstack/react-query';
import { usersService, usersKeys } from '../services';

interface UseUsersOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

/**
 * Custom Hook para consultar la lista de usuarios con soporte de filtros.
 */
export function useUsers(
  filters?: Record<string, unknown>,
  options?: UseUsersOptions
) {
  return useQuery({
    queryKey: usersKeys.list(filters ?? {}),
    queryFn: () => usersService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos de estado fresco por defecto
    ...options,
  });
}

export default useUsers;
```

---

## 2. Single Detail Query Hook Template (`useUser.ts`)

```typescript
// frontend/src/features/users/hooks/useUser.ts

import { useQuery } from '@tanstack/react-query';
import { usersService, usersKeys } from '../services';

interface UseUserOptions {
  enabled?: boolean;
}

/**
 * Custom Hook para obtener la información detallada de un usuario por su ID.
 */
export function useUser(id: string, options?: UseUserOptions) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
  });
}

export default useUser;
```

---

## 3. Data Selector Transformation Pattern

When a component only needs a specific slice or transformed view of the API response data, use the `select` option to avoid unneeded re-renders:

```typescript
export function useUserNames() {
  return useQuery({
    queryKey: usersKeys.lists(),
    queryFn: () => usersService.getAll(),
    select: (apiResponse) => apiResponse.data.map((user) => user.name),
  });
}
```

---

## 4. Query Hook Checklist

- [ ] File named `use<Entity>.ts` or `use<Entities>.ts` (kebab-case file name `use-user.ts` or camelCase `useUser.ts`).
- [ ] Uses `queryKey` from `<feature>Keys`.
- [ ] Invokes `<feature>Service` in `queryFn`.
- [ ] Sets explicit `staleTime` (or inherits `appConfig.query.staleTime`).
- [ ] Supports `enabled` conditional fetching when ID parameter can be null/undefined.
- [ ] Exports both named function `export function useUser` and default `export default useUser`.
- [ ] Re-exported in `hooks/index.ts`.
