# TradConnect - SPA

**Plataforma comercial B2B** para suministros de construcción.
Aplicación de Página Única (SPA) con sistema de roles (Cliente/Proveedor),
marketplace con carrito, gestión de inventario, facturación, pedidos y análisis.
Desarrollado como prototipo frontend con simulación de datos.

## Características Principales

- Arquitectura SPA: Navegación sin recargas, shell persistente.
- Marketplace con productos, categorías, búsqueda, ofertas y descuentos.
- Carrito de compras lateral con cálculo de subtotales, descuentos y total.
- Sistema de roles intercambiable (Cliente / Proveedor).
- Gestión de inventario (CRUD de productos, filtros, stock bajo).
- Facturación con estados (pagadas, pendientes, vencidas, reembolsadas).
- Pedidos con seguimiento de estados.
- Dashboard con KPIs y gráficos interactivos (Chart.js).
- Diseño responsive (sidebar adaptable, menú hamburguesa).
- Persistencia de estado en localStorage.

## Tecnologías

| Capa          | Herramientas / Librerías                         |
|---------------|--------------------------------------------------|
| Arquitectura  | SPA con router propio                            |
| Frontend      | HTML5, CSS3, JavaScript (Vanilla ES6+)           |
| Estilos       | CSS Custom Properties, Flexbox, Grid             |
| Gráficos      | Chart.js 4.x                                     |
| Iconos        | Font Awesome 6                                   |
| Fuente        | Google Fonts - Inter                             |
| Simulación    | Datos estáticos en JavaScript                    |
| Persistencia  | localStorage                                     |

## Estructura del Proyecto
![alt text](/img/image.png)

## Arquitectura SPA - Cómo Funciona

Flujo de Navegacion:

1. Usuario abre index.html
2. router.js se inicializa
3. Lee rol y ultimo modulo de localStorage
4. Carga el fragmento correspondiente
5. Inyecta el HTML en <main id="main-view">
6. Ejecuta los scripts del fragmento (init())
7. El contenido se renderiza sin recargar

Persistencia al Recargar:
- El modulo actual se guarda en localStorage (currentModule)
- Al recargar (F5), se restaura el mismo modulo
- El carrito persiste con clave marketplaceCart

## Roles de Usuario

| Rol         | Modulos disponibles                                    |
|-------------|--------------------------------------------------------|
| Cliente     | Marketplace, Mis Pedidos, Mis Facturas, Mi Perfil      |
| Proveedor   | Dashboard, Mi Inventario, Pedidos Recibidos, Facturacion, Analisis |

## Carrito de Compras

Funcionalidades:
- Anadir productos desde el marketplace
- Selector de cantidad por producto
- Precios con descuentos visibles
- Calculo de subtotal por producto, ahorro, total general
- Persistencia en localStorage
- Solo visible en modo Cliente

Visualizacion en Carrito:


![alt text](/img/image-1.png)

## Como Ejecutar

Opcion 1 - Live Server (recomendada):
1. Instalar extension "Live Server" en VS Code
2. Click derecho en index.html -> "Open with Live Server"

Opcion 2 - Python:
python -m http.server 8080
Abrir http://localhost:8080

Opcion 3 - Node.js:
npx serve .

## Personalizacion

### Colores y estilos
Modificar :root en styles/style.css

### Datos simulados
- marketplace.js: Array products
- inventory.js: Array defaultInventory
- invoices.js: Array invoicesData
- orders.js: Array ordersData

### Menu de navegacion
Editar const menus en rolusuario.js

### Productos del marketplace
Editar array products en marketplace.js

## Funcionalidades por Modulo

### Marketplace
- Tarjetas de producto con imagen, precio, vendedor
- Ofertas con descuento visible
- Filtros por categoria
- Busqueda instantanea
- Selector de cantidad
- Carrito lateral completo

### Dashboard (Proveedor)
- KPIs: ventas, pedidos urgentes, stock critico, nuevos clientes
- Grafico de barras: transacciones por hora
- Grafico de lineas: tendencia de crecimiento
- Grafico de dona: ventas por region
- Grafico de lineas: proyeccion

### Inventario (Proveedor)
- Tabla con codigo, nombre, categoria, stock, precio
- Indicadores de stock (bajo, medio, alto)
- CRUD de productos (modales)
- Filtros por categoria
- Busqueda
- Resumen de metricas

### Facturacion
- Listado de facturas
- Estados con badges de colores
- Filtros por estado
- Busqueda por numero
- Crear nueva factura
- Ver detalles

### Pedidos
- Tabla con ID, cliente, fecha, items, total, estado
- Filtros por estado
- Avatar con iniciales

### Perfil
- Formulario de usuario
- Actualizacion simulada

### Analisis
- Grafico de lineas: ventas vs pedidos

## Responsive Design

Desktop (>1000px):
- Sidebar fijo izquierda (260px)
- Contenido con margin-left: 260px
- Carrito lateral 400px

Tablet / Movil (<1000px):
- Sidebar oculto con transform
- Boton hamburguesa
- Overlay semitransparente
- Carrito 100% ancho

## Depuracion

Ver logs en Consola (F12):
- Router: Inicializando
- Router: Cargando modulo marketplace
- Marketplace: Inicializando

Errores comunes:
| Error                      | Solucion                                   |
|----------------------------|--------------------------------------------|
| 404 en fragmento           | Verificar ruta en fragments/               |
| XXX is not defined         | Verificar funciones globales               |
| Carrito no abre            | Definir window.toggleCart en index.html    |
| Al recargar vuelve atras   | router debe guardar currentModule          |
| Descuentos no se ven       | Verificar originalPrice e isOffer          |

## Extensiones Futuras Posibles

- Autenticacion de usuarios
- Conexion a backend real
- Base de datos
- Pasarela de pagos
- Notificaciones push
- Exportar facturas a PDF
- Chat entre clientes y proveedores
- Valoraciones y reseñas
- Modo oscuro

## Licencia

Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

## Autor

Desarrollado como prototipo frontend de un sistema de gestion comercial con arquitectura SPA.


TradConnect - Conecta tus suministros, impulsa tus resultados