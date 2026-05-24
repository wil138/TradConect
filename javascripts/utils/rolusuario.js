// rolusuario.js - Gestión de roles y menú para SPA (CORREGIDO)

// --- Gestión del Sidebar y Overlay ---
function toggleMenu() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    
    if (sidebar && overlay) {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    }
}

function closeAll() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    const cartSidebar = document.getElementById("cartSidebar");
    
    if (sidebar) sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    if (cartSidebar) cartSidebar.classList.remove("open");
}

// --- Gestión de Roles y Menú ---
let currentRole = localStorage.getItem('userRole') || "client";

const menus = {
    client: [
        { label: "Marketplace", module: "marketplace", icon: "fa-shop" },
        { label: "Mis Pedidos", module: "orders", icon: "fa-box" },
        { label: "Mis Facturas", module: "invoices", icon: "fa-file-invoice" },
        { label: "Mi Perfil", module: "profile", icon: "fa-user" }
    ],
    provider: [
        { label: "Dashboard", module: "dashboard", icon: "fa-chart-line" },
        { label: "Mi Inventario", module: "inventory", icon: "fa-warehouse" },
        { label: "Pedidos Recibidos", module: "orders", icon: "fa-clipboard-list" },
        { label: "Facturación", module: "invoices", icon: "fa-file-invoice-dollar" },
        { label: "Análisis", module: "analytics", icon: "fa-microchip" },
        { label: "Mi Perfil", module: "profile", icon: "fa-user" }
    ]
};

function ToggleRole() {
    console.log("ToggleRole: Cambiando rol de", currentRole);
    
    currentRole = (currentRole === "provider") ? "client" : "provider";
    localStorage.setItem('userRole', currentRole);
    
    const roleText = document.getElementById("role-text");
    if (roleText) {
        roleText.textContent = `Modo: ${currentRole === 'provider' ? 'Proveedor' : 'Cliente'}`;
    }
    
    renderMenu();
    updateConditionalElements();
    updateHeaderRoleText();
    
    const moduloPorDefecto = currentRole === 'client' ? 'marketplace' : 'dashboard';
    console.log("ToggleRole: Cargando módulo", moduloPorDefecto);
    
    if (typeof window.router !== 'undefined' && window.router.cargarModulo) {
        window.router.cargarModulo(moduloPorDefecto);
    } else {
        console.error("ToggleRole: Router no disponible");
    }
}

function renderMenu() {
    const menuContainer = document.getElementById("menu");
    if (!menuContainer) {
        console.error("renderMenu: No encuentra #menu");
        return;
    }

    const items = menus[currentRole];
    menuContainer.innerHTML = "";

    items.forEach(item => {
        const link = document.createElement("a");
        link.className = "menu-item";
        link.style.cursor = "pointer";
        link.setAttribute('data-module', item.module);
        
        link.innerHTML = `
            <i class="fa-solid ${item.icon}" style="width: 20px; margin-right: 10px;"></i>
            <span>${item.label}</span>
        `;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const modulo = item.module;
            console.log("Menu click: Navegando a", modulo);
            
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            link.classList.add('active');
            closeAll();
            
            if (typeof window.router !== 'undefined' && window.router.cargarModulo) {
                window.router.cargarModulo(modulo);
            } else {
                console.warn('Router no disponible');
                const mainView = document.getElementById('main-view');
                if (mainView) {
                    mainView.innerHTML = '<div class="error">Error: Router no disponible</div>';
                }
            }
        });
        
        menuContainer.appendChild(link);
    });
    
    const roleText = document.getElementById("role-text");
    if (roleText) {
        roleText.textContent = `Modo: ${currentRole === 'provider' ? 'Proveedor' : 'Cliente'}`;
    }
    
    const moduloActual = localStorage.getItem('currentModule');
    if (moduloActual) {
        document.querySelectorAll('.menu-item').forEach(link => {
            if (link.getAttribute('data-module') === moduloActual) {
                link.classList.add('active');
            }
        });
    }
}

function updateConditionalElements() {
    const cartToggle = document.getElementById("cartToggle");
    if (cartToggle) {
        cartToggle.style.display = (currentRole === "client") ? "flex" : "none";
        console.log(`Carrito ${currentRole === "client" ? "visible" : "oculto"}`);
    }
    
    const searchContainer = document.querySelector(".search-container");
    if (searchContainer) {
        searchContainer.style.display = (currentRole === "client") ? "flex" : "none";
    }
    
    const cartSidebar = document.getElementById("cartSidebar");
    if (cartSidebar && currentRole !== "client") {
        cartSidebar.classList.remove("open");
    }
}

function updateHeaderRoleText() {
    const userRoleSpan = document.getElementById("spaUserRole");
    if (userRoleSpan) {
        userRoleSpan.textContent = currentRole === 'provider' ? 'Proveedor' : 'Cliente';
    }
}

// Exponer funciones globales
window.toggleMenu = toggleMenu;
window.closeAll = closeAll;
window.ToggleRole = ToggleRole;
window.renderMenu = renderMenu;
window.updateConditionalElements = updateConditionalElements;
window.updateHeaderRoleText = updateHeaderRoleText;

// Inicializar elementos condicionales al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".overlay");
    if (overlay) {
        overlay.addEventListener("click", () => {
            closeAll();
        });
    }
    // Solo renderizar menú si estamos en SPA (existe main-view)
    if (document.getElementById('main-view')) {
        renderMenu();
        updateConditionalElements();
        updateHeaderRoleText();
    }
});