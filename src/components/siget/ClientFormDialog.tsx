import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addClient } from "@/lib/siget/logic";
import { useSiget } from "@/lib/siget/store";
import type { Client } from "@/lib/siget/types";

export function ClientFormDialog({
  open,
  onOpenChange,
  initialDni = "",
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialDni?: string;
  onCreated?: (c: Client) => void;
}) {
  const { data, setData } = useSiget();
  const [form, setForm] = useState<Client>({ dni: initialDni, nombre: "", telefono: "" });
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addClient(data, form);
    if (!res.ok) { setError(res.error); return; }
    setData(() => res.data);
    const created = res.data.clients[res.data.clients.length - 1]!;
    toast.success(`Cliente ${created.nombre} registrado`);
    onCreated?.(created);
    setForm({ dni: "", nombre: "", telefono: "" });
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setForm({ dni: initialDni, nombre: "", telefono: "" });
        setError(null);
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="c-dni">DNI</Label>
            <Input
              id="c-dni"
              inputMode="numeric"
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value })}
              placeholder="Ej: 30123456"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-nombre">Nombre y apellido</Label>
            <Input
              id="c-nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-tel">Teléfono</Label>
            <Input
              id="c-tel"
              inputMode="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar cliente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
