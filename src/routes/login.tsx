import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Box, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardList,
  Clock3, Computer, CreditCard, DollarSign, Eye, EyeOff, HardDrive, LayoutDashboard,
  Laptop, LogOut, Menu, Monitor, MoreHorizontal, Package, Plus, Search, Settings2,
  ShoppingCart, TrendingUp, UserRound, Users, Wrench, X,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Siget | Gestión de tecnología y servicio técnico" },
    { name: "description", content: "Panel de gestión para ventas, inventario y reparaciones de computadoras." },
    { property: "og:title", content: "Siget | Gestión de tecnología y servicio técnico" },
    { property: "og:description", content: "Panel de gestión para ventas, inventario y reparaciones de computadoras." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: App,
});

type Screen = "inicio" | "servicio" | "inventario" | "venta" | "reportes";
type Role = "Administrador" | "Técnico" | "Ventas";
type Repair = { id: string; model: string; customer: string; issue: string; date: string; priority: "Alta" | "Media" | "Baja"; status: number; initials: string };
type Product = { code: string; name: string; category: string; stock: number; price: number; icon: "ram" | "board" | "cable" | "ssd" };
const stages = ["Nuevo Ingreso", "En Diagnóstico", "Esperando Repuestos", "En Reparación", "Listo para Entregar"];
const initialRepairs: Repair[] = [
  { id: "ST-1042", model: "MacBook Pro 14”", customer: "Martín González", issue: "No enciende / revisión de placa", date: "Hoy, 09:24", priority: "Alta", status: 0, initials: "MG" },
  { id: "ST-1041", model: "Lenovo ThinkPad T14", customer: "Laura Fernández", issue: "Pantalla sin imagen", date: "Hoy, 08:45", priority: "Media", status: 0, initials: "LF" },
  { id: "ST-1038", model: "Dell Inspiron 15", customer: "Carlos Ruiz", issue: "Sobrecalentamiento", date: "Ayer, 16:32", priority: "Media", status: 1, initials: "CR" },
  { id: "ST-1036", model: "HP Pavilion Gaming", customer: "Lucía Torres", issue: "Diagnóstico de disco", date: "Ayer, 11:15", priority: "Baja", status: 1, initials: "LT" },
  { id: "ST-1033", model: "ASUS VivoBook 15", customer: "Diego Pérez", issue: "Cambio de pantalla", date: "28 sep, 14:20", priority: "Alta", status: 2, initials: "DP" },
  { id: "ST-1031", model: "Acer Aspire 5", customer: "Sofía Ramírez", issue: "Reemplazo de batería", date: "27 sep, 10:10", priority: "Media", status: 2, initials: "SR" },
  { id: "ST-1028", model: "PC de escritorio", customer: "Pedro Molina", issue: "Instalación de SSD y sistema", date: "26 sep, 15:40", priority: "Baja", status: 3, initials: "PM" },
  { id: "ST-1024", model: "MacBook Air M1", customer: "Ana López", issue: "Reparación de teclado", date: "25 sep, 09:10", priority: "Media", status: 3, initials: "AL" },
  { id: "ST-1019", model: "Samsung Galaxy Book", customer: "Nicolás Castro", issue: "Mantenimiento general", date: "24 sep, 13:05", priority: "Baja", status: 4, initials: "NC" },
];
const initialProducts: Product[] = [
  { code: "RAM-001", name: "Memoria RAM Kingston Fury 16GB DDR4", category: "Memorias", stock: 24, price: 45900, icon: "ram" },
  { code: "SSD-002", name: "Disco SSD Samsung 870 EVO 500GB", category: "Almacenamiento", stock: 18, price: 68500, icon: "ssd" },
  { code: "MB-003", name: "Placa madre ASUS Prime B550M-A", category: "Placas madre", stock: 7, price: 149900, icon: "board" },
  { code: "CAB-004", name: "Cable HDMI 2.1 de 2 metros", category: "Cables", stock: 42, price: 12500, icon: "cable" },
  { code: "RAM-005", name: "Memoria RAM Crucial 8GB DDR4", category: "Memorias", stock: 13, price: 28900, icon: "ram" },
  { code: "SSD-006", name: "Disco SSD WD Blue SN580 1TB NVMe", category: "Almacenamiento", stock: 5, price: 109000, icon: "ssd" },
  { code: "MB-007", name: "Placa madre Gigabyte H610M H", category: "Placas madre", stock: 3, price: 112000, icon: "board" },
  { code: "CAB-008", name: "Cable USB-C a USB-C 1 metro", category: "Cables", stock: 36, price: 8900, icon: "cable" },
];
const chartData = [
  { day: "Lun", income: 225000 }, { day: "Mar", income: 305000 }, { day: "Mié", income: 273000 },
  { day: "Jue", income: 380000 }, { day: "Vie", income: 341000 }, { day: "Sáb", income: 462000 },
  { day: "Dom", income: 415000 },
];
const money = (n: number) => "$" + n.toLocaleString("es-AR");
const navigation: { id: Screen; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "inicio", label: "Inicio", icon: LayoutDashboard },
  { id: "venta", label: "Punto de Venta", icon: ShoppingCart },
  { id: "servicio", label: "Servicio Técnico", icon: Wrench },
  { id: "inventario", label: "Inventario", icon: Package },
  { id: "reportes", label: "Reportes", icon: Activity },
];
const roleAccess: Record<Role, Screen[]> = {
  Administrador: ["inicio", "venta", "servicio", "inventario", "reportes"],
  Técnico: ["servicio", "inventario"],
  Ventas: ["venta", "inventario"],
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("Administrador");
  const [screen, setScreen] = useState<Screen>("inicio");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [repairs, setRepairs] = useState(initialRepairs);
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [modal, setModal] = useState<"repair" | "product" | "sale" | null>(null);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [newRepair, setNewRepair] = useState({ model: "", customer: "", issue: "" });
  const [newProduct, setNewProduct] = useState({ code: "", name: "", stock: "", price: "", category: "Otros" });
  const [saleProduct, setSaleProduct] = useState("");
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const filteredProducts = useMemo(() => products.filter(p => (category === "Todos" || p.category === category) && `${p.code} ${p.name}`.toLowerCase().includes(query.toLowerCase())), [products, category, query]);
  const selectedSaleProduct = products.find(p => p.code === saleProduct);
  const go = (next: Screen) => { if (!roleAccess[role].includes(next)) return; setScreen(next); setSidebarOpen(false); setQuery(""); setCategory("Todos"); };
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3500); };
  const openModal = (next: "repair" | "product" | "sale") => {
    if (next === "product" && role !== "Administrador") return;
    if (next === "sale" && role === "Técnico") return;
    setModal(next);
  };
  const moveRepair = (item: Repair, status: number) => {
    if (role === "Ventas") return;
    setRepairs(current => current.map(r => r.id === item.id ? { ...r, status } : r));
    setSelectedRepair({ ...item, status });
    notify(`${item.id} movido a ${stages[status]}`);
  };
  const addRepair = (event: React.FormEvent) => {
    event.preventDefault();
    const id = `ST-${1043 + repairs.length - initialRepairs.length}`;
    setRepairs(current => [{ id, model: newRepair.model, customer: newRepair.customer, issue: newRepair.issue, date: "Hoy, recién ingresado", priority: "Media", status: 0, initials: newRepair.customer.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join("").toUpperCase() }, ...current]);
    setNewRepair({ model: "", customer: "", issue: "" }); setModal(null); notify(`${id} ingresado correctamente`);
  };
  const addProduct = (event: React.FormEvent) => {
    event.preventDefault();
    if (role !== "Administrador") return;
    if (products.some(p => p.code.toLowerCase() === newProduct.code.toLowerCase())) { notify("Ese código ya existe"); return; }
    setProducts(current => [...current, { code: newProduct.code, name: newProduct.name, category: newProduct.category, stock: Number(newProduct.stock), price: Number(newProduct.price), icon: "ssd" }]);
    setNewProduct({ code: "", name: "", stock: "", price: "", category: "Otros" }); setModal(null); notify("Producto agregado al inventario");
  };
  const completeSale = (event: React.FormEvent) => {
    event.preventDefault();
    if (role === "Técnico") return;
    if (!selectedSaleProduct || selectedSaleProduct.stock < saleQuantity) { notify("Stock insuficiente para esta venta"); return; }
    setProducts(current => current.map(p => p.code === saleProduct ? { ...p, stock: p.stock - saleQuantity } : p));
    setModal(null); setSaleProduct(""); setSaleQuantity(1); notify(`Venta registrada por ${money(selectedSaleProduct.price * saleQuantity)}`);
  };

  if (!loggedIn) return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="h-1.5 bg-primary" />
      <header className="px-7 lg:px-12 py-7 flex items-center justify-between">
        <Brand />
        <span className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-success" /> Sistema local · Modo demostración</span>
      </header>
      <div className="flex-1 flex items-center justify-center px-5 pb-16 pt-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-9 text-center">
            <div className="mx-auto mb-6 size-14 rounded-lg bg-soft-blue flex items-center justify-center text-primary"><Monitor size={27} strokeWidth={1.8} /></div>
            <h1 className="text-[29px] font-bold text-foreground">Bienvenido a Siget</h1>
            <p className="mt-2 text-sm text-muted-foreground">Ingresá a tu espacio de trabajo</p>
          </div>
          <div className="app-panel p-7 sm:p-9 shadow-[0_16px_48px_-30px_var(--foreground)]">
            <div className="mb-7"><h2 className="text-lg font-bold">Iniciar sesión</h2><p className="mt-1 text-xs text-muted-foreground">Accedé al sistema de gestión</p></div>
            <form onSubmit={e => { e.preventDefault(); if (user.trim() && password.trim()) { setLoggedIn(true); setScreen(role === "Administrador" ? "inicio" : role === "Técnico" ? "servicio" : "venta"); } }} className="space-y-5">
              <div><label htmlFor="user" className="app-label block mb-2">Usuario</label><Input id="user" value={user} onChange={e => setUser(e.target.value)} placeholder="Ingresá tu usuario" required className="h-11 bg-surface" /></div>
              <div><div className="flex justify-between mb-2"><label htmlFor="password" className="app-label">Contraseña</label></div><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Ingresá tu contraseña" required className="h-11 bg-surface pr-11" /><Button type="button" variant="ghost" size="icon" title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1 size-9 text-muted-foreground">{showPassword ? <EyeOff /> : <Eye />}</Button></div></div>
              <Button type="submit" className="w-full h-11 text-sm mt-1">Ingresar <ArrowRight size={16} /></Button>
            </form>
            <div className="border-t mt-8 pt-6"><p className="app-kicker text-center mb-4">Elegí tu rol</p><div className="grid grid-cols-3 gap-2">{(["Administrador", "Técnico", "Ventas"] as Role[]).map((r) => { const Icon = r === "Administrador" ? Users : r === "Técnico" ? Wrench : ShoppingCart; return <Button key={r} type="button" variant="ghost" onClick={() => setRole(r)} className={`h-auto py-2.5 px-1 flex-col gap-2 border ${role === r ? "border-primary bg-soft-blue text-primary" : "border-transparent text-muted-foreground hover:border-border"}`}><span className={`size-9 rounded-full flex items-center justify-center ${role === r ? "bg-card" : "bg-secondary"}`}><Icon size={16} /></span><span className="text-[10px] font-medium">{r}</span></Button>; })}</div></div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">Vista de demostración · Ingresá cualquier usuario y contraseña</p>
        </div>
      </div>
       <footer className="px-7 lg:px-12 py-5 flex justify-between text-[11px] text-muted-foreground border-t"><span>© 2026 Siget</span><span>Gestión simple para tu negocio</span></footer>
    </main>
  );

  return <div className="min-h-screen bg-background flex text-foreground">
    {sidebarOpen && <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    <aside className={`fixed lg:sticky top-0 z-40 h-screen w-[238px] shrink-0 border-r bg-card flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="h-[76px] px-6 border-b flex items-center"><Brand /></div>
       <div className="px-3 pt-7 flex-1"><p className="app-kicker px-3 mb-3">Espacio de trabajo</p><nav className="space-y-1">{navigation.filter(item => roleAccess[role].includes(item.id)).map(item => <Button key={item.id} variant="ghost" onClick={() => go(item.id)} className={`w-full justify-start h-10 px-3 gap-3 text-[13px] font-medium ${screen === item.id ? "bg-soft-blue text-primary hover:bg-soft-blue hover:text-primary" : "text-muted-foreground"}`}><item.icon size={17} strokeWidth={1.9} />{item.label}{item.id === "servicio" && <span className="ml-auto rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{repairs.filter(r => r.status !== 4).length}</span>}</Button>)}</nav>
         <p className="app-kicker px-3 mt-10 mb-3">Accesos rápidos</p><Button variant="ghost" onClick={() => openModal("repair")} className="w-full justify-start h-10 px-3 gap-3 text-[13px] font-medium text-muted-foreground"><Plus size={17} />Nueva reparación</Button>{role !== "Técnico" && <Button variant="ghost" onClick={() => openModal("sale")} className="w-full justify-start h-10 px-3 gap-3 text-[13px] font-medium text-muted-foreground"><CreditCard size={17} />Registrar venta</Button>}
      </div>
      <div className="p-3 border-t"><div className="flex items-center gap-3 px-2 py-2"><div className="size-9 bg-soft-blue text-primary rounded-full flex items-center justify-center text-xs font-bold">{user.slice(0, 2).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="text-xs font-bold truncate">{user}</p><p className="text-[11px] text-muted-foreground">{role}</p></div><Button size="icon" variant="ghost" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={() => { setLoggedIn(false); setPassword(""); }} className="text-muted-foreground"><LogOut size={16} /></Button></div></div>
    </aside>
    <div className="flex-1 min-w-0 flex flex-col">
      <header className="h-[76px] bg-card border-b flex items-center justify-between px-5 md:px-9 shrink-0"><div className="flex items-center gap-3"><Button size="icon" variant="ghost" aria-label="Abrir menú" className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu /></Button><div className="text-xs text-muted-foreground">Espacio de trabajo <span className="mx-2">/</span> <span className="font-semibold text-foreground">{navigation.find(n => n.id === screen)?.label}</span></div></div><div className="flex items-center gap-3 md:gap-5"><span className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground"><span className="size-2 rounded-full bg-success" /> Modo demostración</span><span className="hidden sm:block h-5 border-l" /><Button variant="ghost" size="icon" aria-label="Notificaciones" title="Sin notificaciones" className="text-muted-foreground"><Bell size={18} /></Button><div className="size-8 rounded-full bg-soft-blue text-primary text-xs font-bold flex items-center justify-center">{user.slice(0, 2).toUpperCase()}</div></div></header>
      <main className="flex-1 p-5 md:p-8 lg:p-9 max-w-[1700px] w-full mx-auto">
         {roleAccess[role].includes(screen) && <>
         {screen === "inicio" && <Dashboard go={go} repairs={repairs} products={products} openRepair={() => openModal("repair")} />}
         {screen === "servicio" && <ServiceBoard repairs={repairs} onAdd={() => openModal("repair")} onSelect={setSelectedRepair} />}
         {screen === "inventario" && <Inventory products={filteredProducts} allCount={products.length} query={query} setQuery={setQuery} category={category} setCategory={setCategory} onAdd={role === "Administrador" ? () => openModal("product") : undefined} onSale={role !== "Técnico" ? () => openModal("sale") : undefined} />}
         {screen === "venta" && <Sales products={products} onSale={() => openModal("sale")} go={go} />}
         {screen === "reportes" && <Reports repairs={repairs} products={products} />}
         </>}
      </main>
       <footer className="px-5 md:px-9 py-4 border-t text-[11px] text-muted-foreground flex justify-between bg-card"><span>© 2026 Siget · Sistema de gestión</span><span>Datos de demostración</span></footer>
    </div>
    {notice && <div role="status" className="fixed bottom-6 right-6 z-[60] bg-foreground text-background px-4 py-3 rounded-md shadow-lg text-sm flex items-center gap-2"><Check size={16} />{notice}</div>}
    <Dialog open={modal === "repair"} onOpenChange={open => !open && setModal(null)}><DialogContent className="rounded-lg"><DialogHeader><DialogTitle>Nueva reparación</DialogTitle><DialogDescription>Registrá un equipo en el taller.</DialogDescription></DialogHeader><form onSubmit={addRepair} className="space-y-4 mt-3"><Field label="Modelo del equipo" value={newRepair.model} onChange={value => setNewRepair({ ...newRepair, model: value })} placeholder="Ej. Lenovo ThinkPad T14" /><Field label="Cliente" value={newRepair.customer} onChange={value => setNewRepair({ ...newRepair, customer: value })} placeholder="Nombre y apellido" /><Field label="Problema reportado" value={newRepair.issue} onChange={value => setNewRepair({ ...newRepair, issue: value })} placeholder="Describí el problema" /><Button className="w-full mt-2" type="submit">Registrar ingreso</Button></form></DialogContent></Dialog>
    <Dialog open={modal === "product"} onOpenChange={open => !open && setModal(null)}><DialogContent className="rounded-lg"><DialogHeader><DialogTitle>Agregar producto</DialogTitle><DialogDescription>Sumá un artículo al stock local.</DialogDescription></DialogHeader><form onSubmit={addProduct} className="space-y-4 mt-3"><div className="grid grid-cols-2 gap-3"><Field label="Código" value={newProduct.code} onChange={value => setNewProduct({ ...newProduct, code: value })} placeholder="Ej. RAM-009" /><div><label className="app-label block mb-2">Categoría</label><select className="w-full h-9 rounded-md border bg-card px-3 text-sm" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>{["Otros", "Memorias", "Almacenamiento", "Placas madre", "Cables"].map(c => <option key={c}>{c}</option>)}</select></div></div><Field label="Nombre del producto" value={newProduct.name} onChange={value => setNewProduct({ ...newProduct, name: value })} placeholder="Nombre completo" /><div className="grid grid-cols-2 gap-3"><Field label="Stock local" value={newProduct.stock} onChange={value => setNewProduct({ ...newProduct, stock: value })} placeholder="0" type="number" min="0" /><Field label="Precio" value={newProduct.price} onChange={value => setNewProduct({ ...newProduct, price: value })} placeholder="0" type="number" min="0" /></div><Button className="w-full mt-2" type="submit">Guardar producto</Button></form></DialogContent></Dialog>
    <Dialog open={modal === "sale"} onOpenChange={open => !open && setModal(null)}><DialogContent className="rounded-lg"><DialogHeader><DialogTitle>Nueva venta</DialogTitle><DialogDescription>Seleccioná un producto para registrar una venta.</DialogDescription></DialogHeader><form onSubmit={completeSale} className="space-y-5 mt-3"><div><label htmlFor="sale-product" className="app-label block mb-2">Producto</label><select id="sale-product" required value={saleProduct} onChange={e => setSaleProduct(e.target.value)} className="w-full h-10 rounded-md border bg-card px-3 text-sm"><option value="">Seleccionar producto</option>{products.filter(p => p.stock > 0).map(p => <option key={p.code} value={p.code}>{p.name} · {money(p.price)}</option>)}</select></div><Field label="Cantidad" value={String(saleQuantity)} onChange={value => setSaleQuantity(Math.max(1, Number(value)))} type="number" min="1" max={selectedSaleProduct?.stock} /><div className="bg-secondary p-4 rounded-md flex items-center justify-between"><span className="text-sm text-muted-foreground">Total</span><strong className="text-xl">{money((selectedSaleProduct?.price || 0) * saleQuantity)}</strong></div><Button className="w-full" type="submit" disabled={!selectedSaleProduct || saleQuantity > (selectedSaleProduct?.stock || 0)}>Confirmar venta</Button></form></DialogContent></Dialog>
    <Dialog open={!!selectedRepair} onOpenChange={open => !open && setSelectedRepair(null)}><DialogContent className="rounded-lg"><DialogHeader><DialogTitle>{selectedRepair?.model}</DialogTitle><DialogDescription>{selectedRepair?.id} · {selectedRepair?.customer}</DialogDescription></DialogHeader>{selectedRepair && <div className="space-y-5 pt-3"><div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground text-xs mb-1">Problema reportado</p><p className="font-medium">{selectedRepair.issue}</p></div><div><p className="text-muted-foreground text-xs mb-1">Prioridad</p><Priority priority={selectedRepair.priority} /></div></div><div><p className="app-label mb-2">Estado actual</p><select aria-label="Estado de reparación" value={selectedRepair.status} onChange={e => moveRepair(selectedRepair, Number(e.target.value))} className="w-full h-10 rounded-md border bg-card px-3 text-sm">{stages.map((s, i) => <option key={s} value={i}>{s}</option>)}</select></div><div className="flex justify-end"><Button variant="outline" onClick={() => setSelectedRepair(null)}>Cerrar</Button></div></div>}</DialogContent></Dialog>
  </div>;
}

function Brand() { return <div className="flex items-center gap-2.5 select-none"><div className="size-9 bg-primary rounded-md flex items-center justify-center text-primary-foreground"><Computer size={20} strokeWidth={2.1} /></div><div className="leading-none"><div className="text-xl font-extrabold text-foreground">siget<span className="text-primary">.</span></div><div className="text-[9px] font-bold tracking-[.15em] text-muted-foreground mt-1">GESTIÓN TECNOLÓGICA</div></div></div>; }
function Field({ label, value, onChange, placeholder, type = "text", min, max }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; min?: string; max?: number | undefined }) { return <div><label className="app-label block mb-2">{label}</label><Input required type={type} min={min} max={max} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div>; }
function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8"><div><p className="app-kicker mb-2">{eyebrow}</p><h1 className="text-[26px] md:text-[30px] font-bold leading-tight">{title}</h1><p className="text-[13px] text-muted-foreground mt-2">{description}</p></div>{action}</div>; }
function Priority({ priority }: { priority: Repair["priority"] }) { const color = priority === "Alta" ? "bg-destructive/10 text-destructive" : priority === "Media" ? "bg-soft-warning text-warning" : "bg-soft-success text-success"; return <span className={`inline-flex px-2 py-1 text-[10px] font-semibold rounded ${color}`}>{priority}</span>; }
function Metric({ label, value, change, icon: Icon, tone = "blue" }: { label: string; value: string; change: string; icon: typeof DollarSign; tone?: "blue" | "green" | "orange" | "violet" }) { const tones = { blue: "bg-soft-blue text-primary", green: "bg-soft-success text-success", orange: "bg-soft-warning text-warning", violet: "bg-soft-violet text-violet" }; return <div className="app-panel p-5 min-w-0"><div className="flex justify-between items-start"><span className="text-[12px] font-medium text-muted-foreground">{label}</span><span className={`size-9 rounded-md flex items-center justify-center ${tones[tone]}`}><Icon size={18} strokeWidth={1.9} /></span></div><p className="text-[26px] font-bold mt-4 leading-none">{value}</p><p className="text-[11px] text-muted-foreground mt-3">{change}</p></div>; }
function RevenueChart() { return <div className="h-[250px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-line)" stopOpacity={0.17} /><stop offset="95%" stopColor="var(--chart-line)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 4" /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} dy={12} /><Tooltip formatter={(value) => [money(Number(value)), "Ingresos"]} contentStyle={{ borderRadius: 6, border: "1px solid var(--border)", fontSize: 12 }} /><Area type="monotone" dataKey="income" stroke="var(--chart-line)" strokeWidth={2.5} fill="url(#incomeFill)" /></AreaChart></ResponsiveContainer></div>; }
function Dashboard({ go, repairs, products, openRepair }: { go: (screen: Screen) => void; repairs: Repair[]; products: Product[]; openRepair: () => void }) {
  const pending = repairs.filter(r => r.status !== 4);
  return <><PageHeading eyebrow="PANEL GENERAL" title="Buen día, tu negocio en un vistazo" description="Esto es lo que está pasando en tu negocio hoy, 1 de octubre de 2026." action={<Button variant="outline" onClick={openRepair}><Plus size={16} /> Nueva reparación</Button>} />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-6"><Metric label="Ingresos de hoy" value="$415.000" change="↗ 12,8% vs. ayer · dato de muestra" icon={DollarSign} /><Metric label="Ventas realizadas" value="18" change="↗ 4 más que ayer · muestra" icon={ShoppingCart} tone="green" /><Metric label="Reparaciones pendientes" value={String(pending.length)} change="Equipos en proceso" icon={Wrench} tone="orange" /><Metric label="Productos en stock" value={String(products.reduce((sum, p) => sum + p.stock, 0))} change={`${products.filter(p => p.stock <= 7).length} con stock bajo`} icon={Box} tone="violet" /></div>
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)] gap-5 mb-6"><section className="app-panel p-5 md:p-6 min-w-0"><div className="flex justify-between items-start mb-5"><div><h2 className="font-bold text-[15px]">Resumen de ingresos</h2><p className="text-xs text-muted-foreground mt-1">Actividad de los últimos 7 días · muestra</p></div><span className="text-xs border rounded-md px-2.5 py-1.5 text-muted-foreground">Esta semana</span></div><div className="flex items-baseline gap-3 mb-3"><strong className="text-2xl font-bold">$2.401.000</strong><span className="text-xs text-success bg-soft-success px-2 py-1 rounded flex items-center"><ArrowUpRight size={13} /> 8,2%</span></div><RevenueChart /></section>
    <section className="app-panel p-5 md:p-6"><div className="flex justify-between items-start"><div><h2 className="font-bold text-[15px]">Servicio técnico</h2><p className="text-xs text-muted-foreground mt-1">Estado de las reparaciones</p></div><span className="size-9 bg-soft-blue text-primary rounded-md flex items-center justify-center"><Wrench size={17} /></span></div><div className="mt-7 space-y-5">{stages.map((s, i) => { const count = repairs.filter(r => r.status === i).length; const widths = ["w-[45%]", "w-[60%]", "w-[60%]", "w-[60%]", "w-[45%]"]; return <div key={s}><div className="flex justify-between text-xs mb-2"><span className="text-muted-foreground">{s}</span><strong>{count}</strong></div><div className="h-1.5 rounded-full bg-secondary"><div className={`h-full rounded-full ${i === 4 ? "bg-success" : "bg-primary"} ${count ? widths[i] : "w-0"}`} /></div></div>; })}</div><Button variant="outline" className="w-full mt-7" onClick={() => go("servicio")}>Ver tablero de reparaciones <ArrowRight size={15} /></Button></section></div>
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)] gap-5"><section className="app-panel overflow-hidden"><div className="p-5 md:p-6 flex justify-between items-center"><div><h2 className="font-bold text-[15px]">Reparaciones recientes</h2><p className="text-xs text-muted-foreground mt-1">Últimos equipos ingresados al taller</p></div><Button variant="ghost" onClick={() => go("servicio")} className="text-primary text-xs">Ver todas <ArrowRight size={14} /></Button></div><div className="overflow-x-auto"><table className="app-table"><thead><tr><th>Equipo</th><th>Cliente</th><th>Estado</th><th>Prioridad</th></tr></thead><tbody>{repairs.slice(0, 4).map(r => <tr key={r.id}><td><span className="font-semibold block">{r.model}</span><span className="text-[11px] text-muted-foreground">{r.id}</span></td><td className="text-muted-foreground">{r.customer}</td><td><span className="text-[11px] bg-secondary px-2 py-1 rounded whitespace-nowrap">{stages[r.status]}</span></td><td><Priority priority={r.priority} /></td></tr>)}</tbody></table></div></section><section className="app-panel p-5 md:p-6"><div className="flex items-start justify-between"><div><h2 className="font-bold text-[15px]">Stock local</h2><p className="text-xs text-muted-foreground mt-1">Insumos que necesitan atención</p></div><span className="size-9 bg-soft-warning text-warning rounded-md flex items-center justify-center"><Package size={17} /></span></div><div className="mt-6 divide-y">{products.filter(p => p.stock <= 7).map(p => <div key={p.code} className="flex items-center gap-3 py-3"><div className="size-9 rounded-md bg-secondary flex items-center justify-center text-muted-foreground"><HardDrive size={16} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-xs truncate">{p.name}</p><p className="text-[11px] text-muted-foreground">{p.code}</p></div><span className="text-[11px] font-semibold text-warning whitespace-nowrap">{p.stock} uds.</span></div>)}</div><Button variant="outline" className="w-full mt-6" onClick={() => go("inventario")}>Ir al inventario <ArrowRight size={15} /></Button></section></div>
  </>;
}
function ServiceBoard({ repairs, onAdd, onSelect }: { repairs: Repair[]; onAdd: () => void; onSelect: (repair: Repair) => void }) { return <><PageHeading eyebrow="GESTIÓN DE TALLER" title="Servicio técnico" description="Seguimiento de equipos en cada etapa de reparación." action={<Button onClick={onAdd}><Plus size={16} /> Nuevo ingreso</Button>} /><div className="flex gap-3 overflow-x-auto pb-5 app-scrollbar snap-x">{stages.map((stage, i) => <section key={stage} className="min-w-[182px] max-w-[280px] flex-1 snap-start"><div className="flex items-center justify-between mb-4 px-1 gap-1"><div className="flex items-center gap-2 min-w-0"><span className={`size-2 shrink-0 rounded-full ${["bg-primary", "bg-violet", "bg-warning", "bg-blue-ink", "bg-success"][i]}`} /><h2 className="text-[12px] font-bold leading-tight">{stage}</h2></div><span className="text-[11px] bg-card border rounded px-1.5 py-0.5 text-muted-foreground">{repairs.filter(r => r.status === i).length}</span></div><div className="bg-secondary/65 rounded-lg p-2.5 min-h-[550px] space-y-2.5">{repairs.filter(r => r.status === i).map(r => <Button key={r.id} variant="ghost" onClick={() => onSelect(r)} className="app-panel w-full h-auto min-h-[180px] p-3 text-left flex flex-col items-stretch justify-between hover:border-primary/50 hover:bg-card transition-colors whitespace-normal"><div className="w-full"><div className="flex items-center justify-between mb-4"><span className="text-[10px] font-semibold text-muted-foreground">{r.id}</span><MoreHorizontal size={16} className="text-muted-foreground" /></div><div className="flex items-start gap-2"><div className="size-7 rounded bg-soft-blue text-primary flex items-center justify-center shrink-0"><Laptop size={16} /></div><div className="min-w-0"><h3 className="text-[12px] font-bold leading-snug break-words">{r.model}</h3><p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 font-normal">{r.issue}</p></div></div></div><div className="w-full mt-5"><div className="flex justify-between items-center mb-3"><Priority priority={r.priority} /><span className="text-[10px] text-muted-foreground font-normal flex items-center gap-1"><Clock3 size={11} />{r.date.split(",")[0]}</span></div><div className="border-t pt-3 flex items-center gap-2"><span className="size-6 shrink-0 rounded-full bg-secondary text-[9px] flex items-center justify-center font-bold">{r.initials}</span><span className="text-[10px] text-muted-foreground truncate font-normal">{r.customer}</span></div></div></Button>)}{i === 0 && <Button variant="ghost" onClick={onAdd} className="w-full border border-dashed h-10 text-xs text-muted-foreground"><Plus size={14} /> Agregar equipo</Button>}</div></section>)}</div><p className="text-xs text-muted-foreground mt-2">Seleccioná una tarjeta para consultar o cambiar su estado.</p></>; }
function ProductIcon({ icon }: { icon: Product["icon"] }) { return <div className="size-9 rounded-md bg-secondary text-muted-foreground flex items-center justify-center">{icon === "board" ? <Computer size={17} /> : icon === "cable" ? <Activity size={17} /> : icon === "ssd" ? <HardDrive size={17} /> : <Box size={17} />}</div>; }
function Inventory({ products, allCount, query, setQuery, category, setCategory, onAdd, onSale }: { products: Product[]; allCount: number; query: string; setQuery: (s: string) => void; category: string; setCategory: (s: string) => void; onAdd: (() => void) | undefined; onSale: (() => void) | undefined }) { return <><PageHeading eyebrow="PRODUCTOS Y EXISTENCIAS" title="Inventario" description="Controlá los componentes y productos disponibles en tu local." action={onAdd || onSale ? <div className="flex flex-wrap gap-2">{onAdd && <Button variant="outline" onClick={onAdd}><Plus size={16} /> Agregar producto</Button>}{onSale && <Button onClick={onSale}><ShoppingCart size={16} /> Nueva venta</Button>}</div> : undefined} /><div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"><Metric label="Productos registrados" value={String(allCount)} change="En el catálogo local" icon={Package} /><Metric label="Unidades disponibles" value={String(products.reduce((sum, p) => sum + p.stock, 0))} change="Según el filtro actual" icon={Box} tone="green" /><Metric label="Stock bajo" value={String(products.filter(p => p.stock <= 7).length)} change="7 unidades o menos" icon={Activity} tone="orange" /></div><div className="app-panel overflow-hidden"><div className="p-5 flex flex-col sm:flex-row justify-between gap-4 sm:items-center"><div><h2 className="text-[15px] font-bold">Lista de productos</h2><p className="text-xs text-muted-foreground mt-1">{products.length} productos encontrados</p></div><div className="flex flex-wrap gap-2"><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Buscar producto" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar producto..." className="pl-9 w-full sm:w-[210px]" /></div><select aria-label="Filtrar categoría" value={category} onChange={e => setCategory(e.target.value)} className="h-9 border rounded-md bg-card px-3 text-xs text-foreground">{["Todos", "Memorias", "Almacenamiento", "Placas madre", "Cables", "Otros"].map(c => <option key={c}>{c}</option>)}</select></div></div><div className="overflow-x-auto"><table className="app-table"><thead><tr><th>Código</th><th>Nombre del producto</th><th>Categoría</th><th>Stock local</th><th>Precio</th></tr></thead><tbody>{products.map(p => <tr key={p.code}><td className="font-semibold text-muted-foreground whitespace-nowrap">{p.code}</td><td><div className="flex items-center gap-3 min-w-[260px]"><ProductIcon icon={p.icon} /><span className="font-semibold">{p.name}</span></div></td><td className="text-muted-foreground">{p.category}</td><td><span className={`inline-flex gap-1.5 items-center px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${p.stock <= 7 ? "bg-soft-warning text-warning" : "bg-soft-success text-success"}`}><span className="size-1.5 rounded-full bg-current" />{p.stock} unidades</span></td><td className="font-bold whitespace-nowrap">{money(p.price)}</td></tr>)}</tbody></table>{products.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">No se encontraron productos.</div>}</div><div className="border-t px-5 py-3 text-xs text-muted-foreground">Mostrando {products.length} de {allCount} productos</div></div></>; }
function Sales({ products, onSale, go }: { products: Product[]; onSale: () => void; go: (screen: Screen) => void }) { return <><PageHeading eyebrow="MOSTRADOR" title="Punto de venta" description="Registrá ventas y consultá productos disponibles." action={<Button onClick={onSale}><Plus size={16} /> Nueva venta</Button>} /><div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"><Metric label="Ventas de hoy" value="18" change="Dato de muestra" icon={ShoppingCart} /><Metric label="Ingresos del día" value="$415.000" change="Dato de muestra" icon={DollarSign} tone="green" /><Metric label="Productos disponibles" value={String(products.filter(p => p.stock > 0).length)} change="Listos para vender" icon={Package} tone="violet" /></div><div className="app-panel overflow-hidden"><div className="p-5 md:p-6 flex items-center justify-between"><div><h2 className="font-bold text-[15px]">Productos disponibles</h2><p className="text-xs text-muted-foreground mt-1">Consultá precios y existencias antes de vender</p></div><Button variant="ghost" className="text-primary text-xs" onClick={() => go("inventario")}>Ver inventario <ArrowRight size={14} /></Button></div><div className="overflow-x-auto"><table className="app-table"><thead><tr><th>Producto</th><th>Código</th><th>Disponibles</th><th>Precio</th></tr></thead><tbody>{products.filter(p => p.stock > 0).slice(0, 6).map(p => <tr key={p.code}><td><div className="flex gap-3 items-center min-w-[250px]"><ProductIcon icon={p.icon} /><span className="font-semibold">{p.name}</span></div></td><td className="text-muted-foreground">{p.code}</td><td>{p.stock} unidades</td><td className="font-bold">{money(p.price)}</td></tr>)}</tbody></table></div></div></>; }
function Reports({ repairs, products }: { repairs: Repair[]; products: Product[] }) { return <><PageHeading eyebrow="ANÁLISIS DEL NEGOCIO" title="Reportes" description="Una vista general de la actividad del local. Las cifras de ingresos son de demostración." /><div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"><Metric label="Ingresos semanales" value="$2.401.000" change="Dato de muestra" icon={TrendingUp} /><Metric label="Equipos ingresados" value={String(repairs.length)} change="Registrados en el tablero" icon={Laptop} tone="orange" /><Metric label="Productos en catálogo" value={String(products.length)} change="Inventario actual" icon={Package} tone="green" /></div><section className="app-panel p-5 md:p-6"><div className="mb-5"><h2 className="font-bold text-[15px]">Evolución de ingresos</h2><p className="text-xs text-muted-foreground mt-1">Últimos 7 días · datos de muestra</p></div><RevenueChart /></section></>; }
