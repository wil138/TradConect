function toggleMenu() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".overlay");

  // Alternar el estado del sidebar y el overlay
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

// Cerrar el sidebar al hacer clic en el overlay
const overlay = document.querySelector(".overlay");
overlay.addEventListener("click", () => {
  const sidebar = document.querySelector(".sidebar");

  // Asegurar que el sidebar y el overlay se cierren
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

const sidebar = document.getElementById("sidebar");
const menu = document.getElementById("menu");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");

// 🔁 Estado
let role = "provider"; // 'provider' | 'client'
let isOpen = false;

// 📦 Menús
const clientMenu = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Mis Pedidos", href: "/my-orders" },
  { label: "Mis Facturas", href: "/invoices" },
  { label: "Mi Perfil", href: "/profile" },
];

const providerMenu = [
  { label: "Dashboard", href: "/" },
  { label: "Mi Inventario", href: "/inventory" },
  { label: "Pedidos Recibidos", href: "/orders" },
  { label: "Facturación", href: "/invoices" },
  { label: "Análisis Estratégico", href: "/analytics" },
];
// cambio de rol
function ToggleRole() {
  role = (role === "provider") ? "client" : "provider";

  const textopantalla = document.getElementById("role-text");

  if (textopantalla) {
    // Cambiar el texto dinámico del rol
    textopantalla.textContent = `Modo: ${role === 'provider' ? 'Proveedor' : 'Cliente'}`;
  }

  renderMenu();
}

// Inicializar logo dinámicamente
document.addEventListener("DOMContentLoaded", () => {
  const logoContainer = document.querySelector(".logo");

  if (logoContainer) {
    logoContainer.innerHTML = `
      <div class="logocolor">
        <samp class="iniciallogo">CC</samp>
      </div>
      <span class="nombrelogo">Commerce Connect</span>
    `;
  }

  renderMenu();
});

// 🧠 Render dinámico
function renderMenu() {
  const items = role === "provider" ? providerMenu : clientMenu;

  menu.innerHTML = "";

  items.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.label;

    btn.onclick = () => {
      window.location.href = item.href;
    };

    menu.appendChild(btn);
  });
}
document.addEventListener("DOMContentLoaded", renderMenu);
