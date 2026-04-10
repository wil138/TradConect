
const products = [
    { id: 1, name: "Cemento Canal 42.5kg", price: 12.50, vendor: "HOLCIM NICARAGUA", category: "Construcción", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500" },
    { id: 2, name: "Hierro Corrugado 3/8", price: 8.75, vendor: "SINSA", category: "Metales", img: "https://images.unsplash.com/photo-1533035350251-aa8b8e208d95?w=500" },
    { id: 3, name: "Pintura Látex Blanca", price: 85.00, vendor: "SHERWIN WILLIAMS", category: "Acabados", img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500" },
    { id: 4, name: "Tubería PVC 1/2\"", price: 2.15, vendor: "DURMAN", category: "Plomería", img: "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?w=500" },
    { id: 5, name: "Taladro Percutor 800W", price: 110.00, vendor: "DEWALT", category: "Herramientas", img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500" }
];

let cart = [];

// --- Renderizado de Productos ---
function renderProducts(filter = 'todos', searchTerm = '') {
    const grid = document.getElementById('productsGrid');

    let filtered = filter === 'todos' ? products : products.filter(p => p.category === filter);

    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    grid.innerHTML = filtered.map(p => `
                <div class="product-card">
                    <div class="img-container">
                        <img src="${p.img}" alt="${p.name}">
                    </div>
                    <div class="info">
                        <span class="vendor">${p.vendor}</span>
                        <h3 class="title">${p.name}</h3>
                        <div class="price">$${p.price.toFixed(2)} <span>/ unidad</span></div>
                        <button class="btn-add" onclick="addToCart(${p.id})">Añadir al Carrito</button>
                    </div>
                </div>
            `).join('');
}

// --- Lógica de Carrito ---
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();

    // Efecto visual rápido en el botón
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "¡Añadido! ✓";
    btn.style.background = "#22c55e";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "";
    }, 800);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cartCount').innerText = count;

    const container = document.getElementById('cartItems');
    container.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.img}"  style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <h4 style="font-size: 0.9rem; margin: 0;">${item.name}</h4>
                        <small style="color: #64748b;">${item.quantity} x $${item.price.toFixed(2)}</small>
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').innerText = `$${total.toFixed(2)}`;
}

// --- Eventos ---
document.getElementById('cartToggle').onclick = () => {
    document.getElementById('cartSidebar').classList.add('active');
    document.getElementById('overlay').classList.add('active');
};

const closeCart = () => {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
};

document.getElementById('closeCart').onclick = closeCart;
document.getElementById('overlay').onclick = closeCart;

// Filtro por Categoría
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelector('.cat-btn.active').classList.remove('active');
        btn.classList.add('active');
        renderProducts(btn.dataset.category, document.getElementById('productSearch').value);
    };
});

// Barra de Búsqueda
document.getElementById('productSearch').oninput = (e) => {
    const activeCat = document.querySelector('.cat-btn.active').dataset.category;
    renderProducts(activeCat, e.target.value);
};

// Render inicial
renderProducts();
