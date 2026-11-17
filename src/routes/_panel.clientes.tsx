import { createFileRoute } from "@tanstack/react-router";
import { Phone, Search, UserPlus, Wrench, ReceiptText } from "lucide-react";
import { useMemo, useState } from "react";

import { ClientFormDialog } from "@/components/siget/ClientFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dateTime, money } from "@/lib/format";
import { pageHead } from "@/lib/siget/head";
import { orderTotal } from "@/lib/siget/logic";
import { useSiget } from "@/lib/siget/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_panel/clientes")({
  head: () => pageHead("Clientes", "Registro y consulta de clientes por DNI, nombre y teléfono."),
  component: Clientes,
});

function Clientes() {
  const { data } = useSiget();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(data.clients[0]?.dni ?? null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.clients.filter(
      (c) => !s || c.dni.includes(s) || c.nombre.toLowerCase().includes(s) || c.telefono.includes(s),
    );
  }, [data.clients, q]);

  const client = data.clients.find((c) => c.dni === selected) ?? null;
  const sales = client ? data.sales.filter((s) => s.clienteDni === client.dni) : [];
  const orders = client
    ? data.orders.filter((o) => o.clienteDni === client.dni || (!o.clienteDni && o.clienteNombre === client.nombre))
    : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
      <section className="panel">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por DNI, nombre o teléfono" className="pl-9" />
          </div>
          <Button onClick={() => setOpen(true)}>
            <UserPlus /> Nuevo cliente
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">DNI</th>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Teléfono</th>
              <th className="px-4 py-2 text-right font-medium">Compras</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr
                key={c.dni}
                onClick={() => setSelected(c.dni)}
                className={cn("cursor-pointer border-t hover:bg-muted/40", selected === c.dni && "bg-accent/60 hover:bg-accent/60")}
              >
                <td className="px-4 py-2.5 font-mono">{c.dni}</td>
                <td className="px-4 py-2.5 font-medium">{c.nombre}</td>
                <td className="px-4 py-2.5 font-mono text-muted-foreground">{c.telefono || "—"}</td>
                <td className="px-4 py-2.5 text-right font-mono">{data.sales.filter((s) => s.clienteDni === c.dni).length}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No se encontraron clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <aside className="panel h-fit">
        {client ? (
          <>
            <div className="border-b p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Ficha de cliente</div>
              <div className="mt-1 text-lg font-semibold">{client.nombre}</div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                <span>DNI {client.dni}</span>
                <span className="flex items-center gap-1">
                  <Phone className="size-3" /> {client.telefono || "—"}
                </span>
              </div>
            </div>
            <div className="border-b p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ReceiptText className="size-4 text-primary" /> Compras ({sales.length})
              </div>
              {sales.length === 0 && <p className="text-sm text-muted-foreground">Sin compras registradas.</p>}
              <ul className="space-y-1.5">
                {sales.map((s) => (
                  <li key={s.id} className="flex justify-between text-sm">
                    <span className="font-mono">#{s.id} <span className="text-muted-foreground">· {dateTime(s.fecha)}</span></span>
                    <span className="font-mono">{money(s.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Wrench className="size-4 text-primary" /> Equipos en taller ({orders.length})
              </div>
              {orders.length === 0 && <p className="text-sm text-muted-foreground">Sin órdenes de reparación.</p>}
              <ul className="space-y-2">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>
                      <span className="font-mono">#{o.id}</span> {o.tipoEquipo} {o.marca}
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline">{o.estado}</Badge>
                      <span className="font-mono">{money(orderTotal(o))}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="p-6 text-sm text-muted-foreground">Seleccioná un cliente para ver su ficha.</p>
        )}
      </aside>

      <ClientFormDialog open={open} onOpenChange={setOpen} onCreated={(c) => setSelected(c.dni)} />
    </div>
  );
}
