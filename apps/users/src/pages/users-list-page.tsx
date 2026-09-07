import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Input,
  Loader,
} from "design-system";
import { Search, UserCheck, Shield, Phone, Mail, Building2, ChevronRight } from "lucide-react";
import { useUsers } from "@/features/users";
import { UserRole, UserStatus } from "@/features/users/types/users.types";

export function UsersListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useUsers({ search });

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
          <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            <Shield className="size-3" /> Admin
          </span>
        );
      case "AUDITOR":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            Auditor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            Operador
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra los accesos, roles y estados del personal en la plataforma.
          </p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o departamento..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Estado de Carga */}
      {isLoading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader className="size-8 text-primary" />
        </div>
      ) : users && users.length > 0 ? (
        /* Grilla de Usuarios */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card
              key={user.id}
              className="flex flex-col justify-between transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {user.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {user.department || "Sin departamento"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(user.status)}
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-2 pb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">Rol:</span>
                  {getRoleBadge(user.role)}
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between gap-1 text-xs"
                  onClick={() => navigate(user.id)}
                >
                  <span>Ver perfil</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        /* Estado Vacío */
        <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-center">
          <UserCheck className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            No se encontraron usuarios
          </p>
          <p className="text-xs text-muted-foreground">
            Prueba ajustando los términos de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}

export default UsersListPage;
