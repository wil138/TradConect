# Reglas de Desarrollo AI - TradConnect

## Stack Tecnológico
- **Lenguaje**: JavaScript (ES6+) para la lógica del lado del cliente.
- **Estructura**: SPA (Single Page Application) con shell persistente y carga dinámica de fragmentos.
- **Estilos**: CSS3 personalizado con variables para mantener la consistencia visual.
- **Iconos**: Font Awesome 6.0 para la iconografía del sitio.
- **Fuentes**: Google Fonts (Inter) para una tipografía moderna y legible.
- **Visualización de Datos**: Chart.js para los tableros de control y gráficos analíticos.
- **Organización**: Separación clara entre shell (index.html), fragmentos (fragments/), estilos (styles/) y scripts (javascripts/).

## Arquitectura SPA (Single Page Application)

### Principios Fundamentales
1. **Shell persistente**: Sidebar, header, footer y carrito NUNCA se recargan.
2. **Carga dinámica**: El contenido se inyecta en <main id="main-view"> mediante fetch.
3. **Módulos encapsulados**: Cada sección tiene su propio objeto global (ej. window.marketplace) con método init().
4. **Persistencia de estado**: Último módulo visitado se guarda en localStorage y se restaura al recargar.
5. **Navegación sin recargas**: El router intercepta clics y carga fragmentos asíncronamente.

### Estructura de Carpetas
![alt text](/img/image.png)

## Reglas de Desarrollo

### HTML
- **index.html**: Contiene únicamente el shell (sidebar, header, footer, #main-view y carrito lateral).
- **Fragmentos (fragments/*.html)**: NO tienen <html>, <head>, <body>. Solo contienen HTML específico.
- **Enlaces del menú**: Usar data-module en lugar de href para evitar recargas.

### CSS
- Utilizar variables CSS (:root) para colores y espaciados.
- Los estilos deben ser GLOBALES (en index.html), no dentro de fragmentos.
- El contenedor dinámico #main-view debe tener flex: 1 y overflow-y: auto.
- El carrito lateral .cart-sidebar debe tener position: fixed y right: -420px.
- Responsividad: sidebar se oculta en móvil con transform: translateX(-100%).

### JavaScript

#### Router (router.js)
- El router es el corazón de la SPA.
- Debe exponer window.router con métodos init(), cargarModulo(), injectContent().
- Debe guardar el módulo actual en localStorage (currentModule).
- Debe manejar el evento popstate para botones atrás/adelante.
- Debe ejecutar scripts dentro de los fragmentos inyectados.

#### Módulos
- Cada módulo debe ser un objeto global (ej. window.marketplace).
- Debe tener un método init() que se llama desde el fragmento.
- Debe tener un método destroy() opcional.
- No deben usar DOMContentLoaded.

#### Roles (rolusuario.js)
- Dos roles: client y provider.
- El menú se renderiza dinámicamente según el rol.
- ToggleRole() cambia el rol y recarga el módulo correspondiente.
- updateConditionalElements() muestra/oculta carrito según rol.

#### Carrito (marketplace.js)
- Persistencia en localStorage con clave marketplaceCart.
- Calcular: subtotal, ahorro, total general.
- Mostrar precios originales tachados en ofertas.

### Funciones Globales Expuestas
window.toggleCart = () => window.marketplace?.toggleCart();
window.checkout = () => window.marketplace?.checkout();
window.ToggleRole = ToggleRole;
window.toggleMenu = toggleMenu;
window.closeAll = closeAll;

## Principios Generales
- **Simplicidad**: Código elegante sin librerías innecesarias.
- **Modularidad**: Cada módulo es independiente.
- **Responsividad**: Funciona en móvil y escritorio.
- **Mantenibilidad**: Comentar secciones clave.
- **Persistencia**: Usar localStorage para mantener estado.
- **Sin recargas**: La navegación nunca recarga la página completa.

## Comandos de Desarrollo
- **Ejecutar**: Live Server de VS Code o python -m http.server 8080
- **Depurar**: F12 -> Console
- **Resetear**: F12 -> Application -> Local Storage -> Clear

## Reglas de Validación
- [ ] El router carga el último módulo visitado al recargar.
- [ ] Los fragmentos no tienen html/head/body.
- [ ] Cada módulo expone init() y se llama desde el fragmento.
- [ ] El carrito persiste entre navegaciones.
- [ ] Los descuentos y totales se calculan correctamente.
- [ ] El carrito se muestra/oculta según el rol.
- [ ] La navegación por menú no recarga la página.