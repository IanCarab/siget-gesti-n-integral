import type { RoleId } from "./types";

export type AreaId = "admin" | "ventas" | "historial" | "clientes" | "taller" | "inventario";

export interface RoleInfo {
  id: RoleId;
  titulo: string;
  subtitulo: string;
  operador: string;
  home: string;
  areas: AreaId[];
  /** Puede registrar entradas/salidas, crear productos y editar precios. */
  gestionaInventario: boolean;
}

export const ROLES: Record<RoleId, RoleInfo> = {
  admin: {
    id: "admin",
    titulo: "Administrador",
    subtitulo: "Dueño · Gerencia general",
    operador: "Ian Caraballo",
    home: "/admin",
    areas: ["admin", "ventas", "historial", "clientes", "taller", "inventario"],
    gestionaInventario: true,
  },
  vendedor: {
    id: "vendedor",
    titulo: "Vendedor",
    subtitulo: "Mostrador · Punto de venta",
    operador: "Mostrador 1",
    home: "/ventas",
    areas: ["ventas", "historial", "clientes", "inventario"],
    gestionaInventario: false,
  },
  tecnico: {
    id: "tecnico",
    titulo: "Técnico",
    subtitulo: "Taller · Servicio técnico",
    operador: "Técnico de taller",
    home: "/taller",
    areas: ["taller", "clientes", "inventario"],
    gestionaInventario: false,
  },
  deposito: {
    id: "deposito",
    titulo: "Encargado de Depósito",
    subtitulo: "Inventario · Stock",
    operador: "Depósito",
    home: "/inventario",
    areas: ["inventario"],
    gestionaInventario: true,
  },
};

export function canAccess(role: RoleId | null, area: AreaId): boolean {
  if (!role) return false;
  return ROLES[role].areas.includes(area);
}
