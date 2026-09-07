---
name: frontend-ui-components-pattern
description: "Instructions for building, structuring, and styling reusable UI components across the 3-tier component architecture using design-system and shadcn/ui in Microfrontends."
---

# Atomic UI Components & Design System Architecture (Microfrontends)

This skill defines the rules for composing and styling UI components in the Microfrontend architecture, strictly prioritizing **shadcn/ui** components centralizadas en **`packages/design-system`** (`design-system`) before considering any custom component implementation.

---

## 1. Golden Rule: Consumir `design-system` Primero

Antes de escribir elementos UI personalizados o divs con clases arbitrarias:

1. **Verificar componentes existentes en `design-system`:**  
   Revisar los componentes ya creados en `packages/design-system/src/components/ui/` (Button, Card, Input, Badge, Toaster, toast, Spinner/Loader, etc.).
2. **Instalar nuevos componentes vía CLI dentro del paquete:**  
   Si se requiere una primitiva adicional de shadcn (ej. Dialog, Select, Dropdown, Table), instalarla siempre dentro de `packages/design-system`:
   ```bash
   pnpm dlx shadcn@latest add <component-name> -c packages/design-system
   ```
   O situándose en el subdirectorio:
   ```bash
   cd packages/design-system
   pnpm dlx shadcn@latest add <component-name>
   ```
   Y re-exportarla en `packages/design-system/src/index.ts`.
3. **Consumir en los Microfrontends:**  
   En `host` o en `users`, importar directamente desde el paquete compartido:
   ```tsx
   import { Button, Card, Input, Badge, Toaster, toast, Loader } from "design-system";
   ```

---

## 2. Component Hierarchy (The 3 Tiers)

El desarrollo de componentes se organiza en 3 capas estrictas:

```text
packages/design-system/
└── components/ui/ ──> Tier 1: Primitivas Atómicas (Button, Input, Card, Badge, Spinner, Toaster, toast)

host/src/ o users/src/
├── components/common/ ──> Tier 2: Bloques Compuestos (EmptyState, StatsSummary, FilterBar)
└── components/layout/ ──> Tier 3: Estructura de Páginas (MainLayout, PageContainer, Sidebar)
```

### Layer Rules:
- **Tier 1 (`design-system`)**: Primitivas atómicas puras de shadcn. Tienen **cero** lógica de negocio, **cero** llamadas a APIs y **cero** estado de la aplicación.
- **Tier 2 (`components/common/`)**: Composiciones reutilizables que combinan primitivas de Tier 1 (ej. una barra de filtros o un estado vacío). Permanecen agnósticas de entidades específicas de backend.
- **Tier 3 (`components/layout/`)**: Envoltorios de layout y estructura de vistas (`PageContainer`, `Sidebar`, `Header`). Manejan anchos máximos (`container mx-auto`), paddings responsivos y navegación. Viven principalmente en el **Host (Shell)**.

---

## 3. Estilos Globales Centralizados (`design-system/styles.css`)

Para mantener consistencia total y evitar duplicar archivos CSS en cada microfrontend:

1. **Capa Base en el Design System:** [packages/design-system/src/styles/globals.css](file:///c:/Users/integ/Documents/workspace/hitss/admin-claro/packages/design-system/src/styles/globals.css) define las directivas de Tailwind y los estilos base del documento:
   ```css
   @import "./theme.css";

   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   @layer base {
     * {
       box-sizing: border-box;
       border-color: hsl(var(--border));
     }
     body {
       margin: 0;
       font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
       background-color: hsl(var(--background));
       color: hsl(var(--foreground));
       min-height: 100vh;
     }
   }
   ```
2. **Importación Única en el Shell (Host):**
   El Host es el dueño del viewport del navegador (`<html>`, `<body>`). Importa directamente:
   ```tsx
   import "design-system/styles.css";
   ```
   No se crean archivos `App.css` con estilos base en el host ni en los remotes.
3. **Aislamiento en Remotos:** Los microfrontends federados (`users`) no deben re-declarar `@tailwind base` ni alterar el `body` para no interferir con el shell al montarse.

---

## 4. Reglas Críticas de Estilos (Design Tokens)

1. **Tokens Semánticos:** Usa siempre las variables de color del tema (`bg-primary`, `text-primary-foreground`, `bg-background`, `text-muted-foreground`, `border-border`). Nunca uses colores fijos como `bg-blue-500` o `text-gray-700`.
2. **Espaciado con `gap-*`:** Usa `flex flex-col gap-4` o `flex items-center gap-2` en lugar de márgenes arbitrarios.
3. **Tamaños Cuadrados con `size-*`:** Escribe `size-4` o `size-8` en vez de `w-4 h-4` o `w-8 h-8` para iconos y avatares.
4. **Fusión de Clases con `cn()`:** Importa `cn` desde `design-system` para fusionar clases condicionales:
   ```tsx
   import { cn } from "design-system";
   className={cn("base-style", isActive && "active-style", className)}
   ```
