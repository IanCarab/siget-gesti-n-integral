import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cpu, HardDrive, ShieldCheck, WifiOff } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIGET — Gestión Comercial y Servicio Técnico" },
      {
        name: "description",
        content: "Sistema integrado de gestión comercial y servicio técnico. Mostrador, taller y depósito en un solo lugar.",
      },
      { property: "og:title", content: "SIGET — Gestión Comercial y Servicio Técnico" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Left panel */}
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

      {/* Right panel */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <span className="font-mono text-lg font-semibold tracking-[0.2em]">SIGET</span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Bienvenido
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Sistema de gestión</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Accedé con tu usuario y contraseña para ingresar al sistema.
          </p>

          <div className="mt-8">
            <Link
              to="/login"
              className="group flex w-full items-center justify-between rounded-lg border bg-card px-5 py-4 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
                  <Cpu className="size-4" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold">Ingresar al sistema</div>
                  <div className="text-xs text-muted-foreground">Elegí tu perfil de trabajo</div>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Vista de demostración · Datos locales en el navegador
          </p>
        </div>
      </section>
    </div>
  );
}
