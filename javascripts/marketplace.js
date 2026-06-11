// marketplace.js
window.marketplace = {
    products: [],
    categories: [],
    currentCategory: "Todos",
    searchTerm: "",

    init: async function() {
        console.log('Marketplace: Inicializando');
        await this.loadProducts();
        this.renderCategories();
        this.renderProducts();
        this.setupEvents();
    },

    loadProducts: async function() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/marketplace/');
            if (!response.ok) throw new Error('Error al cargar productos');
            const data = await response.json();
            this.products = data.map(p => ({
                id: p.id,
                name: p.nombreproducto,
                price: parseFloat(p.precioventa),
                originalPrice: p.precio_original ? parseFloat(p.precio_original) : null,
                discount: p.descuento || 0,
                isOffer: !!(p.promocion_activa),
                category: p.categoria_nombre || "General",
                vendor: p.empresa_razonsocial || "Proveedor",
                origin: "Nicaragua",
                img: p.imagenurl || "https://placehold.co/300x200?text=Producto",
                stock_disponible: p.stock_disponible || 0
            }));
            this.categories = ["Todos", ...new Set(this.products.map(p => p.category))];
        } catch (error) {
            console.error('Error cargando marketplace:', error);
            this.showToast('Error al cargar productos', true);
            this.products = [];
        }
    },

    getCategoryIcon: function(cat) {
        const icons = { 'Todos': 'fa-th-large', 'Construcción': 'fa-hard-hat', 'Alimentos': 'fa-utensils', 'Artesanías': 'fa-hand-sparkles', 'Textiles': 'fa-tshirt', 'Acabados': 'fa-paint-roller', 'Herramientas': 'fa-tools', 'Plomería': 'fa-wrench', 'Belleza': 'fa-leaf', 'Bebidas': 'fa-wine-bottle', 'Muebles': 'fa-couch', 'Joyería': 'fa-gem' };
        return icons[cat] || 'fa-tag';
    },

    renderCategories: function() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;
        grid.innerHTML = this.categories.map(cat => `
            <div class="category-card ${this.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
                <div class="category-icon"><i class="fas ${this.getCategoryIcon(cat)}"></i></div>
                <strong>${cat}</strong>
                ${cat !== 'Todos' ? `<small>${this.products.filter(p => p.category === cat).length}</small>` : ''}
            </div>
        `).join('');
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => this.filterByCategory(card.getAttribute('data-category')));
        });
    },

    filterByCategory: function(category) {
        this.currentCategory = category;
        this.renderCategories();
        this.renderProducts();
    },

    renderProducts: function() {
        let filtered = this.currentCategory === "Todos" ? [...this.products] : this.products.filter(p => p.category === this.currentCategory);
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || p.vendor.toLowerCase().includes(term));
        }
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><p>No se encontraron productos</p></div>`;
            return;
        }
        grid.innerHTML = filtered.map(p => {
            const offerHtml = p.isOffer ? `<div class="offer-badge"><i class="fas fa-fire"></i> Oferta</div><div class="discount-badge">-${p.discount}%</div>` : '';
            const priceHtml = p.isOffer ? `<span class="original-price">$${p.originalPrice.toFixed(2)}</span><span class="offer-price">$${p.price.toFixed(2)}</span>` : `<span>$${p.price.toFixed(2)}</span>`;
            return `
                <div class="product-card" data-id="${p.id}">
                    <div class="product-image"><img src="${p.img}" alt="${p.name}" loading="lazy">${offerHtml}</div>
                    <div class="product-info">
                        <div class="product-vendor">${p.vendor}</div>
                        <div class="product-title">${p.name}</div>
                        <div class="product-origin"><i class="fas fa-map-marker-alt"></i> ${p.origin}</div>
                        <div class="product-price">${priceHtml}</div>
                        <div style="margin-top:10px;">
                            <div class="quantity-selector" style="display:flex; justify-content:space-between; align-items:center;">
                                <button class="qty-btn" data-id="${p.id}" data-delta="-1">-</button>
                                <span id="qty-${p.id}">1</span>
                                <button class="qty-btn" data-id="${p.id}" data-delta="1">+</button>
                            </div>
                            <button class="btn-add" data-id="${p.id}" data-price="${p.price}" data-name="${p.name}" data-img="${p.img}" data-vendor="${p.vendor}" data-original="${p.originalPrice || ''}">
                                <i class="fas fa-cart-plus"></i> Añadir al carrito
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const delta = parseInt(btn.dataset.delta);
                const span = document.getElementById(`qty-${id}`);
                let qty = parseInt(span.innerText);
                qty = Math.max(1, qty + delta);
                span.innerText = qty;
            });
        });
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const quantity = parseInt(document.getElementById(`qty-${id}`)?.innerText || 1);
                const product = {
                    id: parseInt(id),
                    name: btn.dataset.name,
                    price: parseFloat(btn.dataset.price),
                    originalPrice: btn.dataset.original ? parseFloat(btn.dataset.original) : null,
                    vendor: btn.dataset.vendor,
                    img: btn.dataset.img
                };
                if (window.CartModule?.addToCart) window.CartModule.addToCart(product, quantity);
                else window.showToast('Carrito no disponible', true);
            });
        });
    },

    setupEvents: function() {
        const searchInput = document.getElementById('productSearch');
        if (searchInput) searchInput.addEventListener('input', (e) => { this.searchTerm = e.target.value; this.renderProducts(); });
        window.addEventListener('storage', (e) => { if (e.key === 'userRole') this.renderProducts(); });
    },

    showToast: function(message, isErr = false) {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.innerText = message;
            toast.style.display = 'flex';
            toast.style.background = isErr ? '#ef4444' : '#10b981';
            setTimeout(() => toast.style.display = 'none', 3000);
        } else alert(message);
    },

    destroy: function() { console.log('Marketplace: Destruido'); }
};