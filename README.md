# TradConnect

TradConnect es una plataforma web B2B para relacionar restaurantes y proveedores
de productos gastronómicos. Este repositorio contiene la interfaz web y el
proyecto Django de la API en `TradConnect_Api/`.

> **Desarrollo local:** la configuración web actual apunta a la API en
> `http://localhost:8001/api`. El puerto se define inicialmente en
> [`javascripts/config.js`](./javascripts/config.js) y la API publica la
> configuración activa en `/api/configuracion/`.

## Arquitectura general

```text
Navegador
  └── Frontend SPA (HTML, CSS, JavaScript)
        └── Fetch API + JWT
              └── Django REST Framework
                    ├── SQL Server: catálogo y operaciones del negocio
                    └── MongoDB: identidades, colecciones documentales y pedidos sincronizados
```

El frontend y el backend se ejecutan por separado en desarrollo. SQL Server
conserva los registros operativos existentes; MongoDB se usa para identidad
híbrida, feedback y datos documentales. No hay transacciones distribuidas entre
ambas bases. Los detalles de rutas, cuerpos, permisos y colecciones están en
[`TradConnect_Api/README.md`](./TradConnect_Api/README.md).

## Tecnologías y para qué se utilizan

### Interfaz web

| Tecnología | Uso en este proyecto |
|---|---|
| HTML5 | Shell principal en `index.html`, fragmentos de módulos y páginas públicas de información. |
| CSS3 | Diseño adaptable, temas y estilos globales por grupo de páginas; no se usa un framework CSS. |
| JavaScript ES6+ sin framework | Router SPA, módulos de página, formularios, sesión, carrito y conexión con la API. |
| Fetch API | Solicitudes HTTP al backend, carga de fragmentos y configuración publicada por Django. |
| `localStorage` | Sesión/token y estado local necesario para el flujo SPA, carrito y cachés del cliente. |
| Chart.js | Gráficas de dashboard y analítica. Se carga desde CDN en la página principal; el proyecto no fija una versión en esa URL. |
| Font Awesome 6.0 | Iconografía de navegación, controles y estados. Se carga desde CDN. |
| Google Fonts / Inter | Tipografía de la interfaz. Se carga desde Google Fonts. |
| Node.js `node:test` | Pruebas de regresión del JavaScript; no requiere framework de pruebas adicional. |

El frontend es JavaScript vanilla, sin compilador ni bundler. No hay un
`package.json`; los módulos se cargan desde `index.html`. Para las dependencias
externas (Chart.js, Font Awesome y Google Fonts) se necesita conexión a internet.

### API y persistencia

| Tecnología | Uso en este proyecto |
|---|---|
| Python | Lenguaje del servidor y los comandos de mantenimiento. |
| Django 5.2 | Configuración del proyecto, vistas, templates de conexiones y comandos. |
| Django REST Framework 3.17 | Endpoints JSON, serialización, autenticación/permisos y respuestas HTTP. |
| SimpleJWT 5.5 | Emisión y refresh de tokens; el backend resuelve la identidad personalizada de TradConnect. |
| SQL Server | Catálogos, usuarios/empresas operativos existentes, sucursales, productos, inventario, pedidos y demás datos relacionales. |
| `mssql-django` + `pyodbc` | Backend Django y driver ODBC para conectarse a SQL Server. Requiere un driver ODBC instalado en el sistema. |
| MongoDB + PyMongo | Identidades híbridas, colecciones NoSQL de feedback/documentos y pedidos web sincronizados. |
| Pydantic 2 | Validación tipada de documentos y publicación de esquemas de colecciones NoSQL. |
| drf-yasg / OpenAPI | Generación de Swagger UI, ReDoc y esquema JSON/YAML para las rutas activas. |
| django-cors-headers 4.9 | Middleware de CORS para permitir solicitudes del frontend servido en otro origen durante desarrollo. |

Las versiones de paquetes Python están fijadas en
[`TradConnect_Api/requirements.txt`](./TradConnect_Api/requirements.txt). La
configuración efectiva se encuentra en `TradConnect_Api/config/settings.py` y
usa variables de entorno, además de configuración privada local cuando existe.

## Ejecutar en desarrollo

### 1. Iniciar la API

En PowerShell, desde `TradConnect_Api/`:

```powershell
python -m pip install -r requirements.txt
python manage.py check
python manage.py runserver 127.0.0.1:8001
```

Configura previamente SQL Server y MongoDB para las funciones que los requieren.
La API lee opcionalmente `TradConnect_Api/config/conexiones.local.json` (archivo
privado ignorado por Git); las variables de entorno tienen prioridad. La plantilla
para otras instalaciones es `TradConnect_Api/config/conexiones.example.json`.
No copies credenciales a documentación ni al control de versiones. Revisa el
README de la API para las variables, comprobaciones y advertencias de datos.

En la configuración local documentada:

- Swagger: <http://localhost:8001/swagger/>
- ReDoc: <http://localhost:8001/redoc/>
- Estado de conexiones SQL/MongoDB: <http://localhost:8001/api/conexiones/>
- Panel visual de conexiones: <http://localhost:8001/conexiones/>

### 2. Servir el frontend

Desde la raíz de este repositorio, usa Live Server en VS Code o inicia un servidor
estático local:

```powershell
python -m http.server 8080
```

Abre <http://localhost:8080>. La web consulta `/api/configuracion/` para
confirmar las rutas públicas del backend. Si Django usa otro host o puerto,
actualiza `javascripts/config.js` para que la configuración inicial apunte a ese
servidor. Sirve la web por HTTP local; abrir el HTML directamente como archivo
puede impedir las solicitudes `fetch()` y la carga de fragmentos.

## Estructura del repositorio

```text
TradConect/
├── index.html
├── prueba.html
├── Styles/
├── assets/
├── fragments/
├── informacion/
├── javascripts/
│   └── utils/
├── tests/
└── TradConnect_Api/
    ├── config/
    ├── TradConnect/
    │   ├── static/config/
    │   └── templates/config/
    └── Tradconnect_no_sql/
        ├── fixtures/
        └── management/commands/
```

### Frontend y contenido

| Carpeta o archivo | Propósito |
|---|---|
| `index.html` | Página de entrada y shell persistente de la SPA; carga hojas de estilo y scripts comunes, y contiene las áreas compartidas de navegación y contenido. |
| `prueba.html` | Página HTML de prueba/compatibilidad. No es la entrada documentada para el uso normal de la aplicación. |
| `Styles/` | Hojas CSS: `style.css` para la base de la aplicación, `landing.css` para la portada, `information.css` para páginas informativas, `modules.css` para estilos compartidos de módulos y `theme.css` para temas. |
| `assets/` | Recursos gráficos locales; incluye el SVG de imagen de producto de reemplazo. |
| `fragments/` | Vistas HTML parciales insertadas dentro del shell; no son páginas HTML completas ni contienen la carga general de scripts. |
| `informacion/` | Páginas públicas completas: cómo funciona, comunidad, restaurantes y proveedores. |
| `javascripts/` | Lógica de los módulos SPA: analytics, dashboard, documentos, feedback, inventario, marketplace, pedidos y perfil. |
| `javascripts/utils/` | Funciones compartidas de API, carrito, sesión/roles, router, utilidades, exportación, temas e interacciones de la portada. |
| `tests/` | Pruebas Node.js para regresiones del frontend y pruebas Python de integración/registro. |
| `RULES.md` | Convenciones del frontend: estructura SPA, carga de fragmentos, módulos y estilos. |
| `.gitignore` | Excluye configuración privada local y archivos generados que no deben versionarse. |
| `LICENSE` | Licencia declarada en el repositorio. |

### Fragmentos de la SPA

| Archivo | Sección presentada |
|---|---|
| `fragments/marketplace.html` | Catálogo público y selección de productos. |
| `fragments/orders.html` | Pedidos y su estado. |
| `fragments/inventory.html` | Productos y stock del proveedor. |
| `fragments/profile.html` | Perfil, empresa y sucursales. |
| `fragments/analytics.html` | Analítica por rol. |
| `fragments/Dashboard.html` | Panel del proveedor. Conserva la capitalización histórica del nombre. |
| `fragments/feedback.html` | Evaluaciones, incidencias, comentarios, preferencias y necesidades. |
| `fragments/documents.html` | Administración de colecciones documentales. |

### Módulos JavaScript

| Archivo | Responsabilidad |
|---|---|
| `javascripts/config.js` | URL inicial de la API que confirma luego el endpoint de configuración del backend. |
| `javascripts/marketplace.js` | Búsqueda, filtros, catálogo y acciones de compra. |
| `javascripts/utils/cart.js` | Estado del carrito, sucursal, método de pago, cotización y confirmación de compra. |
| `javascripts/orders.js` | Consulta y actualización de pedidos. |
| `javascripts/inventory.js` | Gestión de productos, inventario y promociones. |
| `javascripts/profile.js` | Gestión del perfil, datos de empresa y sucursales. |
| `javascripts/analytics.js` | Consulta y presentación de analítica de cliente o proveedor. |
| `javascripts/dashboard.js` | Indicadores, avisos operativos y gráficas de actividad/ventas diarias del proveedor. |
| `javascripts/notifications.js` | Campanita accesible con avisos actuales de pedidos e inventario. |
| `javascripts/feedback.js` | Formularios de feedback y sus colecciones. |
| `javascripts/documents.js` | Consulta, exportación y alta administrativa de documentos. |
| `javascripts/utils/api.js` | Cliente HTTP común: JSON, JWT, refresh, caché pública, adaptadores por recurso y conteo de errores en memoria. |
| `javascripts/utils/router.js` | Navegación SPA, carga de fragmentos y manejo del historial. |
| `javascripts/utils/rolusuario.js` | Normalización de rol, menú y comportamiento dependiente del tipo de usuario. |
| `javascripts/utils/common.js` | Formato, sanitización y utilidades DOM/estado comunes. |
| `javascripts/utils/export.js` | Exportación de datos desde módulos del frontend. |
| `javascripts/utils/theme.js` | Preferencia y aplicación del tema visual. |
| `javascripts/utils/landing_spa.js`, `landing_interactions.js` | Inicio de sesión/registro y comportamiento interactivo de la portada. |
| `javascripts/utils/information.js` | Comportamiento compartido de páginas informativas. |
| `javascripts/utils/table.js` | Ayudantes de tabla mantenidos para pantallas que los utilicen. |

## Proyectos y carpetas del backend

El backend es un proyecto Django independiente dentro de `TradConnect_Api/`.
Sus aplicaciones de negocio son `TradConnect` y `Tradconnect_no_sql`; `config/`
es el paquete del proyecto Django.

### `TradConnect_Api/config/`

| Archivo o subcarpeta | Propósito |
|---|---|
| `settings.py` | Aplicaciones instaladas, SQL Server, MongoDB, JWT, idioma, middleware y DRF. |
| `urls.py` | Enrutador central: API SQL, API NoSQL, configuración/conexiones y documentación. |
| `asgi.py`, `wsgi.py` | Puntos de entrada de despliegue ASGI y WSGI. |
| `mongodb.py` | Cliente MongoDB compartido y acceso a la base configurada. |
| `connection_settings.py` | Carga configuración local privada y validación de su forma. |
| `conexiones.example.json` | Plantilla sin credenciales para configurar otra instalación. |
| `conexiones.local.json` | Configuración privada local opcional; se mantiene fuera del repositorio. |
| `local_secret.py` | Obtiene/gestiona el secreto local de Django, fuera del README y del código compartido. |
| `schema.py` | Ordena y etiqueta los grupos SQL y MongoDB en la documentación OpenAPI. |

### `TradConnect_Api/TradConnect/`

Aplicación de autenticación, comercio y recursos SQL. Los modelos apuntan a las
tablas existentes; la API no crea automáticamente las tablas operativas.

| Archivo o subcarpeta | Propósito |
|---|---|
| `urls.py` | Registra endpoints SQL y rutas de autenticación. |
| `hybrid_views.py` | Vistas activas: autenticación, empresa, sucursales, productos, marketplace, stock, promociones, pedidos, dashboard y catálogos. |
| `hybrid_serializers.py` | Contratos de producto, sucursal, inventario, detalle y pedido; incluye campos de presentación/entrada específicos. |
| `sql_models.py` | Modelos Django sobre el esquema SQL Server existente. |
| `identities.py` | Resolución de identidad MongoDB, rol y empresa desde el JWT. |
| `authentication.py` | Autenticación JWT compatible con el usuario personalizado de TradConnect. |
| `commerce.py` | Validación de cotización/compra, cálculo de totales, reserva/descuento de inventario y token de cotización. |
| `errors.py` | Conversión de errores de base de datos/configuración a respuestas API controladas. |
| `models.py`, `serializers.py`, `views.py` | Modelos, serializadores y vistas heredadas; algunos conservan compatibilidad con instalaciones antiguas. Para rutas activas, revisar `urls.py`. |
| `static/config/` | CSS y JavaScript del panel de conexiones servido por Django. |
| `templates/config/` | Template HTML del panel de conexiones. |
| `admin.py`, `apps.py`, `__init__.py` | Registro/configuración de la aplicación y archivos del paquete Django. |

### `TradConnect_Api/Tradconnect_no_sql/`

Aplicación de colecciones documentales, proyecciones MongoDB, analítica y
sincronización de pedidos. Las colecciones documentales se validan en los
servicios Pydantic; las proyecciones históricas de SQL se exponen en modo lectura.

| Archivo o subcarpeta | Propósito |
|---|---|
| `urls.py` | Rutas de analítica, cliente/proveedor, colecciones, esquemas y pedidos sincronizados. |
| `models.py` | Esquemas Pydantic y nombres de las trece colecciones documentales. |
| `services.py` | Validación de documentos, referencias SQL/MongoDB, creación y serialización de documentos. |
| `document_views.py` | CRUD administrativo de colecciones con esquema. |
| `customer_views.py` | Flujos por empresa de feedback, preferencias, necesidades y respuesta a reclamos. |
| `analytics_views.py` | Analítica de pedidos SQL y métricas de feedback MongoDB. |
| `order_views.py`, `order_sync.py`, `signals.py` | Lectura/sincronización de pedidos web y reacción a cambios de pedido SQL. |
| `projections.py`, `views.py` | Proyecciones de solo lectura de modelos SQL y permisos administrativos. |
| `data_pipeline.py`, `cleaning.py`, `restore_data.py`, `audit.py` | Limpieza, extracción/importación, restauración y comparación/auditoría de datos. |
| `management/commands/` | Comandos de mantenimiento e integración descritos abajo. |
| `fixtures/` | Ejemplos de formato para carga; ajustar referencias a IDs reales antes de importar. |
| `test_*.py`, `tests.py` | Pruebas de esquema, permisos, flujos, pedidos, integración, importación/exportación y restauración. |
| `admin.py`, `apps.py`, `__init__.py` | Registro y configuración de la aplicación Django. |

#### Comandos de `management/commands/`

| Comando | Uso |
|---|---|
| `cargar_usuarios_nosql` | Proyecta usuarios, empresas y roles SQL a la colección de identidad; admite `--validar`. |
| `cargar_documentos_nosql` | Valida e importa documentos desde JSON; admite `--validar`. |
| `cargar_nosql` | Carga histórica de proyecciones documentales SQL, no reemplaza los comandos de las colecciones de negocio. |
| `sincronizar_pedidos` | Sincroniza pedidos SQL a la colección de consulta `pedidos_web`. |
| `auditar_bases` | Compara conteos, claves y vínculos SQL/MongoDB en modo de lectura. |
| `verificar_integracion` | Ejecuta flujos temporales contra las dos bases y limpia los datos de prueba al terminar. |
| `extraer_bases`, `extraer_datos` | Exportan datos separados SQL/NoSQL; el restablecimiento opcional de hashes es una escritura explícita. |
| `importar_bases` | Valida archivos de exportación; solo reemplaza datos con `--aplicar` y genera respaldo. |
| `activar_usuarios` | Consulta cuentas por correo o todas; requiere `--aplicar` para activar y guardar respaldo. |
| `sincronizar_pedidos` | Sincroniza/verifica pedidos; `--limpiar` elimina proyecciones que ya no existen en SQL. |

Los comandos de importación y restauración pueden escribir datos. Ejecuta primero
su opción de validación cuando esté disponible y utiliza respaldos controlados.

### Carpetas de trabajo local

`TradConnect_Api/.venv/` contiene un entorno virtual local; no es código fuente
ni debe copiarse al despliegue. `TradConnect_Api/.git/` corresponde al control de
versiones del backend. `logs/`, `respaldos/` y `exportaciones_separadas/`
contienen datos/artefactos locales de operación y no forman parte de los módulos
de ejecución; verifica que estén excluidos de publicaciones si contienen datos
reales.

### Pruebas del frontend

| Archivo | Área cubierta |
|---|---|
| `tests/regression.test.cjs` | Funciones compartidas, API, router, roles, carrito y formato monetario. |
| `tests/api-connection.test.cjs` | Carga de configuración y verificación de conexión HTTP desde el cliente API. |
| `tests/notifications.test.cjs` | Avisos activos y presentación segura en la campanita. |
| `tests/marketplace.test.cjs` | Comportamiento de búsqueda y productos de marketplace. |
| `tests/registration.test.cjs` | Validaciones de registro en el cliente. |
| `tests/documents.test.cjs` | Interfaz y llamadas administrativas de documentos. |
| `tests/export.test.cjs` | Exportación de datos. |
| `tests/theme.test.cjs` | Preferencia y aplicación de temas. |
| `tests/registration_integration.py` | Pruebas de integración del registro con la API. |

## Pruebas y comprobaciones

Desde la raíz del repositorio:

```powershell
node --test tests\*.test.cjs
```

Desde `TradConnect_Api/`:

```powershell
python manage.py check
python manage.py test TradConnect.tests
python manage.py test Tradconnect_no_sql
```

`TradConnect.tests` verifica la configuración y el estado de la API sin requerir
una base activa. Para validar una instalación real, consulta
`/api/conexiones/`: además de la conexión SQL, verifica las tablas esperadas por
los modelos y devuelve HTTP 503 con `missing_tables` si el esquema está
incompleto. El endpoint no crea ni modifica tablas.

## Seguridad y datos de configuración

- No guardes contraseñas, tokens ni URI de MongoDB en Git.
- `conexiones.local.json` y secretos locales son archivos privados.
- Los endpoints administrativos documentales requieren rol administrador.
- El API aplica permisos por empresa para los recursos de negocio y valida
  relaciones y stock en servidor.
- Los datos de sesión web se almacenan en el navegador; usa dispositivos de
  confianza y cierra sesión cuando corresponda.

## Referencias

- [Documentación completa de la API](./TradConnect_Api/README.md)
- [Reglas de desarrollo del frontend](./RULES.md)
- [Dependencias del backend](./TradConnect_Api/requirements.txt)
