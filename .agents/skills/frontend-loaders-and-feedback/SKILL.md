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
| **2. Optimistic Updates** | Acciones instantáneas (activar/desactivar switch, eliminar item localmente). | Feedback de 0ms antes de que el backend responda. | TanStack Query `onMutate` con rollback en `onError`. |
| **3. Toast Notifications** | Operaciones en segundo plano o feedback de mutaciones (Crear, Editar, Borrar). | Notificación flotante de éxito o error sin bloquear la navegación. | `toast.success()`, `toast.error()`, o `toast.promise()`. |
| **4. Button Spinner** | Botones de envío en formularios. | Bloquear el botón y evitar múltiples clics accidentales. | `<Button disabled={isLoading}> {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />} Enviar </Button>` |

---

## 2. Implementación de Patrones

### Pattern 1: Button Spinner (Prevención de Doble Clic)

Importa `Button` desde `design-system` y `Loader2` desde `lucide-react`:

```tsx
import { Button } from "design-system";
import { Loader2 } from "lucide-react";

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
      {isLoading && <Loader2 className="size-4 animate-spin" />}
      {isLoading ? loadingText : text}
    </Button>
  );
}
```

---

### Pattern 2: Skeleton Loader

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

### Pattern 3: Toaster Global en el Shell (`host`)

Para que las notificaciones de toast funcionen unificadas a través de todos los microfrontends:

1. El contenedor del Toaster (por ejemplo `sonner`) se monta una sola vez en el **Host** (`host/src/App.tsx`).
2. Cualquier microfrontend remoto (`users`) puede disparar `toast.success("Usuario creado")` y se mostrará limpiamente en la interfaz sin duplicar contenedores de toast.
