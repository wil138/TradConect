// --- Gestión del Sidebar ---
function toggleMenu() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    
    if (sidebar && overlay) {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    }
}

// Cerrar al hacer clic en el overlay
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector(".overlay");
    if (overlay) {
        overlay.addEventListener("click", toggleMenu);
    }
    
    // Inicializar menú
    renderMenu();
});

// --- Gestión de Roles y Menú ---
let currentRole = localStorage.getItem('userRole') || "provider";

const menus = {
    client: [
        { label: "Marketplace", href: "marketplace.html", icon: "fa-shop" },
        { label: "Mis Pedidos", href: "orders.html", icon: "fa-box" },
        { label: "Mis Facturas", href: "invoices.html", icon: "fa-file-invoice" },
        { label: "Mi Perfil", href: "profile.html", icon: "fa-user" }
    ],
    provider: [
        { label: "Dashboard", href: "index.html", icon: "fa-chart-line" },
        { label: "Mi Inventario", href: "inventory.html", icon: "fa-warehouse" },
        { label: "Pedidos Recibidos", href: "orders.html", icon: "fa-clipboard-list" },
        { label: "Facturación", href: "invoices.html", icon: "fa-file-invoice-dollar" },
        { label: "Análisis", href: "analytics.html", icon: "fa-microchip" }
    ]
};

function ToggleRole() {
    currentRole = (currentRole === "provider") ? "client" : "provider";
    localStorage.setItem('userRole', currentRole);
    
    const roleText = document.getElementById("role-text");
    if (roleText) {
        roleText.textContent = `Modo: ${currentRole === 'provider' ? 'Proveedor' : 'Cliente'}`;
    }
    
    renderMenu();
}

function renderMenu() {
    const menuContainer = document.getElementById("menu");
    if (!menuContainer) return;

    const items = menus[currentRole];
    menuContainer.innerHTML = "";

    items.forEach(item => {
        const link = document.createElement("a");
        link.href = item.href;
        link.className = "menu-item";
        
        // Obtener el nombre del archivo actual
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        if (currentPage === item.href) {
            link.classList.add("active");
        }

        link.innerHTML = `
            <i class="fa-solid ${item.icon}" style="width: 20px; margin-right: 10px;"></i>
            <span>${item.label}</span>
        `;

        menuContainer.appendChild(link);
    });

    const roleText = document.getElementById("role-text");
    if (roleText) {
        roleText.textContent = `Modo: ${currentRole === 'provider' ? 'Proveedor' : 'Cliente'}`;
    }
}