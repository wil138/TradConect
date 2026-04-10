// --- Gestión del Sidebar ---
function toggleMenu() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");
    
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
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
        { label: "Mis Pedidos", href: "#", icon: "fa-box" },
        { label: "Mis Facturas", href: "#", icon: "fa-file-invoice" },
        { label: "Mi Perfil", href: "#", icon: "fa-user" }
    ],
    provider: [
        { label: "Dashboard", href: "index.html", icon: "fa-chart-line" },
        { label: "Mi Inventario", href: "#", icon: "fa-warehouse" },
        { label: "Pedidos Recibidos", href: "#", icon: "fa-clipboard-list" },
        { label: "Facturación", href: "#", icon: "fa-file-invoice-dollar" },
        { label: "Análisis", href: "#", icon: "fa-microchip" }
    ]
};

function ToggleRole() {
    currentRole = (currentRole === "provider") ? "client" : "provider";
    localStorage.setItem('userRole', currentRole);
    
    // Actualizar texto del botón de rol
    const roleText = document.getElementById("role-text");
    if (roleText) {
        roleText.textContent = `Modo: ${currentRole === 'provider' ? 'Proveedor' : 'Cliente'}`;
    }
    
    renderMenu();
    
    // Redirigir si es necesario (opcional)
    if (currentRole === 'client' && window.location.pathname.includes('index.html')) {
        // window.location.href = 'marketplace.html';
    }
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
        
        // Marcar como activo si la URL coincide
        if (window.location.pathname.includes(item.href)) {
            link.classList.add("active");
        }

        link.innerHTML = `
            <i class="fa-solid ${item.icon}" style="width: 20px; margin-right: 10px;"></i>
            <span>${item.label}</span>
        `;

        link.onclick = (e) => {
            if (item.href === "#") {
                e.preventDefault();
                console.log(`Navegando a: ${item.label}`);
            }
        };

        menuContainer.appendChild(link);
    });

    // Actualizar el texto del rol al cargar
    const roleText = document.getElementById("role-text");
    if (roleText) {
        roleText.textContent = `Modo: ${currentRole === 'provider' ? 'Proveedor' : 'Cliente'}`;
    }
}