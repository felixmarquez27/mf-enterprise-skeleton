---
name: frontend-loaders-and-feedback
description: "Instructions for standardizing loading states, visual feedback patterns, skeleton loaders, optimistic updates, toast notifications, and button spinners in Microfrontends."
---

# Frontend Loading States & Visual Feedback Patterns (Microfrontends)

This skill establishes the standards for handling **Loading States** and **Visual Feedback** across the Microfrontend architecture. 

---

## 1. Decision Matrix: Loading Strategies

| Strategy | Primary Use Case | UX Goal | Implementation Mechanism |
| :--- | :--- | :--- | :--- |
| **1. Skeleton Loaders** | Cargas iniciales de páginas, tablas, tarjetas de detalle (`GET` queries). | Prevenir cambios de layout (CLS) y dar sensación de estructura inmediata. | `Skeleton` adaptado a las dimensiones reales del contenido. |
| **2. Remote Suspense Loader** | Carga bajo demanda de microfrontends federados remotos. | Feedback minimalista mientras se descargan los bundles JS del remote. | `<Suspense fallback={<div className="flex h-64 w-full items-center justify-center"><Loader className="size-8 text-primary" /></div>}>` |
| **3. Optimistic Updates** | Acciones instantáneas (activar/desactivar switch, eliminar item localmente). | Feedback de 0ms antes de que el backend responda. | TanStack Query `onMutate` con rollback en `onError`. |
| **4. Toast Notifications** | Operaciones en segundo plano o feedback de mutaciones (Crear, Editar, Borrar). | Notificación flotante de éxito o error sin bloquear la navegación. | `toast.success()`, `toast.error()`, o `toast.promise()` desde `design-system`. |
| **5. Button Spinner** | Botones de envío en formularios. | Bloquear el botón y evitar múltiples clics accidentales. | `<Button disabled={isLoading}> {isLoading && <Spinner className="mr-2" />} Enviar </Button>` |

---

## 2. Implementación de Patrones

### Pattern 1: Button Spinner (Prevención de Doble Clic)

Importa `Button` y `Spinner` (o su alias `Loader`) directamente desde `design-system`:

```tsx
import { Button, Spinner } from "design-system";

interface SubmitButtonProps {
  isLoading: boolean;
  text?: string;
  loadingText?: string;
}

export function SubmitButton({
  isLoading,
  text = "Guardar cambios",
  loadingText = "Guardando...",
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isLoading} className="gap-2">
      {isLoading && <Spinner className="size-4" />}
      {isLoading ? loadingText : text}
    </Button>
  );
}
```

---

### Pattern 2: Remote Microfrontend Loader (Suspense Fallback)

Cuando un microfrontend remoto se carga bajo demanda con `lazy(() => import("remote/app"))`, se utiliza un contenedor centrado con `<Loader />` de `design-system`:

```tsx
import { Suspense, lazy } from "react";
import { Loader } from "design-system";

const UsersMicrofrontend = lazy(() => import("users/users-app"));

export function UsersRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 w-full items-center justify-center">
          <Loader className="size-8 text-primary" />
        </div>
      }
    >
      <UsersMicrofrontend />
    </Suspense>
  );
}
```

---

### Pattern 3: Skeleton Loader

```tsx
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded bg-muted animate-pulse" />
        <div className="h-9 w-24 rounded bg-muted animate-pulse" />
      </div>

      {/* Row Skeletons */}
      <div className="rounded-lg border p-4 flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-muted animate-pulse" />
              <div className="flex flex-col gap-1">
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Pattern 4: Toaster Global en el Shell (`host`)

Para que las notificaciones de toast funcionen unificadas a través de todos los microfrontends sin dependencias dispersas:

1. **`design-system` expone todo:** Tanto el componente `<Toaster />` como la función `toast` se exportan desde el paquete compartido `design-system`. Ningún microfrontend debe instalar `sonner` en su propio `package.json`.
2. **Montaje único en el Shell:** El contenedor se monta una sola vez en la raíz del **Host** (`host/src/App.tsx`):
   ```tsx
   import { Toaster } from "design-system";

   export function App() {
     return (
       <>
         {/* ... rutas y layout ... */}
         <Toaster position="top-right" richColors />
       </>
     );
   }
   ```
3. **Disparo desde cualquier microfrontend:** Cualquier componente o servicio en `host` o en `users` dispara alertas importando `toast`:
   ```tsx
   import { toast } from "design-system";

   toast.success("Operación exitosa");
   toast.error("Ocurrió un error");
   ```
