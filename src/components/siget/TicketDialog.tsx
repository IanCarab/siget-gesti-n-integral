import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dateTime, money } from "@/lib/format";
import { useSiget } from "@/lib/siget/store";
import type { Sale } from "@/lib/siget/types";

export function TicketDialog({ sale, onClose }: { sale: Sale | null; onClose: () => void }) {
  const { data } = useSiget();
  const client = sale?.clienteDni ? data.clients.find((c) => c.dni === sale.clienteDni) : null;
  return (
    <Dialog open={!!sale} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Comprobante de venta</DialogTitle>
        </DialogHeader>
        {sale && (
          <div className="print-area rounded-md border border-dashed bg-background p-4 font-mono text-xs">
            <div className="text-center">
              <div className="text-sm font-semibold tracking-[0.2em]">SIGET</div>
              <div className="text-muted-foreground">Remito X · Documento no válido como factura</div>
            </div>
            <div className="my-3 border-t border-dashed" />
            <div className="flex justify-between">
              <span>Remito N°</span>
              <span>0001-{String(sale.id).padStart(8, "0")}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha</span>
              <span>{dateTime(sale.fecha)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cliente</span>
              <span className="text-right">{sale.clienteNombre}</span>
            </div>
            {client && (
              <div className="flex justify-between">
                <span>DNI</span>
                <span>{client.dni}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Atendió</span>
              <span>{sale.vendedor}</span>
            </div>
            <div className="my-3 border-t border-dashed" />
            {sale.items.map((i) => (
              <div key={i.productId} className="mb-1.5">
                <div>{i.nombre}</div>
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {i.cantidad} x {money(i.precioUnitario)}
                  </span>
                  <span className="text-foreground">{money(i.cantidad * i.precioUnitario)}</span>
                </div>
              </div>
            ))}
            <div className="my-3 border-t border-dashed" />
            <div className="flex justify-between text-sm font-semibold">
              <span>TOTAL</span>
              <span>{money(sale.total)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Medio de pago</span>
              <span>{sale.medioPago}</span>
            </div>
            <div className="mt-3 text-center text-muted-foreground">¡Gracias por su compra!</div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={() => window.print()}>
            <Printer /> Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
