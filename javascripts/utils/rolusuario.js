// rolusuario.js - VERSIÓN CORREGIDA
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

const menus = {
    client: [
        { label: "Marketplace", module: "marketplace", icon: "fa-shop" },
        { label: "Mis Pedidos", module: "orders", icon: "fa-box" },
        { label: "Mi Perfil", module: "profile", icon: "fa-user" }
    ],
    provider: [
        { label: "Dashboard", module: "dashboard", icon: "fa-chart-line" },
        { label: "Mi Inventario", module: "inventory", icon: "fa-warehouse" },
        { label: "Pedidos Recibidos", module: "orders", icon: "fa-clipboard-list" },
         { label: "Mi Perfil", module: "profile", icon: "fa-user" },
        { label: "Análisis", module: "analytics", icon: "fa-microchip" }
    ]
};

function getCurrentRole() {
    let role = localStorage.getItem('userRole') || "client";
    // Normalizar: si viene 'restaurante' del backend, lo tratamos como 'client'
    if (role === 'restaurante') role = 'client';
    console.log("📌 getCurrentRole() devuelve:", role);
    return role;
}

function renderMenu() {
    const menuContainer = document.getElementById("menu");
    if (!menuContainer) return;
    const role = getCurrentRole();
    console.log("🎨 Renderizando menú para rol:", role);
    const items = menus[role];
    if (!items) {
        console.error("No hay menú para rol:", role);
        return;
    }
    menuContainer.innerHTML = "";
    items.forEach(item => {
        const link = document.createElement("a");
        link.className = "menu-item";
        link.style.cursor = "pointer";
        link.setAttribute('data-module', item.module);
        link.innerHTML = `<i class="fa-solid ${item.icon}" style="width:20px; margin-right:10px;"></i><span>${item.label}</span>`;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            link.classList.add('active');
            closeAll();
            if (window.router && window.router.loadModule) window.router.loadModule(item.module);
        });
        menuContainer.appendChild(link);
    });
    const moduloActual = localStorage.getItem('currentModule');
    if (moduloActual) {
        document.querySelectorAll('.menu-item').forEach(link => {
            if (link.getAttribute('data-module') === moduloActual) link.classList.add('active');
        });
    }
}

function updateConditionalElements() {
    const role = getCurrentRole();
    const cartToggle = document.getElementById("cartToggle");
    if (cartToggle) cartToggle.style.display = (role === "client") ? "flex" : "none";
    const searchContainer = document.querySelector(".search-container");
    if (searchContainer) searchContainer.style.display = (role === "client") ? "flex" : "none";
    const cartSidebar = document.getElementById("cartSidebar");
    if (cartSidebar && role !== "client") cartSidebar.classList.remove("open");
}

function updateRoleFromStorage() {
    console.log("🔄 updateRoleFromStorage llamado");
    renderMenu();
    updateConditionalElements();
    const currentMod = localStorage.getItem('currentModule');
    const role = getCurrentRole();
    const allowed = (role === 'client')
        ? ['marketplace','orders','invoices','profile']
        : ['dashboard','inventory','orders','invoices','analytics'];
    if (currentMod && !allowed.includes(currentMod)) {
        const defaultMod = role === 'client' ? 'marketplace' : 'dashboard';
        if (window.router?.loadModule) window.router.loadModule(defaultMod);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".overlay");
    if (overlay) overlay.addEventListener("click", closeAll);
    renderMenu();
    updateConditionalElements();
});

window.toggleMenu = toggleMenu;
window.closeAll = closeAll;
window.updateRoleFromStorage = updateRoleFromStorage;