import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Banknote, Boxes, ReceiptText, RotateCcw, ShoppingCart, Users, Wrench, type LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { isSameDay, money } from "@/lib/format";
import { pageHead } from "@/lib/siget/head";
import { isLowStock, orderTotal } from "@/lib/siget/logic";
import { useSiget } from "@/lib/siget/store";
import { ORDER_STATES } from "@/lib/siget/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_panel/admin")({
  head: () => pageHead("Panel general", "Métricas del local: ingresos, ventas del día, taller y alertas de stock."),
  component: AdminDashboard,
});

const STATE_BAR: Record<string, string> = {
  Ingresado: "bg-status-ingresado",
  "En Diagnóstico": "bg-status-diagnostico",
  "En Reparación": "bg-status-reparacion",
  Listo: "bg-status-listo",
  Entregado: "bg-status-entregado",
};

function AdminDashboard() {
  const { data, resetDemo } = useSiget();
  const ventasHoy = data.sales.filter((s) => isSameDay(s.fecha));
  const totalVentas = data.sales.reduce((s, v) => s + v.total, 0);
  const totalTaller = data.orders.filter((o) => o.estado === "Entregado").reduce((s, o) => s + orderTotal(o), 0);
  const enTaller = data.orders.filter((o) => o.estado !== "Entregado");
  const bajos = data.products.filter(isLowStock);
  const listos = data.orders.filter((o) => o.estado === "Listo");

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const total = data.sales.filter((s) => isSameDay(s.fecha, d)).reduce((a, s) => a + s.total, 0);
    return { dia: d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", ""), total };
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Banknote} label="Ingresos totales" value={money(totalVentas + totalTaller)} hint={`Ventas ${money(totalVentas)} · Taller ${money(totalTaller)}`} />
        <Kpi icon={ShoppingCart} label="Ventas del día" value={money(ventasHoy.reduce((a, s) => a + s.total, 0))} hint={`${ventasHoy.length} ${ventasHoy.length === 1 ? "operación" : "operaciones"} hoy`} />
        <Kpi icon={Wrench} label="Equipos en taller" value={String(enTaller.length)} hint={`${listos.length} listo${listos.length === 1 ? "" : "s"} para retirar`} />
        <Kpi icon={AlertTriangle} label="Alertas de stock bajo" value={String(bajos.length)} hint={bajos.length ? "Requieren reposición" : "Todo en orden"} alert={bajos.length > 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="panel p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Ventas últimos 7 días</h2>
            <Link to="/historial" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver historial <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="dia" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={70} stroke="var(--muted-foreground)" tickFormatter={(v) => money(v)} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  formatter={(v: number) => [money(v), "Ventas"]}
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="total" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Estado del taller</h2>
          <div className="space-y-3">
            {ORDER_STATES.map((s) => {
              const n = data.orders.filter((o) => o.estado === s).length;
              const pct = data.orders.length ? (n / data.orders.length) * 100 : 0;
              return (
                <div key={s}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{s}</span>
                    <span className="font-mono">{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className={cn("h-2 rounded-full", STATE_BAR[s])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/taller" className="mt-5 flex items-center gap-1 text-xs text-primary hover:underline">
            Abrir tablero <ArrowRight className="size-3" />
          </Link>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="panel xl:col-span-1">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="font-semibold">Stock bajo</h2>
            <Link to="/inventario" className="text-xs text-primary hover:underline">Inventario</Link>
          </div>
          {bajos.length === 0 && <p className="px-5 py-6 text-sm text-muted-foreground">Sin alertas.</p>}
          {bajos.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 border-b px-5 py-3 text-sm last:border-0">
              <div>
                <div className="font-medium">{p.nombre}</div>
                <div className="text-xs text-muted-foreground">{p.categoria} · mínimo {p.stockMinimo}</div>
              </div>
              <span className="rounded bg-destructive/10 px-2 py-0.5 font-mono font-semibold text-destructive">{p.stock}</span>
            </div>
          ))}
        </section>

        <section className="panel xl:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="font-semibold">Últimas ventas</h2>
            <span className="text-xs text-muted-foreground">{data.sales.length} en total</span>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.sales.slice(0, 5).map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-5 py-2.5 font-mono">#{s.id}</td>
                  <td className="px-2 py-2.5">{s.clienteNombre}</td>
                  <td className="px-2 py-2.5 text-xs text-muted-foreground">{s.items.reduce((a, i) => a + i.cantidad, 0)} artículos · {s.medioPago}</td>
                  <td className="px-5 py-2.5 text-right font-mono font-medium">{money(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Acceso rápido</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Quick to="/ventas" icon={ShoppingCart} label="Punto de venta" desc="Cobrar en mostrador" />
          <Quick to="/historial" icon={ReceiptText} label="Historial" desc="Ventas y comprobantes" />
          <Quick to="/clientes" icon={Users} label="Clientes" desc={`${data.clients.length} registrados`} />
          <Quick to="/taller" icon={Wrench} label="Taller" desc={`${enTaller.length} equipos activos`} />
          <Quick to="/inventario" icon={Boxes} label="Inventario" desc={`${data.products.length} artículos`} />
        </div>
      </section>

      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <RotateCcw /> Restablecer datos de demostración
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Restablecer todos los datos?</AlertDialogTitle>
              <AlertDialogDescription>
                Se borrarán las ventas, clientes, órdenes y movimientos cargados y se volverá a los datos iniciales.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetDemo();
                  toast.success("Datos de demostración restablecidos");
                }}
              >
                Restablecer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint, alert }: { icon: LucideIcon; label: string; value: string; hint: string; alert?: boolean }) {
  return (
    <div className={cn("panel p-4", alert && "border-destructive/40")}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("grid size-8 place-items-center rounded-md bg-accent text-accent-foreground", alert && "bg-destructive/10 text-destructive")}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className={cn("mt-2 font-mono text-2xl font-semibold", alert && "text-destructive")}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function Quick({ to, icon: Icon, label, desc }: { to: "/ventas" | "/historial" | "/clientes" | "/taller" | "/inventario"; icon: LucideIcon; label: string; desc: string }) {
  return (
    <Link to={to} className="panel group flex items-center gap-3 p-4 transition-colors hover:border-primary">
      <span className="grid size-10 place-items-center rounded-md bg-sidebar text-sidebar-primary">
        <Icon className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
