// router.js
const router = {
    routes: {
        'marketplace': 'fragments/marketplace.html',
        'dashboard': 'fragments/dashboard.html',
        'profile': 'fragments/profile.html',
        'orders': 'fragments/orders.html',
        'invoices': 'fragments/invoices.html',
        'inventory': 'fragments/inventory.html',
        'analytics': 'fragments/analytics.html'
    },
    currentModule: null,

    async loadModule(moduleName) {
        if (!this.routes[moduleName]) {
            const role = localStorage.getItem('userRole');
            moduleName = role === 'client' ? 'marketplace' : 'dashboard';
        }
        this.currentModule = moduleName;
        localStorage.setItem('currentModule', moduleName);
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
            const scripts = mainView.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
            if (window[moduleName] && typeof window[moduleName].init === 'function') {
                window[moduleName].init();
            }
        } catch (error) {
            console.error("Error al cargar el módulo:", error);
            const mainView = document.getElementById('main-view');
            if (mainView) {
                mainView.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Error al cargar el contenido: ${error.message}</p><button onclick="router.loadModule('${moduleName}')">Reintentar</button></div>`;
            }
        }
    },

    init() {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        window.addEventListener('popstate', (event) => {
            const module = event.state?.module || localStorage.getItem('currentModule');
            if (module && this.routes[module]) this.loadModule(module);
        });
        const savedModule = localStorage.getItem('currentModule');
        const role = localStorage.getItem('userRole');
        if (savedModule && this.routes[savedModule]) this.loadModule(savedModule);
        else if (role === 'client') this.loadModule('marketplace');
        else if (role === 'provider') this.loadModule('dashboard');
        else this.loadModule('marketplace');
    },

    navigateTo(moduleName) {
        if (this.routes[moduleName]) {
            history.pushState({ module: moduleName }, '', `#${moduleName}`);
            this.loadModule(moduleName);
        }
    }
};
window.router = router;