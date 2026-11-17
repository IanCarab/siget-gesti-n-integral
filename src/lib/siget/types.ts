export type RoleId = "admin" | "vendedor" | "tecnico" | "deposito";

export interface Product {
  id: number;
  nombre: string;
  categoria: string;
  stock: number;
  precio: number;
  stockMinimo: number;
}

export interface Client {
  dni: string;
  nombre: string;
  telefono: string;
}

export interface SaleItem {
  productId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export type PaymentMethod = "Efectivo" | "Débito" | "Crédito" | "Transferencia";

export interface Sale {
  id: number;
  fecha: string; // ISO
  clienteDni: string | null;
  clienteNombre: string;
  items: SaleItem[];
  total: number;
  medioPago: PaymentMethod;
  estado: "Completada" | "Anulada";
  vendedor: string;
}

export const ORDER_STATES = [
  "Ingresado",
  "En Diagnóstico",
  "En Reparación",
  "Listo",
  "Entregado",
] as const;
export type OrderState = (typeof ORDER_STATES)[number];

export interface OrderPart {
  productId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface RepairOrder {
  id: number;
  fechaIngreso: string;
  clienteDni: string | null;
  clienteNombre: string;
  tipoEquipo: string;
  marca: string;
  modelo: string;
  falla: string;
  estado: OrderState;
  manoDeObra: number;
  repuestos: OrderPart[];
  notas: string;
}

export interface StockMovement {
  id: number;
  fecha: string;
  productId: number;
  productoNombre: string;
  tipo: "Entrada" | "Salida";
  cantidad: number;
  motivo: string;
  usuario: string;
}

export interface SigetData {
  products: Product[];
  clients: Client[];
  sales: Sale[];
  orders: RepairOrder[];
  movements: StockMovement[];
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };
