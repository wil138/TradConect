// router.js - CON VALIDACIÓN DE TOKEN Y REDIRECCIÓN AL LOGIN
const router = {
    routes: {
        'marketplace': 'fragments/marketplace.html',
        'dashboard': 'fragments/dashboard.html',
        'profile': 'fragments/profile.html',
        'orders': 'fragments/orders.html',
        'inventory': 'fragments/inventory.html',
        'analytics': 'fragments/analytics.html'
    },
    currentModule: null,

    // ----------------------------------------------
    // Cargar módulo (con validación de token)
    // ----------------------------------------------
    async loadModule(moduleName) {
        // 🔐 Verificar token antes de cargar cualquier módulo
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.warn("⛔ No hay token de autenticación. Redirigiendo al login.");
            this.redirectToLogin();
            return;
        }

        // Si el módulo no existe, redirigir al predeterminado según rol
        if (!this.routes[moduleName]) {
            const role = localStorage.getItem('userRole');
            moduleName = role === 'client' ? 'marketplace' : 'dashboard';
        }

        this.currentModule = moduleName;
        localStorage.setItem('currentModule', moduleName);

        // Actualizar menú
        document.querySelectorAll('.menu-item').forEach(item => {
            const module = item.getAttribute('data-module');
            if (module === moduleName) item.classList.add('active');
            else item.classList.remove('active');
        });

        try {
            const response = await fetch(this.routes[moduleName]);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const html = await response.text();

            const mainView = document.getElementById('main-view');
            if (mainView) mainView.innerHTML = html;

            // Ejecutar scripts dentro del fragmento
            const scripts = mainView.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

            // Inicializar módulo si existe
            if (window[moduleName] && typeof window[moduleName].init === 'function') {
                window[moduleName].init();
            }
        } catch (error) {
            console.error("❌ Error al cargar el módulo:", error);
            const mainView = document.getElementById('main-view');
            if (mainView) {
                mainView.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error al cargar el contenido: ${error.message}</p>
                        <button onclick="router.loadModule('${moduleName}')" class="btn-primary">Reintentar</button>
                    </div>
                `;
            }
        }
    },

    // ----------------------------------------------
    // Inicializar router (con validación de token)
    // ----------------------------------------------
    init() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.warn("⛔ No hay token de autenticación. Redirigiendo al login.");
            this.redirectToLogin();
            return;
        }

        // Manejar navegación con botones atrás/adelante
        window.addEventListener('popstate', (event) => {
            const module = event.state?.module || localStorage.getItem('currentModule');
            if (module && this.routes[module]) {
                this.loadModule(module);
            }
        });

        // Cargar último módulo visitado o el predeterminado según rol
        const savedModule = localStorage.getItem('currentModule');
        const role = localStorage.getItem('userRole');

        if (savedModule && this.routes[savedModule]) {
            this.loadModule(savedModule);
        } else if (role === 'client') {
            this.loadModule('marketplace');
        } else if (role === 'provider') {
            this.loadModule('dashboard');
        } else {
            this.loadModule('marketplace');
        }
    },

    // ----------------------------------------------
    // Navegación programática
    // ----------------------------------------------
    navigateTo(moduleName) {
        if (this.routes[moduleName]) {
            history.pushState({ module: moduleName }, '', `#${moduleName}`);
            this.loadModule(moduleName);
        }
    },

    // ----------------------------------------------
    // 🔐 Redirigir al login (landing page)
    // ----------------------------------------------
    redirectToLogin() {
        // Limpiar localStorage para evitar estados inconsistentes
        localStorage.clear();

        // Mostrar el landing page y ocultar el SPA
        const landingWrapper = document.getElementById('landing-wrapper');
        const spaWrapper = document.getElementById('spa-wrapper');

        if (landingWrapper) landingWrapper.style.display = 'block';
        if (spaWrapper) spaWrapper.style.display = 'none';

        // Limpiar contenido del main-view
        const mainView = document.getElementById('main-view');
        if (mainView) mainView.innerHTML = '';

        // Recargar la página para reiniciar el estado completamente
        window.location.reload();
    }
};

// Exportar router globalmente
window.router = router;