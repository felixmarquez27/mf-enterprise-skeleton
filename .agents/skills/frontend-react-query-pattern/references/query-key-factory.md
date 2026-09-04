# Query Key Factory Pattern Reference

This reference documents the exact design rules, typing conventions, and code structures for creating Query Key Factories in TanStack Query (v5).

---

## Why Use a Query Key Factory?

In TanStack Query, the cache key determines how queries are stored, updated, and invalidated.
Without a key factory, hardcoded string arrays (e.g. `['users', id]`) lead to:
- Typos and silent cache bugs across files.
- Inconsistent key hierarchies preventing broad invalidations.
- Loss of TypeScript autocomplete and safety.

A Query Key Factory is a single JavaScript object (`<feature>Keys`) containing functions and tuples with `as const` assertions that generate deterministic key arrays.

---

## Standard Template

```typescript
// frontend/src/features/users/services/users.keys.ts

/**
 * Diccionario de Query Keys para TanStack Query (React Query).
 * Centraliza y tipa las claves de caché para las consultas y mutaciones de usuarios.
 */
export const usersKeys = {
  /** Clave raíz global para todo el dominio de usuarios */
  all: ['users'] as const,

  /** Clave raíz para todas las consultas de listados */
  lists: () => [...usersKeys.all, 'list'] as const,

  /** Clave parametrizada para un listado con filtros o paginación */
  list: (filters: Record<string, unknown> = {}) => [...usersKeys.lists(), filters] as const,

  /** Clave raíz para todas las consultas de detalles */
  details: () => [...usersKeys.all, 'detail'] as const,

  /** Clave parametrizada para el detalle de una entidad específica por ID */
  detail: (id: string) => [...usersKeys.details(), id] as const,

  /** Clave parametrizada para sub-recursos o relaciones (ej. roles de un usuario) */
  userRoles: (id: string) => [...usersKeys.detail(id), 'roles'] as const,
};
```

---

## Key Hierarchy Tree

Understanding key inheritance allows targeted vs. broad cache invalidation:

```text
['users']                                       <-- usersKeys.all
 ├── ['users', 'list']                          <-- usersKeys.lists()
 │    ├── ['users', 'list', { page: 1 }]        <-- usersKeys.list({ page: 1 })
 │    └── ['users', 'list', { role: 'admin' }]  <-- usersKeys.list({ role: 'admin' })
 └── ['users', 'detail']                        <-- usersKeys.details()
      ├── ['users', 'detail', 'uuid-1']         <-- usersKeys.detail('uuid-1')
      └── ['users', 'detail', 'uuid-1', 'roles']<-- usersKeys.userRoles('uuid-1')
```

---

## Invalidation Examples

| Goal | Invalidation Code | Affected Queries |
| :--- | :--- | :--- |
| **Invalidate everything in users feature** | `queryClient.invalidateQueries({ queryKey: usersKeys.all });` | All lists, details, and sub-resources |
| **Invalidate all user lists (keep details cached)** | `queryClient.invalidateQueries({ queryKey: usersKeys.lists() });` | All paginated or filtered list queries |
| **Invalidate specific user detail** | `queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });` | Detail query for `userId` & its sub-resources |
| **Invalidate single filtered list** | `queryClient.invalidateQueries({ queryKey: usersKeys.list(currentFilters) });` | Only the query matching `currentFilters` |

---

## Strict Rules

1. **Naming Convention:** Always use camelCase ending with `Keys` plural (e.g. `usersKeys`, `authKeys`, `projectsKeys`).
2. **Root Key `all`:** Always defined as `['<domain>'] as const`.
3. **Use Spread Syntax:** Always derive child keys using `[...parentKeys.method(), 'sub-key'] as const`.
4. **`as const` Assertion:** Every function return value MUST be asserted with `as const`.
