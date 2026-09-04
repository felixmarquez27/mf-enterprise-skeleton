import { Link } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "design-system";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="size-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">404 - Página no encontrada</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        La ruta a la que intentas acceder no existe en la plataforma o ha sido trasladada a otro microfrontend.
      </p>
      <Button asChild className="mt-6 gap-2">
        <Link to="/">
          <Home className="size-4" />
          <span>Regresar al Dashboard</span>
        </Link>
      </Button>
    </div>
  );
}
