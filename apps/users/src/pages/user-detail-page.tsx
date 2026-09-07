import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Loader,
} from "design-system";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useUserDetail } from "@/features/users";
import { UserRole, UserStatus } from "@/features/users/types/users.types";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading } = useUserDetail(id);

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Activo</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "INACTIVE":
        return <Badge variant="outline">Inactivo</Badge>;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <Shield className="size-3.5" /> Administrador
          </span>
        );
      case "AUDITOR":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            Auditor de Cumplimiento
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            Operador
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center p-6">
        <Loader className="size-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <h2 className="text-xl font-bold">Usuario no encontrado</h2>
        <p className="text-sm text-muted-foreground">
          El usuario solicitado no existe o fue dado de baja del sistema.
        </p>
        <Button variant="outline" onClick={() => navigate("..")}>
          <ArrowLeft className="mr-2 size-4" /> Volver al listado
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      {/* Botón Volver */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("..")}
        >
          <ArrowLeft className="size-4" />
          <span>Volver al listado de usuarios</span>
        </Button>
      </div>

      {/* Ficha de Detalle de Usuario */}
      <Card>
        <CardHeader className="border-b border-border pb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  ID de Registro: <code className="font-mono text-xs">{user.id}</code>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(user.status)}
              {getRoleBadge(user.role)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna Contacto */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-xs">
                Información de Contacto
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="size-4 shrink-0 text-primary" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="size-4 shrink-0 text-primary" />
                    <span className="text-foreground">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Building2 className="size-4 shrink-0 text-primary" />
                  <span className="text-foreground">{user.department || "No asignado"}</span>
                </div>
              </div>
            </div>

            {/* Columna Sistema & Fechas */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-xs">
                Datos de Auditoría
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="size-4 shrink-0 text-primary" />
                  <div>
                    <span className="block text-xs text-muted-foreground">Fecha de Alta</span>
                    <span className="text-foreground font-medium">
                      {new Date(user.createdAt).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <UserCheck className="size-4 shrink-0 text-primary" />
                  <div>
                    <span className="block text-xs text-muted-foreground">Nivel de Acceso</span>
                    <span className="text-foreground font-medium">
                      {user.role === "ADMIN" ? "Control Total" : "Acceso Restringido por Rol"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border pt-4 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("..")}>
            Cerrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default UserDetailPage;
