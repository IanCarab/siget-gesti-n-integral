import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Boxes,
  ChevronDown,
  Cpu,
  HardDrive,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ShoppingCart,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES, type AreaId } from "@/lib/siget/roles";
import { useSiget } from "@/lib/siget/store";
import type { RoleId } from "@/lib/siget/types";
import { cn } from "@/lib/utils";

export const NAV: {
  area: AreaId;
  to: "/admin" | "/ventas" | "/historial" | "/clientes" | "/taller" | "/inventario";
  label: string;
  icon: LucideIcon;
}[] = [
  { area: "admin", to: "/admin", label: "Panel general", icon: LayoutDashboard },
  { area: "ventas", to: "/ventas", label: "Punto de venta", icon: ShoppingCart },
  { area: "historial", to: "/historial", label: "Historial de ventas", icon: ReceiptText },
  { area: "clientes", to: "/clientes", label: "Clientes", icon: Users },
  { area: "taller", to: "/taller", label: "Taller", icon: Wrench },
  { area: "inventario", to: "/inventario", label: "Inventario", icon: Boxes },
];

export const ROLE_ICONS: Record<RoleId, LucideIcon> = {
  admin: LayoutDashboard,
  vendedor: ShoppingCart,
  tecnico: Wrench,
  deposito: Boxes,
};

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, lastSaved } = useSiget();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (!role) return null;
  const info = ROLES[role];
  const RoleIcon = ROLE_ICONS[role];
  const current = NAV.find((n) => pathname.startsWith(n.to));

  const switchTo = (r: RoleId) => {
    setRole(r);
    navigate({ to: ROLES[r].home });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
          <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
            <div className="grid size-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Cpu className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="font-mono text-base font-semibold tracking-wider text-sidebar-accent-foreground">
                SIGET
              </div>
              <div className="text-[11px] text-sidebar-foreground/70">Gestión comercial y taller</div>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 p-2">
            <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
              Módulos
            </div>
            {NAV.filter((n) => info.areas.includes(n.area)).map((n) => {
              const active = pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <n.icon className={cn("size-4", active && "text-sidebar-primary")} />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border p-3 text-[11px] text-sidebar-foreground/60">
            <div className="flex items-center gap-1.5">
              <HardDrive className="size-3.5" /> Base local · siget.db
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {info.titulo}
              </div>
              <h1 className="truncate text-base font-semibold">{current?.label ?? "SIGET"}</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-md border bg-background px-2.5 py-1.5 text-left text-sm hover:bg-muted">
                <div className="grid size-7 place-items-center rounded bg-primary text-primary-foreground">
                  <RoleIcon className="size-4" />
                </div>
                <div className="hidden leading-tight sm:block">
                  <div className="text-sm font-medium">{info.operador}</div>
                  <div className="text-[11px] text-muted-foreground">{info.subtitulo}</div>
                </div>
                <ChevronDown className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Cambiar de perfil</DropdownMenuLabel>
                {(Object.keys(ROLES) as RoleId[]).map((r) => {
                  const Icon = ROLE_ICONS[r];
                  return (
                    <DropdownMenuItem key={r} onSelect={() => switchTo(r)} disabled={r === role}>
                      <Icon className="size-4" />
                      <div className="leading-tight">
                        <div>{ROLES[r].titulo}</div>
                        <div className="text-[11px] text-muted-foreground">{ROLES[r].subtitulo}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    setRole(null);
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="size-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <nav className="flex gap-1 overflow-x-auto border-b bg-card px-2 py-1.5 md:hidden">
            {NAV.filter((n) => info.areas.includes(n.area)).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-xs"
                activeProps={{ className: "bg-primary text-primary-foreground" }}
              >
                <n.icon className="size-3.5" /> {n.label}
              </Link>
            ))}
          </nav>

          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>

      <footer className="flex h-7 shrink-0 items-center gap-4 border-t bg-sidebar px-3 font-mono text-[11px] text-sidebar-foreground/80">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" /> Modo local (sin conexión)
        </span>
        <span className="hidden sm:inline">Usuario: {info.operador}</span>
        <span className="ml-auto">
          Guardado {lastSaved ? lastSaved.toLocaleTimeString("es-AR") : "—"}
        </span>
        <span className="hidden sm:inline">SIGET v1.0</span>
      </footer>
    </div>
  );
}
