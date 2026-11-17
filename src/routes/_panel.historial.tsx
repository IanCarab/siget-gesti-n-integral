import { createFileRoute } from "@tanstack/react-router";
import { ReceiptText, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { TicketDialog } from "@/components/siget/TicketDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dateTime, isSameDay, money } from "@/lib/format";
import { pageHead } from "@/lib/siget/head";
import { useSiget } from "@/lib/siget/store";
import type { Sale } from "@/lib/siget/types";

export const Route = createFileRoute("/_panel/historial")({
  head: () => pageHead("Historial de ventas", "Consulta de ventas realizadas y reimpresión de comprobantes."),
  component: Historial,
});

function Historial() {
  const { data } = useSiget();
  const [q, setQ] = useState("");
  const [ticket, setTicket] = useState<Sale | null>(null);

  const sales = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.sales.filter(
      (v) => !s || String(v.id).includes(s) || v.clienteNombre.toLowerCase().includes(s) || (v.clienteDni ?? "").includes(s),
    );
  }, [data.sales, q]);

  const hoy = data.sales.filter((s) => isSameDay(s.fecha));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Mini label="Ventas de hoy" value={String(hoy.length)} />
        <Mini label="Facturado hoy" value={money(hoy.reduce((a, s) => a + s.total, 0))} />
        <Mini label="Total histórico" value={money(data.sales.reduce((a, s) => a + s.total, 0))} />
      </div>
      <section className="panel">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por N° de venta, cliente o DNI" className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Venta</th>
                <th className="px-4 py-2 font-medium">Fecha</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Detalle</th>
                <th className="px-4 py-2 font-medium">Pago</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-mono font-medium">#{s.id}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                    {isSameDay(s.fecha) ? "Hoy, " + new Date(s.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : dateTime(s.fecha)}
                  </td>
                  <td className="px-4 py-2.5">{s.clienteNombre}</td>
                  <td className="max-w-xs px-4 py-2.5 text-xs text-muted-foreground">
                    {s.items.map((i) => `${i.cantidad}× ${i.nombre}`).join(" · ")}
                  </td>
                  <td className="px-4 py-2.5">{s.medioPago}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-medium">{money(s.total)}</td>
                  <td className="px-4 py-2.5">
                    <Badge className="bg-success text-success-foreground hover:bg-success">{s.estado}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setTicket(s)}>
                      <ReceiptText /> Ticket
                    </Button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    Sin ventas para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <TicketDialog sale={ticket} onClose={() => setTicket(null)} />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-xl font-semibold">{value}</div>
    </div>
  );
}
