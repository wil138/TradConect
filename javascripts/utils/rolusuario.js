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
    admin: [{label: 'Mi Perfil', module: 'profile', icon: 'fa-user'}],
    staff: [{label: 'Mi Perfil', module: 'profile', icon: 'fa-user'}],
    client: [
        { label: "Atenci\u00f3n y preferencias", module: "feedback", icon: "fa-comment" },
        { label: "Marketplace", module: "marketplace", icon: "fa-shop" },
        { label: "Mis Pedidos", module: "orders", icon: "fa-box" },
        { label: "An\u00e1lisis de compras", module: "analytics", icon: "fa-chart-pie" },
        { label: "Mi Perfil", module: "profile", icon: "fa-user" }
    ],
    provider: [
        { label: "Reclamos y opiniones", module: "feedback", icon: "fa-comments" },
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

function renderSidebarUser() {
    const user = appUtils.readJSON('user', {});
    const company = appUtils.readJSON('company', {});
    const name = localStorage.getItem('userName') || user.nombreusuario || 'Usuario';
    const role = user.rol_nombre || ({
        client: 'Cliente',
        provider: 'Proveedor',
        admin: 'Administrador',
        staff: 'Personal'
    }[getCurrentRole()] || 'Usuario');
    const companyName = company.razonsocial || '';
    const nameElement = document.getElementById('sidebarUserName');
    const roleElement = document.getElementById('sidebarUserRole');
    const companyElement = document.getElementById('sidebarUserCompany');
    const avatarElement = document.getElementById('sidebarUserAvatar');

    if (nameElement) nameElement.textContent = name;
    if (roleElement) roleElement.textContent = role;
    if (companyElement) {
        companyElement.textContent = companyName || localStorage.getItem('userEmail') || user.correoelectronico || '';
        companyElement.title = companyName || '';
    }
    if (avatarElement) avatarElement.textContent = String(name).trim().charAt(0).toLocaleUpperCase() || 'U';
}

function renderMenu() {
    const menuContainer = document.getElementById("menu");
    renderSidebarUser();
    if (!menuContainer) return;
    const role = getCurrentRole();
    console.log("🎨 Renderizando menú para rol:", role);
    const items = [...(menus[role] || [])];
    const user = appUtils.readJSON('user', {});
    if (['admin', 'administrador'].includes((user.rol_nombre || '').toLowerCase())) {
        items.push({ label: 'Datos MongoDB', module: 'documents', icon: 'fa-database' });
    }
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
            if (window.router && window.router.loadModule) window.router.navigateTo(item.module);
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
    const allowed = (menus[role] || []).map(item => item.module);
    if (role === 'admin') allowed.push('documents');
    if (currentMod && !allowed.includes(currentMod)) window.router?.loadModule(allowed[0] || 'profile');

}

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".overlay");
    if (overlay) overlay.addEventListener("click", closeAll);
    renderMenu();
    updateConditionalElements();
});

window.toggleMenu = toggleMenu;
window.closeAll = closeAll;
window.renderSidebarUser = renderSidebarUser;
window.updateRoleFromStorage = updateRoleFromStorage;