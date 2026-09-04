---
name: frontend-forms-and-validation
description: "Instructions for managing forms, input controls, Zod schema validation, and react-hook-form integration in the Microfrontend architecture."
---

# Frontend Form Management & Zod Validation Pattern

This skill defines the standards for creating and validating forms across the Microfrontend applications using `react-hook-form`, `@hookform/resolvers/zod`, `zod`, and components from `design-system`.

---

## 1. Core Architecture of Forms

Forms in this application follow a 3-part structure:

```text
[ Zod Validation Schema ] (formSchema)
             │
             ▼
[ React Hook Form Setup ] (useForm + zodResolver(formSchema))
             │
             ▼
[ UI Controls from design-system ] (Input, Button, Card)
```

---

## 2. Standard Form Component Template

Template canónico para crear formularios (ej. `login-form.tsx` o `user-form.tsx`):

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "design-system";

// 1. Esquema de validación con Zod
export const userFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().min(1, "El correo electrónico es obligatorio").email("Formato de correo inválido"),
  role: z.string().min(1, "Selecciona un rol"),
});

export type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({ onSubmit, isLoading = false }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Datos del Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">Nombre</label>
            <Input id="name" placeholder="Ej. Juan Pérez" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">Correo Electrónico</label>
            <Input id="email" type="email" placeholder="juan@ejemplo.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading ? "Guardando..." : "Guardar Usuario"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default UserForm;
```

---

## 3. Rules for Form Implementation

1. **Infer Types from Schema:** Siempre deriva el tipo con `z.infer<typeof schema>`. Nunca dupliques interfaces TypeScript a mano.
2. **Componentes del Design System:** Usa `Input` y `Button` importados de `design-system`.
3. **Manejo de Errores Visuales:** Muestra los mensajes de error con estilos de error semánticos (`text-destructive`).
4. **Prevención de Doble Envío:** Deshabilita siempre el botón de envío (`disabled={isSubmitting || isLoading}`) durante la mutación de datos.
