import { describe, expect, it } from "vitest";

import { addClient, assignPart, confirmSale, isLowStock, orderTotal, registerStockMovement, removePart } from "./logic";
import { canAccess } from "./roles";
import { createSeedData } from "./seed";

const stockOf = (d: ReturnType<typeof createSeedData>, id: number) => d.products.find((p) => p.id === id)!.stock;

describe("SIGET reglas", () => {
  it("la venta precargada #101 suma $54.500", () => {
    const d = createSeedData();
    expect(d.sales[0]!.id).toBe(101);
    expect(d.sales[0]!.total).toBe(54500);
  });

  it("confirmar una venta descuenta el stock", () => {
    const d = createSeedData();
    const res = confirmSale(d, { lines: [{ productId: 2, cantidad: 3 }], clienteDni: "38456789", medioPago: "Efectivo", vendedor: "x" });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(stockOf(res.data.data, 2)).toBe(5);
    expect(res.data.sale.total).toBe(186000);
    expect(res.data.sale.id).toBe(102);
  });

  it("no permite vender más que el stock disponible", () => {
    const d = createSeedData();
    const res = confirmSale(d, { lines: [{ productId: 4, cantidad: 4 }], clienteDni: null, medioPago: "Efectivo", vendedor: "x" });
    expect(res.ok).toBe(false);
    expect(stockOf(d, 4)).toBe(3);
  });

  it("asignar un repuesto descuenta stock y sube el presupuesto", () => {
    const d = createSeedData();
    const res = assignPart(d, { orderId: 501, productId: 3, cantidad: 1, usuario: "t" });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(stockOf(res.data, 3)).toBe(24);
    expect(orderTotal(res.data.orders.find((o) => o.id === 501)!)).toBe(35000 + 9500);
    const back = removePart(res.data, { orderId: 501, productId: 3, usuario: "t" });
    expect(back.ok && stockOf(back.data, 3)).toBe(25);
  });

  it("una salida de depósito no puede dejar stock negativo", () => {
    const d = createSeedData();
    expect(registerStockMovement(d, { productId: 4, tipo: "Salida", cantidad: 5, motivo: "", usuario: "d" }).ok).toBe(false);
  });

  it("la impresora HP (stock 3) dispara alerta de stock bajo", () => {
    const d = createSeedData();
    expect(isLowStock(d.products.find((p) => p.id === 4)!)).toBe(true);
    expect(isLowStock(d.products.find((p) => p.id === 1)!)).toBe(false);
  });

  it("no se registran dos clientes con el mismo DNI", () => {
    expect(addClient(createSeedData(), { dni: "38456789", nombre: "Otro", telefono: "" }).ok).toBe(false);
  });

  it("cada rol accede solo a sus módulos", () => {
    expect(canAccess("deposito", "inventario")).toBe(true);
    expect(canAccess("deposito", "ventas")).toBe(false);
    expect(canAccess("tecnico", "taller")).toBe(true);
    expect(canAccess("tecnico", "admin")).toBe(false);
    expect(canAccess("vendedor", "ventas")).toBe(true);
    expect(canAccess("admin", "taller")).toBe(true);
  });
});
