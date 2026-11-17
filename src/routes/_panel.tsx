import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useEffect } from "react";

import { AppShell, NAV } from "@/components/siget/AppShell";
import { canAccess, ROLES } from "@/lib/siget/roles";
import { useSiget } from "@/lib/siget/store";

export const Route = createFileRoute("/_panel")({
  component: PanelLayout,
});

function PanelLayout() {
  const { hydrated, role } = useSiget();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (hydrated && !role) navigate({ to: "/" });
  }, [hydrated, role, navigate]);

  if (!hydrated || !role) {
    return (
      <div className="grid h-screen place-items-center bg-background font-mono text-sm text-muted-foreground">
        Cargando SIGET…
      </div>
    );
  }

  const area = NAV.find((n) => pathname.startsWith(n.to))?.area;
  const allowed = !area || canAccess(role, area);

  return (
    <AppShell>
      {allowed ? (
        <Outlet />
      ) : (
        <div className="panel mx-auto mt-16 max-w-md p-8 text-center">
          <Lock className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">Acceso restringido</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            El perfil {ROLES[role].titulo} no tiene permiso para este módulo.
          </p>
          <Link
            to={ROLES[role].home}
            className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Ir a mi panel
          </Link>
        </div>
      )}
    </AppShell>
  );
}
