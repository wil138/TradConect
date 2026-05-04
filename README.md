# #  TradConnect

**Dashboard de gestión comercial B2B** para suministros de construcción.  
Visualiza operaciones, administra inventarios, facturación y pedidos con una interfaz moderna de dos roles (Proveedor y Cliente).  
Desarrollado como prototipo frontend con simulación de datos.

---

##  Características

- 📊 **Dashboard operacional** con KPIs (ventas, pedidos, stock, clientes) y gráficos interactivos.
- 🛒 **Marketplace** de productos de construcción con carrito de compras lateral.
- 📦 **Gestión de inventario** (CRUD de productos, filtros por categoría, búsqueda, alertas de stock bajo).
- 🧾 **Facturación** con estados (pagadas, pendientes, vencidas, reembolsadas) y filtros.
- 📋 **Pedidos** con seguimiento de estados (pendiente, enviado, entregado, cancelado).
- 👥 **Sistema de roles** intercambiable (Proveedor / Cliente) que modifica menús y funcionalidades.
- 📱 **Diseño responsive** (sidebar adaptable, menú móvil).
- 🎨 UI limpia con **Inter** como tipografía, colores corporativos y sombras suaves.

---

## Tecnologías

| Capa          | Herramientas / Librerías                         |
|---------------|--------------------------------------------------|
| **Frontend**  | HTML5, CSS3, JavaScript (Vanilla)                |
| **Estilos**   | CSS Custom Properties, Flexbox, Grid, Animaciones|
| **Gráficos**  | [Chart.js](https://www.chartjs.org/) 4.x         |
| **Iconos**    | [Font Awesome 6](https://fontawesome.com/)       |
| **Fuente**    | [Google Fonts - Inter](https://fonts.google.com/specimen/Inter) |
| **Simulación**| Datos estáticos en JavaScript                    |

> **Nota:** No requiere backend. Los datos se generan localmente y se reinician al recargar la página.

---

## Estructura del Proyecto

Tradconnect/
├── index.html # Dashboard principal (KPIs + gráficos)
├── marketplace.html # Tienda de suministros con carrito
├── inventory.html # Gestión de inventario
├── invoices.html # Facturación y pagos
├── orders.html # Seguimiento de pedidos
├── analytics.html # Análisis de rendimiento
├── profile.html # Perfil de usuario
│
├── Styles/
│ └── style.css # Hoja de estilos completa
│
├── javascripts/
│ ├── rolusuario.js # Lógica de roles, menú dinámico y sidebar
│ ├── Datasimulation.js # Simulación de datos del dashboard
│ ├── analytics.js # Gráfico de análisis
│ ├── inventory.js # CRUD y filtros de inventario
│ ├── invoices.js # Gestión de facturas
│ ├── marketplace.js # Productos y carrito
│ ├── orders.js # Filtrado de pedidos
│ └── profile.js # Formulario de perfil
│
└── README.md


---

## 👥 Roles de Usuario

El sistema permite cambiar entre dos modos pulsando el selector en la barra lateral:

- **🔵 Proveedor** (por defecto)  
  Accede a: Dashboard, Inventario, Pedidos Recibidos, Facturación y Análisis.

- **🟢 Cliente**  
  Accede a: Marketplace, Mis Pedidos, Mis Facturas y Mi Perfil.

El rol actual se guarda en `localStorage`, por lo que persiste al recargar la página.

---

## 🚀 Cómo Ejecutar

1. Clona este repositorio o descarga los archivos.
2. Abre cualquiera de los archivos `.html` en tu navegador (preferiblemente **index.html** para empezar).
3. No necesitas servidor local; funciona directamente desde el sistema de archivos.
   > *Opcional:* Si prefieres un entorno más profesional, puedes usar la extensión **Live Server** de VS Code.

---

## 🎨 Personalización

- **Colores y estilos:** Modifica las variables CSS en `:root` dentro de `style.css`.
- **Datos simulados:** Cada archivo JavaScript (ej. `inventory.js`, `invoices.js`) contiene los datos de prueba al inicio. Cambia los arrays para adaptarlos a tus necesidades.
- **Menú de navegación:** Las opciones por rol se definen en `rolusuario.js` dentro del objeto `menus`.
- **Productos del marketplace:** Edita el array `products` en `marketplace.js`.

---

## 📈 Funcionalidades Destacadas

### Dashboard (`index.html`)
- KPIs en tiempo real (simulado) con mensajes de comparación.
- Gráfico de barras de flujo de pedidos por hora.
- Gráficos de tendencia histórica, ventas por zona (dona) y proyección.

### Inventario (`inventory.html`)
- Alta, edición y eliminación de productos con modal.
- Filtros por categoría y búsqueda textual.
- Indicadores de stock (bajo, medio, alto) y resumen de métricas.

### Facturación (`invoices.html`)
- Visualización de facturas con estados visuales (badges de colores).
- Filtros por estado y búsqueda por número de factura.
- Modal para nueva factura y vista rápida de detalles.

### Marketplace (`marketplace.html`)
- Tarjetas de producto con imágenes, precio y categoría.
- Filtros por categoría y búsqueda instantánea.
- Carrito lateral con contador, cantidades y total dinámico.

### Órdenes (`orders.html`)
- Tabla con avatar del cliente, ID de pedido y estados.
- Filtros por pestañas (Pendiente, Enviado, Entregado, Cancelado).

---

##  Responsive Design

- **Desktop:** Menú lateral fijo (260px) + área de contenido principal.
- **Tablet/Móvil:** Menú lateral se oculta y se despliega con botón hamburguesa. Overlay semitransparente.
- El carrito en móvil ocupa el 100% del ancho.

---

##  Licencia

Este proyecto se comparte con fines educativos y de demostración.  
Puedes utilizarlo y modificarlo libremente para tus propios proyectos.

---

##  Autor

Desarrollado como prototipo frontend de un sistema de gestión comercial.  
Si tienes sugerencias o mejoras, ¡las contribuciones son bienvenidas!

---

**TradConnect** – *Conecta tus suministros, impulsa tus resultados* 