// router.js - Motor de carga dinámica SPA (CON PERSISTENCIA DE MÓDULO)

window.router = {
    config: {
        fragmentsPath: 'fragments/',
        containerId: 'main-view'
    },
    
    // Cache de fragmentos cargados
    cache: {},
    
    // Módulo actualmente cargado
    currentModule: null,
    
    // Inicializar router
    init: function() {
        console.log("Router: Inicializando");
        
        // Escuchar eventos de navegación del menú (se disparan desde rolusuario)
        window.addEventListener('moduleChange', (e) => {
            this.cargarModulo(e.detail.module);
        });
        
        // 🔴 CAMBIO IMPORTANTE: Cargar el último módulo visitado, no el del rol
        const ultimoModulo = localStorage.getItem('currentModule');
        const rol = localStorage.getItem('userRole') || 'client';
        
        // Determinar módulo a cargar
        let moduloInicial;
        
        if (ultimoModulo) {
            // Si hay un módulo guardado, usarlo
            moduloInicial = ultimoModulo;
            console.log(`Router: Restaurando último módulo: ${moduloInicial}`);
        } else {
            // Si es la primera vez, usar el módulo por defecto según el rol
            moduloInicial = rol === 'client' ? 'marketplace' : 'dashboard';
            console.log(`Router: Primera vez, módulo por defecto: ${moduloInicial}`);
        }
        
        // Verificar que el módulo existe y es compatible con el rol actual
        const moduloValido = this.validarModuloSegunRol(moduloInicial, rol);
        if (!moduloValido) {
            moduloInicial = rol === 'client' ? 'marketplace' : 'dashboard';
            console.log(`Router: Módulo inválido para el rol, usando: ${moduloInicial}`);
        }
        
        this.cargarModulo(moduloInicial);
    },
    
    // Validar que un módulo sea accesible según el rol
    validarModuloSegunRol: function(modulo, rol) {
        const modulosCliente = ['marketplace', 'orders', 'invoices', 'profile'];
        const modulosProveedor = ['dashboard', 'inventory', 'orders', 'invoices', 'analytics'];
        
        if (rol === 'client') {
            return modulosCliente.includes(modulo);
        } else {
            return modulosProveedor.includes(modulo);
        }
    },
    
    // Cargar un módulo
    cargarModulo: function(modulo) {
        const container = document.getElementById(this.config.containerId);
        if (!container) return;
        
        console.log(`Router: Cargando módulo ${modulo}`);
        
        // Guardar módulo actual en memoria y localStorage
        this.currentModule = modulo;
        localStorage.setItem('currentModule', modulo);
        
        // También guardar la URL en el hash para que el navegador guarde en el historial
        window.location.hash = modulo;
        
        // Mapeo de módulo a archivo
        const archivos = {
            'marketplace': 'marketplace.html',
            'dashboard': 'dashboard.html',
            'inventory': 'inventory.html',
            'orders': 'orders.html',
            'invoices': 'invoices.html',
            'analytics': 'analytics.html',
            'profile': 'profile.html'
        };
        
        const archivo = archivos[modulo];
        if (!archivo) {
            container.innerHTML = '<div class="error-container">Módulo no encontrado</div>';
            return;
        }
        
        const url = this.config.fragmentsPath + archivo;
        
        // Mostrar loader
        container.innerHTML = '<div class="loader">Cargando...</div>';
        
        // Verificar caché
        if (this.cache[url]) {
            console.log(`Router: Usando caché para ${modulo}`);
            this.injectContent(this.cache[url], modulo);
            return;
        }
        
        // Fetch del fragmento
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            })
            .then(html => {
                this.cache[url] = html;
                this.injectContent(html, modulo);
            })
            .catch(error => {
                console.error('Error cargando módulo:', error);
                container.innerHTML = `
                    <div class="error-container">
                        <h3>⚠️ Error al cargar ${modulo}</h3>
                        <p>No se pudo cargar el contenido solicitado.</p>
                        <button onclick="window.router.cargarModulo('marketplace')">
                            Volver al Marketplace
                        </button>
                    </div>
                `;
            });
    },
    
    // Inyectar contenido y ejecutar scripts
    injectContent: function(html, modulo) {
        const container = document.getElementById(this.config.containerId);
        if (!container) return;
        
        console.log(`Router: Inyectando contenido para ${modulo}`);
        
        container.innerHTML = html;
        
        // Ejecutar scripts dentro del fragmento
        const scripts = container.querySelectorAll('script');
        console.log(`Router: Ejecutando ${scripts.length} script(s)`);
        
        scripts.forEach((oldScript, index) => {
            console.log(`Router: Script ${index + 1} - ${oldScript.src || 'inline'}`);
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
                newScript.async = false;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            if (oldScript.id) newScript.id = oldScript.id;
            if (oldScript.type) newScript.type = oldScript.type;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
        
        // Actualizar título
        const titulos = {
            'marketplace': 'Marketplace | TradConnect',
            'dashboard': 'Dashboard | TradConnect',
            'inventory': 'Mi Inventario | TradConnect',
            'orders': 'Mis Pedidos | TradConnect',
            'invoices': 'Facturación | TradConnect',
            'analytics': 'Análisis | TradConnect',
            'profile': 'Mi Perfil | TradConnect'
        };
        document.title = titulos[modulo] || 'TradConnect';
        
        // Actualizar clase active en el menú
        this.actualizarMenuActivo(modulo);
        
        // Disparar evento de módulo cargado
        window.dispatchEvent(new CustomEvent('moduleLoaded', { detail: { module: modulo } }));
    },
    
    // Actualizar la clase active en el menú
    actualizarMenuActivo: function(modulo) {
        const menuItems = document.querySelectorAll('[data-module]');
        menuItems.forEach(item => {
            if (item.getAttribute('data-module') === modulo) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },
    
    // Recuperar módulo desde el hash de la URL (para compartir enlaces)
    getModuloDesdeURL: function() {
        const hash = window.location.hash.substring(1); // quita el #
        const modulosValidos = ['marketplace', 'dashboard', 'inventory', 'orders', 'invoices', 'analytics', 'profile'];
        
        if (modulosValidos.includes(hash)) {
            return hash;
        }
        return null;
    }
};

// Iniciar router cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded: Iniciando router");
    window.router.init();
});

// Manejar botón de "Atrás" / "Adelante" del navegador
window.addEventListener('popstate', () => {
    const modulo = window.router.getModuloDesdeURL();
    if (modulo && modulo !== window.router.currentModule) {
        console.log(`popstate: Navegando a ${modulo}`);
        window.router.cargarModulo(modulo);
    }
});