// marketplace.js - Módulo completo con integración API (VERSIÓN CORREGIDA)
window.marketplace = {
    products: [],
    categories: [],
    currentCategory: "Todos",
    searchTerm: "",
    selectedQuantities: {},
    cart: [],
    loading: false,

    init: async function() {
        console.log('Marketplace: Inicializando con API');
        
        this.products.forEach(p => { this.selectedQuantities[p.id] = 1; });
        this.loadCart();
        await this.loadCategories();
        await this.loadProducts();
        this.setupEvents();
        this.updateCartUI();
    },
    
    showLoading: function(show) {
        this.loading = show;
        const grid = document.getElementById('productsGrid');
        if (grid && show) {
            grid.innerHTML = `<div class="loading-spinner" style="text-align: center; padding: 4rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #2563eb;"></i>
                <p>Cargando productos...</p>
            </div>`;
        }
    },
    
    loadCategories: async function() {
        try {
            const response = await window.api.getCategories();
            this.categories = response;
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },
    
    loadProducts: async function() {
        this.showLoading(true);
        try {
            const filters = {};
            if (this.currentCategory !== 'Todos') {
                filters.categoria = this.currentCategory;
            }
            if (this.searchTerm) {
                filters.search = this.searchTerm;
            }
            
            const response = await window.api.getProducts(filters);
            this.products = response.results;
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            const grid = document.getElementById('productsGrid');
            if (grid) {
                grid.innerHTML = `<div class="error-state" style="text-align: center; padding: 4rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444;"></i>
                    <p>Error al cargar productos</p>
                    <button onclick="window.marketplace.loadProducts()" class="btn-primary">Reintentar</button>
                </div>`;
            }
        } finally {
            this.showLoading(false);
        }
    },
    
    renderCategories: function() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        grid.innerHTML = this.categories.map(cat => `
            <div class="category-card ${this.currentCategory === cat.name ? 'active' : ''}" data-category="${cat.name}">
                <div class="category-icon">
                    <i class="fas ${cat.icono || 'fa-tag'}"></i>
                </div>
                <strong>${cat.name}</strong>
                ${cat.name !== 'Todos' ? `<small>${cat.count}</small>` : ''}
            </div>
        `).join('');

        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                this.filterByCategory(category);
            });
        });
    },
    
    filterByCategory: async function(category) {
        this.currentCategory = category;
        this.renderCategories();
        await this.loadProducts();
    },
    
    renderProducts: function() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (this.products.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="text-align: center; padding: 4rem;">
                <i class="fas fa-search" style="font-size: 3rem;"></i>
                <p>No se encontraron productos</p>
            </div>`;
            return;
        }

        const isClient = this.isClientRole();
        
        grid.innerHTML = this.products.map(p => {
            const qty = this.selectedQuantities[p.id] || 1;
            const finalPrice = p.final_price || p.precioventa;
            const isOffer = p.is_offer;
            
            return `
                <div class="product-card" data-id="${p.id}">
                    <div class="product-image">
                        <img src="${p.imagenurl || 'https://via.placeholder.com/300x200'}" alt="${p.nombreproducto}" loading="lazy">
                        ${isOffer ? `<div class="offer-badge"><i class="fas fa-fire"></i> Oferta</div>` : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-vendor">${p.vendor || p.empresa_nombre || 'Proveedor'}</div>
                        <div class="product-title">${p.nombreproducto}</div>
                        <div class="product-price">$${parseFloat(finalPrice).toFixed(2)}</div>
                        ${isClient ? `
                            <div class="quantity-selector">
                                <button class="qty-btn" data-action="decrement" data-id="${p.id}">-</button>
                                <span class="qty-value">${qty}</span>
                                <button class="qty-btn" data-action="increment" data-id="${p.id}">+</button>
                            </div>
                            <button class="btn-add" data-id="${p.id}">
                                <i class="fas fa-cart-plus"></i> Añadir
                            </button>
                        ` : `
                            <button class="btn-disabled" disabled>Modo Proveedor</button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const action = btn.dataset.action;
                const delta = action === 'increment' ? 1 : -1;
                this.updateQuantity(id, delta);
            });
        });

        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.addToCart(id, btn);
            });
        });
    },
    
    updateQuantity: function(id, delta) {
        const newQty = Math.max(1, (this.selectedQuantities[id] || 1) + delta);
        this.selectedQuantities[id] = newQty;
        this.renderProducts();
    },
    
    isClientRole: function() {
        return localStorage.getItem('userRole') === "client";
    },
    
    addToCart: function(id, btnElement) {
        if (!this.isClientRole()) {
            this.showToast("Debes ser cliente para comprar", "error");
            return;
        }

        const product = this.products.find(p => p.id === id);
        const quantity = this.selectedQuantities[id] || 1;
        const existing = this.cart.find(item => item.id === id);
        
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.nombreproducto,
                price: product.final_price || product.precioventa,
                vendor: product.vendor || product.empresa_nombre,
                img: product.imagenurl || 'https://via.placeholder.com/70',
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showToast(`✓ ${product.nombreproducto} añadido`);

        if (btnElement) {
            const originalText = btnElement.innerHTML;
            btnElement.innerHTML = '<i class="fas fa-check"></i> ¡Ok!';
            setTimeout(() => { btnElement.innerHTML = originalText; }, 800);
        }
    },
    
    saveCart: function() {
        localStorage.setItem('marketplaceCart', JSON.stringify(this.cart));
    },
    
    loadCart: function() {
        const saved = localStorage.getItem('marketplaceCart');
        this.cart = saved ? JSON.parse(saved) : [];
    },
    
    updateCartUI: function() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) cartCountElement.innerText = count;

        const container = document.getElementById('cartItems');
        if (!container) return;

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (this.cart.length === 0) {
            container.innerHTML = `<div class="empty-state">Carrito vacío</div>`;
        } else {
            container.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div>
                        <div><strong>${item.name}</strong></div>
                        <div>$${item.price.toFixed(2)} x ${item.quantity}</div>
                        <button onclick="window.marketplace.removeFromCart(${item.id})">Eliminar</button>
                    </div>
                    <div>$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `).join('');
        }

        const cartTotalElement = document.getElementById('cartTotal');
        if (cartTotalElement) cartTotalElement.innerText = `$${total.toFixed(2)}`;
    },
    
    removeFromCart: function(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartUI();
        this.showToast("Producto eliminado");
    },
    
    toggleCart: function() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.querySelector('.overlay');
        if (sidebar) sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
    },
    
    checkout: async function() {
        if (this.cart.length === 0) {
            this.showToast("Carrito vacío", "error");
            return;
        }
        
        this.showToast("Procesando pedido...", "info");
        
        try {
            // Obtener empresa del usuario
            const empresaStr = localStorage.getItem('userEmpresa');
            const empresa = empresaStr ? JSON.parse(empresaStr) : null;
            
            // Crear items del pedido
            const items = this.cart.map(item => ({
                producto_id: item.id,
                cantidad: item.quantity
            }));
            
            // Obtener sucursales (por ahora usar valores por defecto)
            const pedidoData = {
                restauranteid: empresa?.id || 1,
                proveedorid: 1, // Por ahora fijo, luego se agrupa por proveedor
                sucursalorigenid: 1,
                sucursalentregaid: 1,
                monedaid: 1,
                metodopagoid: 1,
                comentario: `Pedido desde Marketplace - ${new Date().toLocaleString()}`,
                items: items
            };
            
            const result = await window.api.createOrder(pedidoData);
            
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            this.toggleCart();
            
            this.showToast(`🎉 Pedido realizado!`);
            
        } catch (error) {
            console.error('Checkout error:', error);
            this.showToast(error.message || 'Error al procesar', 'error');
        }
    },
    
    setupEvents: function() {
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', async (e) => {
                this.searchTerm = e.target.value;
                await this.loadProducts();
            });
        }
    },
    
    showToast: function(message, type = "success") {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
        `;
        toast.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Exponer funciones globales
window.toggleCart = () => window.marketplace?.toggleCart();
window.checkout = () => window.marketplace?.checkout();
window.marketplace.removeFromCart = (id) => window.marketplace?.removeFromCart(id);