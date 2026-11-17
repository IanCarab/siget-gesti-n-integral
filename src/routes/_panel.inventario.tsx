import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Eye, Pencil, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dateTime, money } from "@/lib/format";
import { pageHead } from "@/lib/siget/head";
import { addProduct, isLowStock, registerStockMovement, updateProduct } from "@/lib/siget/logic";
import { ROLES } from "@/lib/siget/roles";
import { useSiget } from "@/lib/siget/store";
import type { Product } from "@/lib/siget/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_panel/inventario")({
  head: () => pageHead("Inventario", "Catálogo de insumos y repuestos con control de entradas y salidas."),
  component: Inventario,
});

type MovState = { product: Product; tipo: "Entrada" | "Salida" } | null;

function Inventario() {
  const { data, setData, role } = useSiget();
  const gestiona = role ? ROLES[role].gestionaInventario : false;
  const usuario = role ? ROLES[role].operador : "";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todas");
  const [soloBajo, setSoloBajo] = useState(false);
  const [mov, setMov] = useState<MovState>(null);
  const [edit, setEdit] = useState<Product | "new" | null>(null);

  const categorias = useMemo(() => Array.from(new Set(data.products.map((p) => p.categoria))).sort(), [data.products]);
  const list = data.products.filter((p) => {
    const s = q.trim().toLowerCase();
    return (
      (!s || String(p.id) === s || p.nombre.toLowerCase().includes(s)) &&
      (cat === "todas" || p.categoria === cat) &&
      (!soloBajo || isLowStock(p))
    );
  });
  const bajos = data.products.filter(isLowStock).length;
  const valor = data.products.reduce((s, p) => s + p.stock * p.precio, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Artículos" value={String(data.products.length)} />
        <Kpi label="Unidades en stock" value={String(data.products.reduce((s, p) => s + p.stock, 0))} />
        <Kpi label="Valor de inventario" value={money(valor)} />
        <Kpi label="Stock bajo" value={String(bajos)} alert={bajos > 0} />
      </div>

      <Tabs defaultValue="catalogo">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
            <TabsTrigger value="movimientos">Entradas y salidas</TabsTrigger>
          </TabsList>
          {gestiona ? (
            <Button onClick={() => setEdit("new")}>
              <Plus /> Nuevo artículo
            </Button>
          ) : (
            <Badge variant="outline" className="gap-1.5 py-1">
              <Eye className="size-3.5" /> Solo lectura
            </Badge>
          )}
        </div>

        <TabsContent value="catalogo" className="panel mt-3">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por ID o nombre" className="pl-9" />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant={soloBajo ? "default" : "outline"} onClick={() => setSoloBajo(!soloBajo)}>
              <AlertTriangle /> Stock bajo
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">ID</th>
                  <th className="px-4 py-2 font-medium">Nombre</th>
                  <th className="px-4 py-2 font-medium">Categoría</th>
                  <th className="px-4 py-2 text-right font-medium">Stock actual</th>
                  <th className="px-4 py-2 text-right font-medium">Mínimo</th>
                  <th className="px-4 py-2 text-right font-medium">Precio unitario</th>
                  {gestiona && <th className="px-4 py-2 text-right font-medium">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-2.5 font-medium">{p.nombre}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary">{p.categoria}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={cn("font-mono font-semibold", isLowStock(p) && "text-destructive")}>{p.stock}</span>
                      {isLowStock(p) && <AlertTriangle className="ml-1.5 inline size-3.5 text-destructive" aria-label="Stock bajo" />}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{p.stockMinimo}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{money(p.precio)}</td>
                    {gestiona && (
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => setMov({ product: p, tipo: "Entrada" })}>
                            <ArrowDownToLine /> Entrada
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setMov({ product: p, tipo: "Salida" })}>
                            <ArrowUpFromLine /> Salida
                          </Button>
                          <Button size="icon" variant="ghost" className="size-8" onClick={() => setEdit(p)} aria-label={`Editar ${p.nombre}`}>
                            <Pencil />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      Sin artículos para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="movimientos" className="panel mt-3">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Fecha</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Artículo</th>
                <th className="px-4 py-2 text-right font-medium">Cantidad</th>
                <th className="px-4 py-2 font-medium">Motivo</th>
                <th className="px-4 py-2 font-medium">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {data.movements.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2.5 whitespace-nowrap font-mono text-xs text-muted-foreground">{dateTime(m.fecha)}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", m.tipo === "Entrada" ? "text-success" : "text-destructive")}>
                      {m.tipo === "Entrada" ? <ArrowDownToLine className="size-3.5" /> : <ArrowUpFromLine className="size-3.5" />}
                      {m.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">{m.productoNombre}</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {m.tipo === "Entrada" ? "+" : "−"}
                    {m.cantidad}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{m.motivo}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{m.usuario}</td>
                </tr>
              ))}
              {data.movements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Todavía no hay movimientos. Las ventas, repuestos usados en el taller y ajustes de depósito aparecen aquí.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TabsContent>
      </Tabs>

      <MovementDialog
        state={mov}
        onClose={() => setMov(null)}
        onSubmit={(cantidad, motivo) => {
          if (!mov) return;
          const res = registerStockMovement(data, { productId: mov.product.id, tipo: mov.tipo, cantidad, motivo, usuario });
          if (!res.ok) { toast.error(res.error); return; }
          setData(() => res.data);
          toast.success(`${mov.tipo} registrada: ${cantidad} × ${mov.product.nombre}`);
          setMov(null);
        }}
      />
      <ProductDialog
        value={edit}
        categorias={categorias}
        onClose={() => setEdit(null)}
        onSubmit={(p) => {
          if (edit === "new") {
            const res = addProduct(data, p);
            if (!res.ok) { toast.error(res.error); return; }
            setData(() => res.data);
            toast.success("Artículo agregado al catálogo");
          } else if (edit) {
            setData((d) => updateProduct(d, edit.id, { nombre: p.nombre, categoria: p.categoria, precio: p.precio, stockMinimo: p.stockMinimo }));
            toast.success("Artículo actualizado");
          }
          setEdit(null);
        }}
      />
    </div>
  );
}

function Kpi({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={cn("panel px-4 py-3", alert && "border-destructive/40")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-xl font-semibold", alert && "text-destructive")}>{value}</div>
    </div>
  );
}

function MovementDialog({
  state,
  onClose,
  onSubmit,
}: {
  state: MovState;
  onClose: () => void;
  onSubmit: (cantidad: number, motivo: string) => void;
}) {
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState("");
  return (
    <Dialog
      open={!!state}
      onOpenChange={(o) => {
        if (!o) onClose();
        setCantidad(1);
        setMotivo("");
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar {state?.tipo.toLowerCase()} de mercadería</DialogTitle>
        </DialogHeader>
        {state && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(cantidad, motivo);
              setCantidad(1);
              setMotivo("");
            }}
          >
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <div className="font-medium">{state.product.nombre}</div>
              <div className="font-mono text-xs text-muted-foreground">Stock actual: {state.product.stock}</div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-cant">Cantidad</Label>
              <Input id="m-cant" type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} className="font-mono" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-mot">Motivo / Comprobante</Label>
              <Input
                id="m-mot"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder={state.tipo === "Entrada" ? "Ej: Remito proveedor 0003-1234" : "Ej: Rotura, ajuste de inventario"}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Registrar {state.tipo.toLowerCase()}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProductDialog({
  value,
  categorias,
  onClose,
  onSubmit,
}: {
  value: Product | "new" | null;
  categorias: string[];
  onClose: () => void;
  onSubmit: (p: Omit<Product, "id">) => void;
}) {
  const isNew = value === "new";
  const editing = value && value !== "new" ? value : null;
  const initial = value && value !== "new" ? value : { nombre: "", categoria: categorias[0] ?? "", stock: 0, precio: 0, stockMinimo: 5 };
  const [f, setF] = useState(initial);
  const key = value === "new" ? "new" : value?.id;

  return (
    <Dialog
      open={!!value}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-md" key={String(key)} onOpenAutoFocus={() => setF(initial)}>
        <DialogHeader>
          <DialogTitle>{isNew ? "Nuevo artículo" : `Editar artículo #${editing?.id ?? ""}`}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ ...f, precio: Number(f.precio), stock: Number(f.stock), stockMinimo: Number(f.stockMinimo) });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="p-nom">Nombre</Label>
            <Input id="p-nom" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-cat">Categoría</Label>
            <Input id="p-cat" list="cats" value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} />
            <datalist id="cats">
              {categorias.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-pre">Precio</Label>
              <Input id="p-pre" type="number" min={0} value={f.precio} onChange={(e) => setF({ ...f, precio: Number(e.target.value) })} className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-min">Stock mín.</Label>
              <Input id="p-min" type="number" min={0} value={f.stockMinimo} onChange={(e) => setF({ ...f, stockMinimo: Number(e.target.value) })} className="font-mono" />
            </div>
            {isNew && (
              <div className="space-y-1.5">
                <Label htmlFor="p-stk">Stock inicial</Label>
                <Input id="p-stk" type="number" min={0} value={f.stock} onChange={(e) => setF({ ...f, stock: Number(e.target.value) })} className="font-mono" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
