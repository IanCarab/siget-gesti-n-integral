import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Search, ShoppingCart, Trash2, UserPlus, UserRound, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ClientFormDialog } from "@/components/siget/ClientFormDialog";
import { TicketDialog } from "@/components/siget/TicketDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/format";
import { pageHead } from "@/lib/siget/head";
import { confirmSale, isLowStock, type CartLine } from "@/lib/siget/logic";
import { ROLES } from "@/lib/siget/roles";
import { useSiget } from "@/lib/siget/store";
import type { PaymentMethod, Sale } from "@/lib/siget/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_panel/ventas")({
  head: () => pageHead("Punto de venta", "Venta rápida de mostrador con descuento automático de stock."),
  component: PuntoDeVenta,
});

const PAGOS: PaymentMethod[] = ["Efectivo", "Débito", "Crédito", "Transferencia"];

function PuntoDeVenta() {
  const { data, setData, role } = useSiget();
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState<Record<number, number>>({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [clientQuery, setClientQuery] = useState("");
  const [clientDni, setClientDni] = useState<string | null>(null);
  const [pago, setPago] = useState<PaymentMethod>("Efectivo");
  const [ticket, setTicket] = useState<Sale | null>(null);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.products;
    return data.products.filter(
      (p) => String(p.id) === q || p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q),
    );
  }, [data.products, query]);

  const clientMatches = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return [];
    return data.clients
      .filter((c) => c.dni.includes(q) || c.nombre.toLowerCase().includes(q))
      .slice(0, 5);
  }, [data.clients, clientQuery]);

  const selectedClient = clientDni ? data.clients.find((c) => c.dni === clientDni) : null;
  const inCart = (id: number) => cart.find((l) => l.productId === id)?.cantidad ?? 0;

  const lines = cart.map((l) => {
    const p = data.products.find((x) => x.id === l.productId)!;
    return { ...l, p, subtotal: p.precio * l.cantidad };
  });
  const total = lines.reduce((s, l) => s + l.subtotal, 0);
  const unidades = lines.reduce((s, l) => s + l.cantidad, 0);

  const add = (productId: number) => {
    const p = data.products.find((x) => x.id === productId)!;
    const n = Math.max(1, qty[productId] ?? 1);
    const disponible = p.stock - inCart(productId);
    if (n > disponible) {
      toast.error(`Solo quedan ${disponible} unidades disponibles de ${p.nombre}`);
      return;
    }
    setCart((c) =>
      c.some((l) => l.productId === productId)
        ? c.map((l) => (l.productId === productId ? { ...l, cantidad: l.cantidad + n } : l))
        : [...c, { productId, cantidad: n }],
    );
    setQty((q) => ({ ...q, [productId]: 1 }));
  };

  const setLine = (productId: number, cantidad: number) => {
    const p = data.products.find((x) => x.id === productId)!;
    if (cantidad > p.stock) { toast.error(`Stock máximo: ${p.stock}`); return; }
    setCart((c) =>
      cantidad <= 0
        ? c.filter((l) => l.productId !== productId)
        : c.map((l) => (l.productId === productId ? { ...l, cantidad } : l)),
    );
  };

  const confirm = () => {
    const res = confirmSale(data, {
      lines: cart,
      clienteDni: clientDni,
      medioPago: pago,
      vendedor: role ? ROLES[role].operador : "Mostrador",
    });
    if (!res.ok) { toast.error(res.error); return; }
    setData(() => res.data.data);
    setTicket(res.data.sale);
    toast.success(`Venta #${res.data.sale.id} confirmada · ${money(res.data.sale.total)}`);
    setCart([]);
    setClientDni(null);
    setClientQuery("");
    setPago("Efectivo");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="panel flex min-h-0 flex-col">
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results.length === 1) add(results[0]!.id);
              }}
              placeholder="Buscar por código o nombre (Enter agrega si hay un único resultado)"
              className="h-11 pl-9 text-base"
              autoFocus
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Cód.</th>
                <th className="px-4 py-2 font-medium">Producto</th>
                <th className="px-4 py-2 text-right font-medium">Stock</th>
                <th className="px-4 py-2 text-right font-medium">Precio</th>
                <th className="px-4 py-2 text-right font-medium">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {results.map((p) => {
                const disponible = p.stock - inCart(p.id);
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {String(p.id).padStart(4, "0")}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{p.nombre}</div>
                      <div className="text-xs text-muted-foreground">{p.categoria}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      <span className={cn(isLowStock(p) && "font-semibold text-destructive")}>{disponible}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">{money(p.precio)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={disponible}
                          value={qty[p.id] ?? 1}
                          onChange={(e) => setQty({ ...qty, [p.id]: Number(e.target.value) })}
                          className="h-8 w-16 text-right font-mono"
                          aria-label={`Cantidad de ${p.nombre}`}
                          disabled={disponible <= 0}
                        />
                        <Button size="sm" onClick={() => add(p.id)} disabled={disponible <= 0}>
                          <Plus /> Agregar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No hay productos que coincidan con “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="panel flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="size-4 text-primary" /> Venta actual
          </div>
          <Badge variant="secondary" className="font-mono">
            {unidades} u.
          </Badge>
        </div>

        <div className="space-y-2 border-b p-4">
          <Label className="text-xs text-muted-foreground">Cliente</Label>
          {selectedClient ? (
            <div className="flex items-center justify-between rounded-md border bg-accent/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <UserRound className="size-4 text-primary" />
                <div className="leading-tight">
                  <div className="text-sm font-medium">{selectedClient.nombre}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    DNI {selectedClient.dni} · {selectedClient.telefono}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setClientDni(null)} aria-label="Quitar cliente">
                <X />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  placeholder="DNI o nombre · vacío = Consumidor final"
                  className="h-9"
                />
                <Button variant="outline" size="icon" onClick={() => setNewClientOpen(true)} aria-label="Nuevo cliente">
                  <UserPlus />
                </Button>
              </div>
              {clientQuery && (
                <div className="absolute inset-x-0 top-full z-10 mt-1 rounded-md border bg-popover shadow-md">
                  {clientMatches.map((c) => (
                    <button
                      key={c.dni}
                      type="button"
                      onClick={() => {
                        setClientDni(c.dni);
                        setClientQuery("");
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span>{c.nombre}</span>
                      <span className="font-mono text-xs text-muted-foreground">{c.dni}</span>
                    </button>
                  ))}
                  {clientMatches.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setNewClientOpen(true)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-muted"
                    >
                      <UserPlus className="size-4" /> Registrar nuevo cliente
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="min-h-40 flex-1 divide-y overflow-y-auto">
          {lines.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              Agregá productos desde la lista para comenzar la venta.
            </div>
          )}
          {lines.map((l) => (
            <div key={l.productId} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium leading-snug">{l.p.nombre}</div>
                <button
                  type="button"
                  onClick={() => setLine(l.productId, 0)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Quitar ${l.p.nombre}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="size-7" onClick={() => setLine(l.productId, l.cantidad - 1)} aria-label="Restar">
                    <Minus />
                  </Button>
                  <span className="w-8 text-center font-mono text-sm">{l.cantidad}</span>
                  <Button variant="outline" size="icon" className="size-7" onClick={() => setLine(l.productId, l.cantidad + 1)} aria-label="Sumar">
                    <Plus />
                  </Button>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">x {money(l.p.precio)}</span>
                </div>
                <span className="font-mono text-sm font-medium">{money(l.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs text-muted-foreground">Medio de pago</Label>
            <Select value={pago} onValueChange={(v) => setPago(v as PaymentMethod)}>
              <SelectTrigger className="h-8 w-40 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGOS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-mono text-3xl font-semibold">{money(total)}</span>
          </div>
          <Button className="h-11 w-full text-base" disabled={lines.length === 0} onClick={confirm}>
            Confirmar venta
          </Button>
          {lines.length > 0 && (
            <Button variant="ghost" className="w-full" onClick={() => setCart([])}>
              Cancelar venta
            </Button>
          )}
        </div>
      </aside>

      <ClientFormDialog
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
        initialDni={/^\d+$/.test(clientQuery) ? clientQuery : ""}
        onCreated={(c) => {
          setClientDni(c.dni);
          setClientQuery("");
        }}
      />
      <TicketDialog
        sale={ticket}
        onClose={() => {
          setTicket(null);
          searchRef.current?.focus();
        }}
      />
    </div>
  );
}
