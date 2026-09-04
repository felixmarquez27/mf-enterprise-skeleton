import { Link } from "react-router-dom";
import { Users, Server, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from "design-system";
import { useAuth } from "@/features/auth";
import { brandConfig } from "@/config/brand";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bienvenido, {user?.name || `${brandConfig.name} Administrador`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Panel de control centralizado y gestión de la plataforma {brandConfig.appName}.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Sistema Operativo
        </Badge>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Microfrontends</CardTitle>
            <Server className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Activos</div>
            <p className="text-xs text-muted-foreground mt-1">Host (Port 3000) & Users (Port 3001)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Módulo Usuarios</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Federado</div>
            <p className="text-xs text-muted-foreground mt-1">Consumo dinámico vía Module Federation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Seguridad y Sesión</CardTitle>
            <ShieldCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">JWT / Bearer</div>
            <p className="text-xs text-muted-foreground mt-1">Interceptor Axios y Route Guards activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Gestión de Usuarios</CardTitle>
          <CardDescription>
            Accede al microfrontend federado para administrar las cuentas, permisos y roles del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="gap-2">
            <Link to="/users">
              <span>Ir a Módulo de Usuarios</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
