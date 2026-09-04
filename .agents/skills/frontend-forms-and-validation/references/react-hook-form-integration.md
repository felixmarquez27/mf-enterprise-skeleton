# React Hook Form Integration Reference

This reference documents form handling with `react-hook-form` and `@hookform/resolvers/zod`.

---

## 1. Setup in Component

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, CreateUserFormData } from "./user-form.schema";

export function UserForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
    mode: "onTouched", // Valida en blur / touch
  });

  return ( ... );
}
```

---

## 2. Setting Server Validation Errors Dynamically

When the backend API returns a 422 Unprocessable Entity with field-specific errors, map them back to the form state using `handleServerValidationErrors`:

```typescript
import { useEffect } from "react";
import { handleServerValidationErrors } from "@/lib/form-errors";

const { mutate, error: apiError } = useCreateUser();

// Automatically map backend 422 validation errors to form fields:
useEffect(() => {
  if (apiError) {
    handleServerValidationErrors(apiError, setError);
  }
}, [apiError, setError]);
```
