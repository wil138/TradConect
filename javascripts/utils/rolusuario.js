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

// Cerrar todo (sidebar, carrito, overlay)
function closeAll() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    const cartSidebar = document.getElementById("cartSidebar");
    
    if (sidebar) sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    if (cartSidebar) cartSidebar.classList.remove("open");
}

// Cerrar sidebar al hacer clic en overlay
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".overlay");
    if (overlay) {
        overlay.addEventListener("click", () => {
            closeAll(); // Cierra todo, no solo sidebar
        });
    }
    
    renderMenu();
});

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
        { label: "Análisis", module: "analytics", icon: "fa-microchip" }
    ]
};

// Cambiar rol
function ToggleRole() {
    console.log("ToggleRole: Cambiando rol de", currentRole);
    
    currentRole = (currentRole === "provider") ? "client" : "provider";
    localStorage.setItem('userRole', currentRole);
    
    const roleText = document.getElementById("role-text");
    if (roleText) {
        roleText.textContent = `Modo: ${currentRole === 'provider' ? 'Proveedor' : 'Cliente'}`;
    }
    
    renderMenu();
    
    // 🔴 IMPORTANTE: Actualizar elementos condicionales (carrito, búsqueda)
    updateConditionalElements();
    
    // Determinar módulo por defecto según el nuevo rol
    const moduloPorDefecto = currentRole === 'client' ? 'marketplace' : 'dashboard';
    
    console.log("ToggleRole: Cargando módulo", moduloPorDefecto);
    
    // Cambiar al módulo correspondiente vía router
    if (typeof window.router !== 'undefined' && window.router.cargarModulo) {
        window.router.cargarModulo(moduloPorDefecto);
    } else {
        console.error("ToggleRole: Router no disponible");
    }
}

// Renderizar el menú según el rol
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
        
        // IMPORTANTE: No tiene href para evitar navegación
        link.innerHTML = `
            <i class="fa-solid ${item.icon}" style="width: 20px; margin-right: 10px;"></i>
            <span>${item.label}</span>
        `;
        
        // Evento click - Navegación SPA
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Evita propagación
            
            const modulo = item.module;
            console.log("Menu click: Navegando a", modulo);
            
            // Actualizar active visual
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            link.classList.add('active');
            
            // Cerrar sidebar y overlay después del clic (en móvil)
            closeAll();
            
            // Llamar al router para cargar el módulo
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
    
    // Actualizar texto del rol
    const roleText = document.getElementById("role-text");
    if (roleText) {
        roleText.textContent = `Modo: ${currentRole === 'provider' ? 'Proveedor' : 'Cliente'}`;
    }
    
    // Marcar módulo activo según localStorage
    const moduloActual = localStorage.getItem('currentModule');
    if (moduloActual) {
        document.querySelectorAll('.menu-item').forEach(link => {
            if (link.getAttribute('data-module') === moduloActual) {
                link.classList.add('active');
            }
        });
    }
}

// Elementos condicionales según rol (carrito y búsqueda)
function updateConditionalElements() {
    // Icono del carrito en el header
    const cartToggle = document.getElementById("cartToggle");
    if (cartToggle) {
        // Cliente: muestra carrito, Proveedor: oculta carrito
        cartToggle.style.display = (currentRole === "client") ? "flex" : "none";
        console.log(`Carrito ${currentRole === "client" ? "visible" : "oculto"}`);
    } else {
        console.warn("updateConditionalElements: No encuentra #cartToggle");
    }
    
    // Barra de búsqueda en el header
    const searchContainer = document.querySelector(".search-container");
    if (searchContainer) {
        searchContainer.style.display = (currentRole === "client") ? "flex" : "none";
    }
    
    // También actualizar visibilidad en el carrito lateral si está abierto
    const cartSidebar = document.getElementById("cartSidebar");
    if (cartSidebar && currentRole !== "client") {
        cartSidebar.classList.remove("open");
    }
}

// Exponer funciones globales
window.toggleMenu = toggleMenu;
window.closeAll = closeAll;
window.ToggleRole = ToggleRole;

// Inicializar elementos condicionales al cargar la página
updateConditionalElements();