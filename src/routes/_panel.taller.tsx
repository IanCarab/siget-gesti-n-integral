import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Package, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { NewOrderDialog } from "@/components/siget/NewOrderDialog";
import { OrderDetailDialog } from "@/components/siget/OrderDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money, shortDate } from "@/lib/format";
import { pageHead } from "@/lib/siget/head";
import { moveOrder, orderTotal } from "@/lib/siget/logic";
import { useSiget } from "@/lib/siget/store";
import { ORDER_STATES, type OrderState } from "@/lib/siget/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_panel/taller")({
  head: () => pageHead("Taller", "Tablero de órdenes de reparación del servicio técnico."),
  component: Taller,
});

const STATE_STYLE: Record<OrderState, string> = {
  Ingresado: "bg-status-ingresado",
  "En Diagnóstico": "bg-status-diagnostico",
  "En Reparación": "bg-status-reparacion",
  Listo: "bg-status-listo",
  Entregado: "bg-status-entregado",
};

function Taller() {
  const { data, setData } = useSiget();
  const [q, setQ] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<OrderState | null>(null);

  const orders = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.orders.filter(
      (o) =>
        !s ||
        String(o.id).includes(s) ||
        o.clienteNombre.toLowerCase().includes(s) ||
        `${o.tipoEquipo} ${o.marca} ${o.modelo}`.toLowerCase().includes(s),
    );
  }, [data.orders, q]);

  const move = (id: number, estado: OrderState) => {
    const o = data.orders.find((x) => x.id === id);
    if (!o || o.estado === estado) return;
    setData((d) => moveOrder(d, id, estado));
    toast(`Orden #${id} → ${estado}`);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar orden, cliente o equipo" className="bg-card pl-9" />
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus /> Nueva orden
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 auto-cols-[minmax(210px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
        {ORDER_STATES.map((estado, idx) => {
          const col = orders.filter((o) => o.estado === estado);
          return (
            <section
              key={estado}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(estado);
              }}
              onDragLeave={() => setDragOver((s) => (s === estado ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                move(Number(e.dataTransfer.getData("text/plain")), estado);
              }}
              className={cn(
                "flex min-h-[420px] flex-col rounded-lg border bg-muted/50 transition-colors",
                dragOver === estado && "border-primary bg-accent/60",
              )}
            >
              <header className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className={cn("size-2.5 rounded-full", STATE_STYLE[estado])} />
                  {estado}
                </div>
                <span className="rounded bg-background px-1.5 font-mono text-xs text-muted-foreground">{col.length}</span>
              </header>
              <div className="flex-1 space-y-2 px-2 pb-2">
                {col.map((o) => (
                  <article
                    key={o.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", String(o.id))}
                    onClick={() => setDetail(o.id)}
                    className="panel group cursor-pointer p-3 transition-colors hover:border-primary"
                  >
                    <div className={cn("-mx-3 -mt-3 mb-2.5 h-1 rounded-t-[inherit]", STATE_STYLE[estado])} />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold">#{o.id}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{shortDate(o.fechaIngreso)}</span>
                    </div>
                    <div className="mt-1 text-sm font-medium leading-snug">
                      {o.tipoEquipo} {o.marca} {o.modelo !== "—" ? o.modelo : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">{o.clienteNombre}</div>
                    <p className="mt-2 line-clamp-2 text-xs">{o.falla}</p>
                    <div className="mt-3 flex items-center justify-between border-t pt-2">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        {o.repuestos.length > 0 && (
                          <>
                            <Package className="size-3" /> {o.repuestos.reduce((s, r) => s + r.cantidad, 0)}
                          </>
                        )}
                      </span>
                      <span className="font-mono text-sm font-semibold">{money(orderTotal(o))}</span>
                    </div>
                    <div className="mt-2 flex justify-between opacity-60 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        disabled={idx === 0}
                        aria-label="Mover a estado anterior"
                        onClick={(e) => {
                          e.stopPropagation();
                          move(o.id, ORDER_STATES[idx - 1]!);
                        }}
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        disabled={idx === ORDER_STATES.length - 1}
                        aria-label="Mover a estado siguiente"
                        onClick={(e) => {
                          e.stopPropagation();
                          move(o.id, ORDER_STATES[idx + 1]!);
                        }}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </article>
                ))}
                {col.length === 0 && (
                  <div className="rounded-md border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                    Arrastrá una orden aquí
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <NewOrderDialog open={newOpen} onOpenChange={setNewOpen} />
      {detail !== null && <OrderDetailDialog orderId={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
