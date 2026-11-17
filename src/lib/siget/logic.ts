import type {
  Client,
  OrderState,
  PaymentMethod,
  Product,
  RepairOrder,
  Result,
  Sale,
  SigetData,
  StockMovement,
} from "./types";

export interface CartLine {
  productId: number;
  cantidad: number;
}

const nextId = (ids: number[], base: number) => (ids.length ? Math.max(...ids) + 1 : base);

export function orderTotal(order: Pick<RepairOrder, "manoDeObra" | "repuestos">): number {
  return (
    order.manoDeObra + order.repuestos.reduce((sum, p) => sum + p.cantidad * p.precioUnitario, 0)
  );
}

export function isLowStock(p: Product): boolean {
  return p.stock <= p.stockMinimo;
}

function movement(
  data: SigetData,
  extra: StockMovement[],
  m: Omit<StockMovement, "id" | "fecha">,
  fecha: string,
): StockMovement {
  const id = nextId(
    [...data.movements, ...extra].map((x) => x.id),
    1,
  );
  return { ...m, id, fecha };
}

/** Confirma una venta: valida stock, lo descuenta y registra la venta. */
export function confirmSale(
  data: SigetData,
  input: {
    lines: CartLine[];
    clienteDni: string | null;
    medioPago: PaymentMethod;
    vendedor: string;
    fecha?: string | undefined;
  },
): Result<{ data: SigetData; sale: Sale }> {
  const lines = input.lines.filter((l) => l.cantidad > 0);
  if (lines.length === 0) return { ok: false, error: "El carrito está vacío." };

  const fecha = input.fecha ?? new Date().toISOString();
  const products = data.products.map((p) => ({ ...p }));
  const newMovements: StockMovement[] = [];
  const items: Sale["items"] = [];

  for (const line of lines) {
    const p = products.find((x) => x.id === line.productId);
    if (!p) return { ok: false, error: `Producto #${line.productId} inexistente.` };
    if (line.cantidad > p.stock)
      return { ok: false, error: `Stock insuficiente de "${p.nombre}" (disponible: ${p.stock}).` };
    p.stock -= line.cantidad;
    items.push({
      productId: p.id,
      nombre: p.nombre,
      cantidad: line.cantidad,
      precioUnitario: p.precio,
    });
  }

  const client = input.clienteDni ? data.clients.find((c) => c.dni === input.clienteDni) : null;
  const sale: Sale = {
    id: nextId(
      data.sales.map((s) => s.id),
      101,
    ),
    fecha,
    clienteDni: client?.dni ?? null,
    clienteNombre: client?.nombre ?? "Consumidor final",
    items,
    total: items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0),
    medioPago: input.medioPago,
    estado: "Completada",
    vendedor: input.vendedor,
  };

  for (const i of items) {
    newMovements.push(
      movement(
        data,
        newMovements,
        {
          productId: i.productId,
          productoNombre: i.nombre,
          tipo: "Salida",
          cantidad: i.cantidad,
          motivo: `Venta #${sale.id}`,
          usuario: input.vendedor,
        },
        fecha,
      ),
    );
  }

  return {
    ok: true,
    data: {
      data: {
        ...data,
        products,
        sales: [sale, ...data.sales],
        movements: [...newMovements.reverse(), ...data.movements],
      },
      sale,
    },
  };
}

export function addClient(data: SigetData, client: Client): Result<SigetData> {
  const dni = client.dni.replace(/\D/g, "");
  if (dni.length < 7 || dni.length > 9) return { ok: false, error: "DNI inválido (7 a 9 dígitos)." };
  if (!client.nombre.trim()) return { ok: false, error: "El nombre es obligatorio." };
  if (data.clients.some((c) => c.dni === dni))
    return { ok: false, error: "Ya existe un cliente con ese DNI." };
  return {
    ok: true,
    data: {
      ...data,
      clients: [
        ...data.clients,
        { dni, nombre: client.nombre.trim(), telefono: client.telefono.trim() },
      ],
    },
  };
}

export function registerStockMovement(
  data: SigetData,
  input: {
    productId: number;
    tipo: "Entrada" | "Salida";
    cantidad: number;
    motivo: string;
    usuario: string;
    fecha?: string | undefined;
  },
): Result<SigetData> {
  const p = data.products.find((x) => x.id === input.productId);
  if (!p) return { ok: false, error: "Producto inexistente." };
  if (!Number.isInteger(input.cantidad) || input.cantidad <= 0)
    return { ok: false, error: "La cantidad debe ser un entero mayor a 0." };
  if (input.tipo === "Salida" && input.cantidad > p.stock)
    return { ok: false, error: `No hay stock suficiente (disponible: ${p.stock}).` };
  const fecha = input.fecha ?? new Date().toISOString();
  const delta = input.tipo === "Entrada" ? input.cantidad : -input.cantidad;
  const m = movement(
    data,
    [],
    {
      productId: p.id,
      productoNombre: p.nombre,
      tipo: input.tipo,
      cantidad: input.cantidad,
      motivo: input.motivo.trim() || (input.tipo === "Entrada" ? "Ingreso de mercadería" : "Egreso manual"),
      usuario: input.usuario,
    },
    fecha,
  );
  return {
    ok: true,
    data: {
      ...data,
      products: data.products.map((x) => (x.id === p.id ? { ...x, stock: x.stock + delta } : x)),
      movements: [m, ...data.movements],
    },
  };
}

export function addProduct(
  data: SigetData,
  input: Omit<Product, "id">,
): Result<SigetData> {
  if (!input.nombre.trim()) return { ok: false, error: "El nombre es obligatorio." };
  if (input.precio < 0 || input.stock < 0) return { ok: false, error: "Valores inválidos." };
  const id = nextId(
    data.products.map((p) => p.id),
    1,
  );
  return {
    ok: true,
    data: { ...data, products: [...data.products, { ...input, nombre: input.nombre.trim(), id }] },
  };
}

export function updateProduct(
  data: SigetData,
  id: number,
  patch: Partial<Pick<Product, "nombre" | "categoria" | "precio" | "stockMinimo">>,
): SigetData {
  return { ...data, products: data.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}

export function createOrder(
  data: SigetData,
  input: Omit<RepairOrder, "id" | "estado" | "repuestos" | "fechaIngreso" | "notas"> & {
    fechaIngreso?: string | undefined;
  },
): Result<{ data: SigetData; order: RepairOrder }> {
  if (!input.clienteNombre.trim()) return { ok: false, error: "Seleccioná un cliente." };
  if (!input.tipoEquipo.trim() || !input.marca.trim())
    return { ok: false, error: "Completá tipo de equipo y marca." };
  if (!input.falla.trim()) return { ok: false, error: "Describí la falla declarada." };
  const order: RepairOrder = {
    ...input,
    id: nextId(
      data.orders.map((o) => o.id),
      501,
    ),
    fechaIngreso: input.fechaIngreso ?? new Date().toISOString(),
    estado: "Ingresado",
    repuestos: [],
    notas: "",
  };
  return { ok: true, data: { data: { ...data, orders: [...data.orders, order] }, order } };
}

export function moveOrder(data: SigetData, id: number, estado: OrderState): SigetData {
  return { ...data, orders: data.orders.map((o) => (o.id === id ? { ...o, estado } : o)) };
}

export function updateOrder(
  data: SigetData,
  id: number,
  patch: Partial<Pick<RepairOrder, "manoDeObra" | "notas" | "falla">>,
): SigetData {
  return { ...data, orders: data.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) };
}

/** Asigna un repuesto del inventario a una orden: descuenta stock y suma al presupuesto. */
export function assignPart(
  data: SigetData,
  input: { orderId: number; productId: number; cantidad: number; usuario: string; fecha?: string },
): Result<SigetData> {
  const order = data.orders.find((o) => o.id === input.orderId);
  if (!order) return { ok: false, error: "Orden inexistente." };
  if (order.estado === "Entregado")
    return { ok: false, error: "La orden ya fue entregada." };
  const mov = registerStockMovement(data, {
    productId: input.productId,
    tipo: "Salida",
    cantidad: input.cantidad,
    motivo: `Repuesto Orden #${order.id}`,
    usuario: input.usuario,
    fecha: input.fecha,
  });
  if (!mov.ok) return mov;
  const p = data.products.find((x) => x.id === input.productId)!;
  const existing = order.repuestos.find((r) => r.productId === p.id);
  const repuestos = existing
    ? order.repuestos.map((r) =>
        r.productId === p.id ? { ...r, cantidad: r.cantidad + input.cantidad } : r,
      )
    : [
        ...order.repuestos,
        { productId: p.id, nombre: p.nombre, cantidad: input.cantidad, precioUnitario: p.precio },
      ];
  return {
    ok: true,
    data: {
      ...mov.data,
      orders: mov.data.orders.map((o) => (o.id === order.id ? { ...o, repuestos } : o)),
    },
  };
}

/** Quita un repuesto de una orden y lo devuelve al stock. */
export function removePart(
  data: SigetData,
  input: { orderId: number; productId: number; usuario: string; fecha?: string },
): Result<SigetData> {
  const order = data.orders.find((o) => o.id === input.orderId);
  const part = order?.repuestos.find((r) => r.productId === input.productId);
  if (!order || !part) return { ok: false, error: "Repuesto no encontrado en la orden." };
  if (!data.products.some((p) => p.id === input.productId))
    return { ok: false, error: "Producto inexistente." };
  const mov = registerStockMovement(data, {
    productId: input.productId,
    tipo: "Entrada",
    cantidad: part.cantidad,
    motivo: `Devolución Orden #${order.id}`,
    usuario: input.usuario,
    fecha: input.fecha,
  });
  if (!mov.ok) return mov;
  return {
    ok: true,
    data: {
      ...mov.data,
      orders: mov.data.orders.map((o) =>
        o.id === order.id
          ? { ...o, repuestos: o.repuestos.filter((r) => r.productId !== input.productId) }
          : o,
      ),
    },
  };
}
