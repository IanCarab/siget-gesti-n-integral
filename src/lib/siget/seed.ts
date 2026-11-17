import type { SigetData } from "./types";

export function createSeedData(now: Date = new Date()): SigetData {
  const earlier = (hours: number) => new Date(now.getTime() - hours * 3600_000).toISOString();

  return {
    products: [
      { id: 1, nombre: "Memoria RAM Kingston Fury 8GB DDR4", categoria: "Hardware", stock: 15, precio: 45000, stockMinimo: 5 },
      { id: 2, nombre: "SSD Crucial BX500 480GB", categoria: "Almacenamiento", stock: 8, precio: 62000, stockMinimo: 5 },
      { id: 3, nombre: "Pasta Térmica Arctic MX-4", categoria: "Insumos", stock: 25, precio: 9500, stockMinimo: 5 },
      { id: 4, nombre: "Impresora Multifunción HP Ink Tank 315", categoria: "Periféricos", stock: 3, precio: 185000, stockMinimo: 5 },
      { id: 5, nombre: "Cable HDMI 1.8m mallado", categoria: "Cables", stock: 30, precio: 6000, stockMinimo: 5 },
    ],
    clients: [
      { dni: "38456789", nombre: "Juan Pérez", telefono: "3454123456" },
      { dni: "29876543", nombre: "María Gómez", telefono: "3454987654" },
    ],
    sales: [
      {
        id: 101,
        fecha: earlier(2),
        clienteDni: "38456789",
        clienteNombre: "Juan Pérez",
        items: [
          { productId: 1, nombre: "Memoria RAM Kingston Fury 8GB DDR4", cantidad: 1, precioUnitario: 45000 },
          { productId: 3, nombre: "Pasta Térmica Arctic MX-4", cantidad: 1, precioUnitario: 9500 },
        ],
        total: 54500,
        medioPago: "Efectivo",
        estado: "Completada",
        vendedor: "Mostrador",
      },
    ],
    orders: [
      {
        id: 501,
        fechaIngreso: earlier(50),
        clienteDni: "38456789",
        clienteNombre: "Juan Pérez",
        tipoEquipo: "Notebook",
        marca: "Lenovo",
        modelo: "IdeaPad",
        falla: "No enciende / Pantalla negra",
        estado: "En Reparación",
        manoDeObra: 35000,
        repuestos: [],
        notas: "",
      },
      {
        id: 502,
        fechaIngreso: earlier(5),
        clienteDni: "29876543",
        clienteNombre: "María Gómez",
        tipoEquipo: "PC de Escritorio",
        marca: "Custom",
        modelo: "—",
        falla: "Mantenimiento y limpieza general",
        estado: "Ingresado",
        manoDeObra: 15000,
        repuestos: [],
        notas: "",
      },
      {
        id: 503,
        fechaIngreso: earlier(74),
        clienteDni: null,
        clienteNombre: "Carlos Ruiz",
        tipoEquipo: "Impresora",
        marca: "Epson",
        modelo: "L3210",
        falla: "Atasco de papel y cabezales sucios",
        estado: "Listo",
        manoDeObra: 25000,
        repuestos: [],
        notas: "",
      },
    ],
    movements: [],
  };
}
