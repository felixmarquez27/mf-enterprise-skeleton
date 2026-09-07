import { LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { Button, Badge } from "design-system";
import { useAuth } from "@/features/auth";
import { brandConfig } from "@/config/brand";

export function Header() {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">Plataforma de Administración</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info Block */}
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <UserIcon className="size-4" />
          </div>
          <div className="hidden flex-col text-right sm:flex">
            <span className="text-xs font-semibold text-foreground">
              {user?.name || `${brandConfig.name} Administrador`}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {user?.email || brandConfig.supportEmail}
            </span>
          </div>
          <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
            {user?.role || "ADMIN"}
          </Badge>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Logout Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="gap-2 text-xs"
        >
          {isLoggingOut ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <LogOut className="size-3.5" />
          )}
          <span className="hidden sm:inline">Cerrar sesión</span>
        </Button>
      </div>
    </header>
  );
}

export default Header;
