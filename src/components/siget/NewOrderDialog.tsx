import { useState } from "react";
import { toast } from "sonner";

import { ClientFormDialog } from "@/components/siget/ClientFormDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createOrder } from "@/lib/siget/logic";
import { useSiget } from "@/lib/siget/store";

const TIPOS = ["Notebook", "PC de Escritorio", "Impresora", "Monitor", "Celular", "Tablet", "Otro"];

export function NewOrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data, setData } = useSiget();
  const empty = { clienteDni: "", tipoEquipo: "Notebook", marca: "", modelo: "", falla: "", manoDeObra: 0 };
  const [f, setF] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [newClient, setNewClient] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = data.clients.find((c) => c.dni === f.clienteDni);
    const res = createOrder(data, {
      clienteDni: client?.dni ?? null,
      clienteNombre: client?.nombre ?? "",
      tipoEquipo: f.tipoEquipo,
      marca: f.marca,
      modelo: f.modelo,
      falla: f.falla,
      manoDeObra: Number(f.manoDeObra) || 0,
    });
    if (!res.ok) { setError(res.error); return; }
    setData(() => res.data.data);
    toast.success(`Orden #${res.data.order.id} ingresada al taller`);
    setF(empty);
    setError(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva orden de reparación</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <div className="flex gap-2">
                <Select value={f.clienteDni} onValueChange={(v) => setF({ ...f, clienteDni: v })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.clients.map((c) => (
                      <SelectItem key={c.dni} value={c.dni}>
                        {c.nombre} · {c.dni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={() => setNewClient(true)}>
                  Nuevo
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de equipo</Label>
                <Select value={f.tipoEquipo} onValueChange={(v) => setF({ ...f, tipoEquipo: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-marca">Marca</Label>
                <Input id="o-marca" value={f.marca} onChange={(e) => setF({ ...f, marca: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-modelo">Modelo</Label>
                <Input id="o-modelo" value={f.modelo} onChange={(e) => setF({ ...f, modelo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-falla">Falla declarada</Label>
              <Textarea id="o-falla" rows={3} value={f.falla} onChange={(e) => setF({ ...f, falla: e.target.value })} placeholder="Lo que informa el cliente" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-mo">Presupuesto inicial (mano de obra)</Label>
              <Input
                id="o-mo"
                type="number"
                min={0}
                step={500}
                value={f.manoDeObra}
                onChange={(e) => setF({ ...f, manoDeObra: Number(e.target.value) })}
                className="font-mono"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Ingresar equipo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ClientFormDialog open={newClient} onOpenChange={setNewClient} onCreated={(c) => setF((x) => ({ ...x, clienteDni: c.dni }))} />
    </>
  );
}
