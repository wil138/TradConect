/// router.js - Motor de carga dinámica SPA (PURIFICADO)

window.router = {
    config: {
        fragmentsPath: 'fragments/',
        containerId: 'main-view'
    },
    
    cache: {},
    currentModule: null,
    
    init: function() {
        console.log("Router: Inicializando");
        
        window.addEventListener('moduleChange', (e) => {
            this.cargarModulo(e.detail.module);
        });
        
        const ultimoModulo = localStorage.getItem('currentModule');
        const rol = localStorage.getItem('userRole') || 'client';
        
        let moduloInicial;
        if (ultimoModulo && this.validarModuloSegunRol(ultimoModulo, rol)) {
            moduloInicial = ultimoModulo;
            console.log(`Router: Restaurando último módulo: ${moduloInicial}`);
        } else {
            moduloInicial = rol === 'client' ? 'marketplace' : 'dashboard';
            console.log(`Router: Módulo por defecto: ${moduloInicial}`);
        }
        
        this.cargarModulo(moduloInicial);
    },
    
    validarModuloSegunRol: function(modulo, rol) {
        const modulosCliente = ['marketplace', 'orders', 'invoices', 'profile'];
        const modulosProveedor = ['dashboard', 'inventory', 'orders', 'invoices', 'analytics', 'profile'];
        
        if (rol === 'client') {
            return modulosCliente.includes(modulo);
        } else {
            return modulosProveedor.includes(modulo);
        }
    },
    
    cargarModulo: function(modulo) {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.warn(`Router: Contenedor #${this.config.containerId} no encontrado.`);
            setTimeout(() => {
                if (document.getElementById(this.config.containerId)) {
                    this.cargarModulo(modulo);
                }
            }, 100);
            return;
        }
        
        // Validar según rol actual
        const rol = localStorage.getItem('userRole') || 'client';
        if (!this.validarModuloSegunRol(modulo, rol)) {
            console.warn(`Módulo ${modulo} no permitido para rol ${rol}`);
            modulo = rol === 'client' ? 'marketplace' : 'dashboard';
        }
        
        console.log(`Router: Cargando módulo ${modulo}`);
        
        this.currentModule = modulo;
        localStorage.setItem('currentModule', modulo);
        window.location.hash = modulo;
        
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
        container.innerHTML = '<div class="loader">Cargando...</div>';
        
        if (this.cache[url]) {
            console.log(`Router: Usando caché para ${modulo}`);
            this.injectContent(this.cache[url], modulo);
            return;
        }
        
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
                        <button onclick="window.router.cargarModulo('marketplace')" class="btn-primary">
                            Volver al Marketplace
                        </button>
                    </div>
                `;
            });
    },
    
    injectContent: function(html, modulo) {
        const container = document.getElementById(this.config.containerId);
        if (!container) return;
        
        console.log(`Router: Inyectando contenido para ${modulo}`);
        container.innerHTML = html;
        
        // Ejecutar scripts
        const scripts = container.querySelectorAll('script');
        scripts.forEach((oldScript) => {
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
        
        this.actualizarMenuActivo(modulo);
        window.dispatchEvent(new CustomEvent('moduleLoaded', { detail: { module: modulo } }));
    },
    
    actualizarMenuActivo: function(modulo) {
        const menuItems = document.querySelectorAll('[data-module]');
        menuItems.forEach(item => {
            if (item.getAttribute('data-module') === modulo) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
};

// Inicializar solo si estamos en SPA (contiene main-view)
if (document.getElementById('main-view')) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOMContentLoaded: Iniciando router");
        window.router.init();
    });
}