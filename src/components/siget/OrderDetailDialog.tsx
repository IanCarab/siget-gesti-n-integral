import { PackagePlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { dateTime, money } from "@/lib/format";
import { assignPart, moveOrder, orderTotal, removePart, updateOrder } from "@/lib/siget/logic";
import { ROLES } from "@/lib/siget/roles";
import { useSiget } from "@/lib/siget/store";
import { ORDER_STATES, type OrderState } from "@/lib/siget/types";

export function OrderDetailDialog({ orderId, onClose }: { orderId: number | null; onClose: () => void }) {
  const { data, setData, role } = useSiget();
  const order = data.orders.find((o) => o.id === orderId) ?? null;
  const [partId, setPartId] = useState<string>("");
  const [partQty, setPartQty] = useState(1);
  const [mo, setMo] = useState(0);
  const [notas, setNotas] = useState("");
  const usuario = role ? ROLES[role].operador : "Taller";
  const client = order?.clienteDni ? data.clients.find((c) => c.dni === order.clienteDni) : null;
  const locked = order?.estado === "Entregado";

  useEffect(() => {
    if (order) {
      setMo(order.manoDeObra);
      setNotas(order.notas);
      setPartId("");
      setPartQty(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!order) return null;
  const repuestosTotal = order.repuestos.reduce((s, r) => s + r.cantidad * r.precioUnitario, 0);

  const add = () => {
    if (!partId) { toast.error("Elegí un repuesto del inventario"); return; }
    const res = assignPart(data, { orderId: order.id, productId: Number(partId), cantidad: partQty, usuario });
    if (!res.ok) { toast.error(res.error); return; }
    setData(() => res.data);
    toast.success("Repuesto asignado y descontado del stock");
    setPartId("");
    setPartQty(1);
  };

  const remove = (productId: number) => {
    const res = removePart(data, { orderId: order.id, productId, usuario });
    if (!res.ok) { toast.error(res.error); return; }
    setData(() => res.data);
    toast("Repuesto devuelto al stock");
  };

  const saveBudget = () => {
    setData((d) => updateOrder(d, order.id, { manoDeObra: Math.max(0, Number(mo) || 0), notas }));
    toast.success("Presupuesto actualizado");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono">Orden #{order.id}</span>
            <Badge variant="outline">{order.estado}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 rounded-md border bg-muted/40 p-4 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">Cliente</div>
            <div className="font-medium">{order.clienteNombre}</div>
            <div className="font-mono text-xs text-muted-foreground">
              {client ? `DNI ${client.dni} · ${client.telefono}` : "Sin ficha registrada"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Equipo</div>
            <div className="font-medium">
              {order.tipoEquipo} {order.marca} {order.modelo !== "—" ? order.modelo : ""}
            </div>
            <div className="text-xs text-muted-foreground">Ingreso {dateTime(order.fechaIngreso)}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground">Falla declarada</div>
            <div>{order.falla}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-xs text-muted-foreground">Estado</Label>
          <Select
            value={order.estado}
            onValueChange={(v) => {
              setData((d) => moveOrder(d, order.id, v as OrderState));
              toast(`Orden #${order.id} → ${v}`);
            }}
          >
            <SelectTrigger className="h-8 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Repuestos asignados</h3>
          <div className="rounded-md border">
            {order.repuestos.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground">Todavía no se asignaron repuestos.</p>
            )}
            {order.repuestos.map((r) => (
              <div key={r.productId} className="flex items-center justify-between gap-3 border-b px-3 py-2 text-sm last:border-0">
                <span>
                  {r.nombre} <span className="font-mono text-xs text-muted-foreground">× {r.cantidad}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-mono">{money(r.cantidad * r.precioUnitario)}</span>
                  {!locked && (
                    <button type="button" onClick={() => remove(r.productId)} className="text-muted-foreground hover:text-destructive" aria-label={`Quitar ${r.nombre}`}>
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
          {!locked && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Select value={partId} onValueChange={setPartId}>
                <SelectTrigger className="min-w-64 flex-1">
                  <SelectValue placeholder="Elegir repuesto del inventario" />
                </SelectTrigger>
                <SelectContent>
                  {data.products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} disabled={p.stock === 0}>
                      {p.nombre} · {money(p.precio)} · stock {p.stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" min={1} value={partQty} onChange={(e) => setPartQty(Number(e.target.value))} className="w-20 font-mono" aria-label="Cantidad de repuesto" />
              <Button variant="secondary" onClick={add}>
                <PackagePlus /> Asignar
              </Button>
            </div>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="mo">Mano de obra</Label>
            <Input id="mo" type="number" min={0} step={500} value={mo} onChange={(e) => setMo(Number(e.target.value))} className="font-mono" disabled={locked} />
            <Label htmlFor="notas" className="pt-2">Notas técnicas</Label>
            <Textarea id="notas" rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} disabled={locked} placeholder="Diagnóstico, trabajo realizado…" />
            {!locked && (
              <Button variant="outline" size="sm" onClick={saveBudget}>
                Guardar presupuesto
              </Button>
            )}
          </div>
          <div className="space-y-2 rounded-md border bg-muted/40 p-4 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mano de obra</span>
              <span>{money(order.manoDeObra)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Repuestos</span>
              <span>{money(repuestosTotal)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-semibold">
              <span>Presupuesto</span>
              <span>{money(orderTotal(order))}</span>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
