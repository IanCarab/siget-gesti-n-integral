# SIGET Gestión Integral

Crea una aplicación web moderna y completa en React, Tailwind CSS y Lucide Icons que funcione como un prototipo funcional para el sistema de gestión "SIGET" (Sistema Integrado de Gestión Comercial y Servicio Técnico).

La aplicación debe simular un entorno offline de escritorio y contar con un sistema de autenticación por roles (Selector de perfil en el login o barra superior) con acceso a las siguientes vistas diferenciadas:

1. **Pantalla de Inicio / Login:**
   - Permite elegir o autenticar el perfil de usuario entre: Administrador (Dueño), Vendedor (Mostrador), Técnico (Taller) y Encargado de Depósito.

2. **Panel de Administrador (Gerente General):**
   - Dashboard principal con métricas clave del local (Ingresos totales, ventas del día, equipos en reparación, alertas de stock bajo).
   - Acceso rápido a la gestión integral de todas las áreas.

3. **Panel de Ventas (Punto de Venta / Mostrador):**
   - Interfaz de venta rápida: búsqueda de productos por código/nombre, selección de cantidad y adición al carrito.
   - Descuento automático de stock al confirmar la venta y generación de ticket/remito simulado.
   - Registro y consulta de clientes (DNI, Nombre, Teléfono).

4. **Panel Técnico (Servicio Taller / Kanban):**
   - Tablero Kanban visual con columnas de estados para las Órdenes de Reparación: "Ingresado", "En Diagnóstico", "En Reparación", "Listo" y "Entregado".
   - Capacidad de crear una nueva orden de reparación vinculando cliente, tipo de equipo, marca, modelo y falla declarada.
   - Detalle de la orden para asignar repuestos del inventario y actualizar el presupuesto.

5. **Panel de Depósito (Inventario):**
   - Grilla detallada del catálogo de insumos y repuestos (ID, nombre, categoría, stock actual, precio unitario).
   - Acceso exclusivo de lectura o gestión para control de entradas y salidas de mercadería.

---

### Datos Precargados Obligatorios (Mock Data inicial):

- **Productos Precargados:**
  1. ID: 1 | Nombre: Memoria RAM Kingston Fury 8GB DDR4 | Categoría: Hardware | Stock: 15 | Precio: $45.000
  2. ID: 2 | Nombre: SSD Crucial BX500 480GB | Categoría: Almacenamiento | Stock: 8 | Precio: $62.000
  3. ID: 3 | Nombre: Pasta Térmica Arctic MX-4 | Categoría: Insumos | Stock: 25 | Precio: $9.500
  4. ID: 4 | Nombre: Impresora Multifunción HP Ink Tank 315 | Categoría: Periféricos | Stock: 3 | Precio: $185.000
  5. ID: 5 | Nombre: Cable HDMI 1.8m mallado | Categoría: Cables | Stock: 30 | Precio: $6.000

- **Clientes Precargados:**
  1. DNI: 38456789 | Nombre: Juan Pérez | Teléfono: 3454123456
  2. DNI: 29876543 | Nombre: María Gómez | Teléfono: 3454987654

- **Ventas Precargadas (Historial):**
  1. Venta #101 | Fecha: Hoy | Cliente: Juan Pérez | Total: $54.500 | Estado: Completada (Incluye 1 RAM y 1 Pasta Térmica)

- **Órdenes de Reparación Precargadas (Tablero Kanban):**
  1. Orden #501 | Cliente: Juan Pérez | Equipo: Notebook Lenovo IdeaPad | Falla: No enciende / Pantalla negra | Estado: "En Reparación" | Presupuesto: $35.000
  2. Orden #502 | Cliente: María Gómez | Equipo: PC de Escritorio Custom | Falla: Mantenimiento y limpieza general | Estado: "Ingresado" | Presupuesto: $15.000
  3. Orden #503 | Cliente: Carlos Ruiz | Equipo: Impresora Epson L3210 | Falla: Atasco de papel y cabezales sucios | Estado: "Listo" | Presupuesto: $25.000

Diseña una interfaz limpia, profesional, intuitiva y completamente interactiva para que se pueda navegar fluida y claramente entre los distintos roles operativos del negocio.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/34eb0772-e20b-4818-9698-2f073b3c44f6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
