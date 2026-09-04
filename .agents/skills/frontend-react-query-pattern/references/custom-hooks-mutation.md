# Custom Mutation Hooks (useMutation) Reference

This reference documents how to build custom mutation hooks wrapping TanStack Query `useMutation` v5 for POST, PUT, PATCH, and DELETE operations, including cache invalidation and optimistic updates.

> [!NOTE]
> For complete UI loading state guidelines, Skeleton usage, Toast.promise background rules, and button spinner standards, see the `frontend-loaders-and-feedback` skill.

---

## 1. Creation Mutation Hook Template (`useCreateUser.ts`)

```typescript
// frontend/src/features/users/hooks/useCreateUser.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/lib/axios';
import { usersService, usersKeys } from '../services';
import { CreateUserPayload, User } from '../types/users.types';

/**
 * Custom Hook para gestionar la creación de un nuevo usuario.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<User>, AxiosError<ApiResponse>, CreateUserPayload>({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: (res) => {
      if (res?.message) {
        toast.success(res.message);
      }
      // Invalida todo el caché de usuarios para refrescar listas y conteos
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export default useCreateUser;
```

---

## 2. Update Mutation Hook Template (`useUpdateUser.ts`)

```typescript
// frontend/src/features/users/hooks/useUpdateUser.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersService, usersKeys } from '../services';
import { UpdateUserPayload } from '../types/users.types';

interface UpdateUserVariables {
  id: string;
  payload: UpdateUserPayload;
}

/**
 * Custom Hook para gestionar la actualización de un usuario existente.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateUserVariables) => usersService.update(id, payload),
    onSuccess: (res, { id }) => {
      if (res?.message) {
        toast.success(res.message);
      }
      // Invalida tanto el detalle específico como las listas generales
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

export default useUpdateUser;
```

---

## 3. Delete Mutation Hook Template with Optimistic Updates (`useDeleteUser.ts`)

```typescript
// frontend/src/features/users/hooks/useDeleteUser.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/lib/axios';
import { usersService, usersKeys } from '../services';
import { UsersListResponseData } from '../types/users.types';

/**
 * Custom Hook para gestionar el borrado de un usuario con actualización optimista (0ms latency).
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),

    // 1. Instantly remove row from cache before HTTP response
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: usersKeys.all });

      const previousQueries = queryClient.getQueriesData<ApiResponse<UsersListResponseData>>({
        queryKey: usersKeys.lists(),
      });

      queryClient.setQueriesData<ApiResponse<UsersListResponseData>>(
        { queryKey: usersKeys.lists() },
        (old) => {
          if (!old?.data?.users) return old;
          return {
            ...old,
            data: {
              ...old.data,
              users: old.data.users.filter((user) => user.id !== id),
              pagination: old.data.pagination
                ? { ...old.data.pagination, total: Math.max(0, old.data.pagination.total - 1) }
                : old.data.pagination,
            },
          };
        },
      );

      return { previousQueries };
    },

    // 2. Rollback to snapshot on server error
    onError: (_err, _id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },

    // 3. Always revalidate silently on completion
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export default useDeleteUser;
```

---

## 4. Optimistic Update Pattern Template (`useChangeUserStatus.ts`)

For instant UI feedback before the server responds, implement optimistic cache updates on list queries:

```typescript
// frontend/src/features/users/hooks/useChangeUserStatus.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/lib/axios';
import { usersService, usersKeys } from '../services';
import { UsersListResponseData, UserStatus } from '../types/users.types';

interface ChangeStatusVariables {
  id: string;
  status: UserStatus;
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: ChangeStatusVariables) =>
      usersService.changeStatus(id, status),

    // 1. Optimistically update RAM cache immediately (0ms)
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: usersKeys.all });

      const previousQueries = queryClient.getQueriesData<ApiResponse<UsersListResponseData>>({
        queryKey: usersKeys.lists(),
      });

      queryClient.setQueriesData<ApiResponse<UsersListResponseData>>(
        { queryKey: usersKeys.lists() },
        (old) => {
          if (!old?.data?.users) return old;
          return {
            ...old,
            data: {
              ...old.data,
              users: old.data.users.map((user) =>
                user.id === id ? { ...user, status } : user
              ),
            },
          };
        }
      );

      return { previousQueries };
    },

    // 2. Rollback on HTTP failure
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },

    // 3. Always revalidate with backend on settled
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export default useChangeUserStatus;
```

---

## 5. Mutation Hook Checklist

- [ ] Named as `useCreate<Entity>`, `useUpdate<Entity>`, `useDelete<Entity>`.
- [ ] Obtains `queryClient` instance via `useQueryClient()`.
- [ ] Handles success toast notifications via `if (res?.message) toast.success(res.message);` inside `onSuccess`.
- [ ] Performs cache invalidation using `<feature>Keys.all` or specific detail keys inside `onSuccess` / `onSettled`.
- [ ] Exports both named and default functions.
- [ ] Re-exported in `hooks/index.ts`.
