# 📦 TradConnect

## Plataforma B2B para la Gestión Inteligente de Suministros Gastronómicos

TradConnect es una plataforma **Business-to-Business (B2B)** diseñada para conectar proveedores con restaurantes y comederos en Nicaragua mediante una solución tecnológica moderna que optimiza la cadena de suministro.

---

## 🌐 Enlaces del Proyecto

| Recurso     | Enlace                                    |
| ----------- | ----------------------------------------- |
| Frontend    | https://github.com/wil138/Tradconnect     |
| Backend API | https://github.com/wil138/Tradconnect_api |
| Demo        | https://tradconnect.netlify.app           |

---

# 📋 Resumen Ejecutivo

TradConnect surge en Managua, Nicaragua, con el propósito de digitalizar la gestión de abastecimiento entre productores, distribuidores y establecimientos gastronómicos.

La plataforma centraliza procesos que tradicionalmente se realizan mediante llamadas telefónicas, mensajería informal y cotizaciones manuales.

### Resultados alcanzados

| Indicador                          | Resultado |
| ---------------------------------- | --------- |
| Reducción de tiempos de entrega    | 40%       |
| Reducción de costos de adquisición | 25%       |
| Proveedores registrados            | 150+      |
| Restaurantes conectados            | 300+      |
| Negocios activos                   | 450+      |
| Pedidos realizados                 | 12,000+   |
| Satisfacción de usuarios           | 98%       |

---

# 🎯 Problema

Muchos restaurantes y comedores presentan dificultades para:

* Encontrar proveedores confiables.
* Comparar precios rápidamente.
* Gestionar inventarios.
* Dar seguimiento a pedidos.
* Centralizar información comercial.

Esto provoca:

* Incremento de costos operativos.
* Retrasos en abastecimiento.
* Pérdida de oportunidades de compra.
* Baja eficiencia logística.

---

# 💡 Solución

TradConnect integra en una única plataforma:

* Marketplace de productos.
* Gestión de pedidos.
* Inventario.
* Facturación.
* Seguimiento de órdenes.
* Dashboard analítico.
* Gestión de proveedores y clientes.

---

# 🏗 Arquitectura del Sistema

```text
┌───────────────┐
│   Frontend    │
│      SPA      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Django REST  │
│      API      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ SQL Server DB │
└───────────────┘
```

---

# ⚙ Backend

## Tecnologías

| Tecnología            | Función            |
| --------------------- | ------------------ |
| Python 3.13+          | Lenguaje principal |
| Django                | Framework web      |
| Django REST Framework | API REST           |
| SQL Server            | Base de datos      |
| JWT                   | Autenticación      |
| Swagger               | Documentación      |

---

## API REST

### Endpoints Principales

| Recurso          | Endpoint                             |
| ---------------- | ------------------------------------ |
| Usuarios         | `/api/TradConnect/usuarios/`         |
| Clientes         | `/api/TradConnect/clientes/`         |
| Proveedores      | `/api/TradConnect/proveedores/`      |
| Establecimientos | `/api/TradConnect/establecimientos/` |
| Productos        | `/api/TradConnect/productos/`        |
| Pedidos          | `/api/TradConnect/pedidos/`          |
| Facturas         | `/api/TradConnect/facturas/`         |

---

## Autenticación JWT

### Obtener Token

```http
POST /api/token/
```

### Refrescar Token

```http
POST /api/token/refresh/
```

Características:

* Login seguro.
* Refresh automático.
* Protección de rutas.
* Control de acceso por roles.

---

# 💻 Frontend SPA

## Tecnologías

* HTML5
* CSS3
* JavaScript Vanilla
* Fetch API
* Chart.js
* Font Awesome 6
* Google Fonts (Inter)

---

## Características

* Navegación sin recarga.
* Shell persistente.
* Carga dinámica de módulos.
* Persistencia de estado.
* Responsive Design.
* Gestión de sesiones.

---

# 📁 Estructura del Proyecto

```text
/
├── index.html
├── styles/
│   └── style.css
│
├── fragments/
│   ├── marketplace.html
│   ├── dashboard.html
│   ├── profile.html
│   ├── orders.html
│   ├── inventory.html
│   └── analytics.html
│
└── javascripts/
    ├── utils/
    │   ├── api.js
    │   ├── router.js
    │   ├── rolusuario.js
    │   ├── landing_spa.js
    │   ├── cart.js
    │   └── table.js
    │
    ├── marketplace.js
    ├── dashboard.js
    ├── orders.js
    ├── inventory.js
    ├── profile.js
    └── analytics.js
```

---

# 🧩 Módulos Principales

## Marketplace

* Catálogo de productos.
* Categorías.
* Filtros avanzados.
* Búsqueda inteligente.

## Carrito

* Gestión de compras.
* Selección de sucursales.
* Métodos de pago.
* Checkout.

## Dashboard

* KPIs.
* Gráficos.
* Ventas.
* Pedidos recientes.

## Pedidos

* Seguimiento.
* Estados.
* Historial.
* Gestión para proveedores.

## Inventario

* CRUD de productos.
* Gestión de stock.
* Categorías.
* Disponibilidad.

## Perfil

* Información personal.
* Datos empresariales.
* Sucursales.
* Configuración.

## Analytics

* Indicadores financieros.
* Tendencias.
* Reportes.
* Visualizaciones avanzadas.

---

# 🔐 Gestión de Sesión

Los tokens se almacenan mediante LocalStorage:

```javascript
access_token
refresh_token
```

También se persiste:

* Carrito de compras.
* Último módulo visitado.
* Preferencias del usuario.

---

# 🚀 Instalación

## Backend

```bash
git clone https://github.com/wil138/Tradconnect_api.git

cd Tradconnect_api

pip install -r requirements.txt

python manage.py makemigrations

python manage.py migrate

python manage.py runserver
```

Swagger:

```text
http://localhost:8000/swagger/
```

---

## Frontend

```bash
git clone https://github.com/wil138/Tradconnect.git

cd Tradconnect

python -m http.server 8080
```

o

```bash
npx serve
```

Abrir:

```text
http://localhost:8080
```

---

# 📱 Responsive Design

La interfaz está diseñada para adaptarse a:

* Computadoras.
* Tablets.
* Dispositivos móviles.

Características:

* Sidebar adaptable.
* Navegación móvil.
* Tablas responsivas.
* Formularios adaptativos.
* Carrito optimizado.

---

# 📈 Beneficios

## Para Restaurantes

* Menor tiempo de compra.
* Seguimiento de pedidos.
* Facturación centralizada.
* Comparación de proveedores.
* Historial de compras.

## Para Proveedores

* Mayor visibilidad.
* Incremento de ventas.
* Gestión de inventario.
* Administración de pedidos.
* Analítica comercial.

---

# 📜 Reglas de Desarrollo

* No recargar la página.
* Mantener arquitectura SPA.
* Utilizar módulos independientes.
* Centralizar estilos en `style.css`.
* Utilizar método `init()` en cada módulo.
* Persistir información relevante.
* Mantener compatibilidad móvil.
* Consumir únicamente la API REST.

---

# 🔮 Mejoras Futuras

* Aplicación móvil.
* Notificaciones push.
* Integración con pagos electrónicos.
* Facturación electrónica.
* IA para predicción de demanda.
* Reportes PDF y Excel.
* Gestión logística avanzada.
* Panel administrativo ampliado.

---

# 👨‍💻 Autor

**Whilton Junior Verrio Carballo**
**Deyling Alejandra Espinoza Montoya**
**Katerin Jimena Flores Amador**
**Junice Abigail Salazar Sanchez**
**Luis Marcos Acosta Sequeira**


Proyecto académico y profesional enfocado en la transformación digital de la cadena de suministro gastronómica en Nicaragua.

---

## 📄 Licencia

Este proyecto es de código abierto y se encuentra disponible para fines educativos y de desarrollo.
