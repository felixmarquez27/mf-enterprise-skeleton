import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, GalleryVerticalEnd } from "lucide-react";
import { cn, Badge } from "design-system";
import { brandConfig } from "@/config/brand";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Usuarios",
    href: "/users",
    icon: Users,
    end: false,
  },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <GalleryVerticalEnd className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground">{brandConfig.appName}</span>
          <span className="text-[11px] font-medium text-muted-foreground">{brandConfig.appSubtitle}</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Navegación
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Info */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Entorno</div>
          <Badge variant="outline" className="text-[10px] font-medium uppercase">
            Producción
          </Badge>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
