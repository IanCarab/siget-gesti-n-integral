import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Cpu, HardDrive, ShieldCheck, WifiOff } from "lucide-react";

import { ROLE_ICONS } from "@/components/siget/AppShell";
import { ROLES } from "@/lib/siget/roles";
import { useSiget } from "@/lib/siget/store";
import type { RoleId } from "@/lib/siget/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ingresar — SIGET" },
      {
        name: "description",
        content: "Elegí tu perfil para ingresar a SIGET: administración, mostrador, taller o depósito.",
      },
      { property: "og:title", content: "Ingresar — SIGET" },
      {
        property: "og:description",
        content: "Elegí tu perfil para ingresar a SIGET: administración, mostrador, taller o depósito.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

const ACCESOS: Record<RoleId, string> = {
  admin: "Panel general, ventas, taller, clientes e inventario",
  vendedor: "Punto de venta, historial y clientes",
  tecnico: "Tablero de órdenes de reparación",
  deposito: "Catálogo, entradas y salidas de mercadería",
};

function Login() {
  const { setRole } = useSiget();
  const navigate = useNavigate();

  const enter = (r: RoleId) => {
    setRole(r);
    navigate({ to: ROLES[r].home });
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--sidebar-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar-foreground) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Cpu className="size-6" />
          </div>
          <span className="font-mono text-xl font-semibold tracking-[0.2em] text-sidebar-accent-foreground">
            SIGET
          </span>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight text-sidebar-accent-foreground">
            Sistema Integrado de Gestión Comercial y Servicio Técnico
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/75">
            Mostrador, taller y depósito trabajando sobre la misma información. Cada venta descuenta
            stock al instante y cada repuesto usado en el taller queda registrado.
          </p>
        </div>
        <dl className="relative grid grid-cols-3 gap-4 font-mono text-[11px] text-sidebar-foreground/70">
          <div className="flex items-center gap-2">
            <WifiOff className="size-4 text-sidebar-primary" /> Sin conexión
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="size-4 text-sidebar-primary" /> Datos locales
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-sidebar-primary" /> Acceso por rol
          </div>
        </dl>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-2xl">
          <div className="mb-8 lg:hidden">
            <span className="font-mono text-lg font-semibold tracking-[0.2em]">SIGET</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Inicio de sesión</p>
          <h2 className="mt-2 text-2xl font-semibold">¿Con qué perfil vas a trabajar?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada perfil ve solo las herramientas de su puesto. Podés cambiar de perfil desde la barra
            superior en cualquier momento.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {(Object.keys(ROLES) as RoleId[]).map((r) => {
              const info = ROLES[r];
              const Icon = ROLE_ICONS[r];
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => enter(r)}
                  className="panel group flex flex-col items-start gap-4 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="grid size-10 place-items-center rounded-md bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{info.titulo}</div>
                    <div className="text-xs text-muted-foreground">{info.subtitulo}</div>
                  </div>
                  <div className="border-t pt-3 text-xs text-muted-foreground">{ACCESOS[r]}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
