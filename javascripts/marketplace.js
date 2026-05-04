// marketplace.js - Módulo completo con carrito integrado
window.marketplace = {
    // ========================================
    // PRODUCTOS
    // ========================================
    products: [
        // --- OFERTAS (con descuento) ---
        { id: 1, name: "Cemento Canal 42.5kg", price: 12.50, originalPrice: 15.99, vendor: "HOLCIM NICARAGUA", category: "Construcción", origin: "Managua", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500", isOffer: true, discount: 22 },
        { id: 2, name: "Café Matagalpa Orgánico", price: 9.99, originalPrice: 14.99, vendor: "Cafetaleros del Norte", category: "Alimentos", origin: "Matagalpa", img: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500", isOffer: true, discount: 33 },
        { id: 3, name: "Hamaca de Masaya", price: 35.00, originalPrice: 55.00, vendor: "Tejidos Nicaragüenses", category: "Artesanías", origin: "Masaya", img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500", isOffer: true, discount: 36 },
        { id: 4, name: "Cajeta de Leche", price: 3.50, originalPrice: 5.50, vendor: "Dulces Doña Chela", category: "Alimentos", origin: "León", img: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=500", isOffer: true, discount: 36 },

        // --- PRODUCTOS NORMALES ---
        { id: 5, name: "Cerámica de San Juan", price: 25.99, originalPrice: null, vendor: "Artesanías Doña Elena", category: "Artesanías", origin: "San Juan de Oriente", img: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500", isOffer: false },
        { id: 6, name: "Rosquillas (12 und)", price: 3.99, originalPrice: null, vendor: "Panadería Sabor Nica", category: "Alimentos", origin: "Estelí", img: "https://images.unsplash.com/photo-1627308597925-bd8279a3b895?w=500", isOffer: false },
        { id: 7, name: "Hierro Corrugado 3/8", price: 8.75, originalPrice: null, vendor: "SINSA", category: "Construcción", origin: "Managua", img: "https://images.unsplash.com/photo-1533035350251-aa8b8e208d95?w=500", isOffer: false },
        { id: 8, name: "Güipil Tradicional", price: 65.00, originalPrice: null, vendor: "Textiles Doña Chila", category: "Textiles", origin: "Masaya", img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500", isOffer: false },
        { id: 9, name: "Pintura Látex Blanca", price: 85.00, originalPrice: null, vendor: "SHERWIN WILLIAMS", category: "Acabados", origin: "Managua", img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500", isOffer: false },
        { id: 10, name: "Taladro Percutor 800W", price: 110.00, originalPrice: null, vendor: "DEWALT", category: "Herramientas", origin: "Managua", img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500", isOffer: false },
        { id: 11, name: "Tubería PVC 1/2\"", price: 2.15, originalPrice: null, vendor: "DURMAN", category: "Plomería", origin: "Managua", img: "https://images.unsplash.com/photo-1585704032915-c3400ca1f963?w=500", isOffer: false },
        { id: 12, name: "Jabón de Cacao y Miel", price: 5.99, originalPrice: null, vendor: "Cosmética Natural", category: "Belleza", origin: "Granada", img: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500", isOffer: false },
        { id: 13, name: "Vino de Coyol", price: 18.99, originalPrice: null, vendor: "Licores Tradicionales", category: "Bebidas", origin: "León", img: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500", isOffer: false },
        { id: 14, name: "Silla de Mimbre", price: 89.99, originalPrice: null, vendor: "Muebles Artesanales", category: "Muebles", origin: "Masaya", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500", isOffer: false },
        { id: 15, name: "Collar de Piedras", price: 35.00, originalPrice: null, vendor: "Joyas Nicaragüenses", category: "Joyería", origin: "Ometepe", img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500", isOffer: false }
    ],

    categories: [],
    currentCategory: "Todos",
    searchTerm: "",
    selectedQuantities: {},
    cart: [],

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    init: function() {
        console.log('Marketplace: Inicializando');
        
        // Extraer categorías únicas
        this.categories = ["Todos", ...new Set(this.products.map(p => p.category))];
        
        // Inicializar cantidades por producto
        this.products.forEach(p => { this.selectedQuantities[p.id] = 1; });
        
        // Cargar carrito guardado
        this.loadCart();
        
        // Renderizar interfaz
        this.renderCategories();
        this.renderProducts();
        this.setupEvents();
        this.updateCartUI();
    },

    // ========================================
    // EVENTOS
    // ========================================
    setupEvents: function() {
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            const newSearch = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearch, searchInput);
            newSearch.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderProducts();
            });
        }
        
        window.addEventListener('storage', (e) => {
            if (e.key === 'userRole') this.renderProducts();
        });
    },

    // ========================================
    // UTILIDADES
    // ========================================
    getCategoryIcon: function(cat) {
        const icons = {
            'Todos': 'fa-th-large',
            'Construcción': 'fa-hard-hat',
            'Alimentos': 'fa-utensils',
            'Artesanías': 'fa-hand-sparkles',
            'Textiles': 'fa-tshirt',
            'Acabados': 'fa-paint-roller',
            'Herramientas': 'fa-tools',
            'Plomería': 'fa-wrench',
            'Belleza': 'fa-leaf',
            'Bebidas': 'fa-wine-bottle',
            'Muebles': 'fa-couch',
            'Joyería': 'fa-gem'
        };
        return icons[cat] || 'fa-tag';
    },

    isClientRole: function() {
        const role = localStorage.getItem('userRole') || "client";
        return role === "client";
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
            border-radius: 10px;
            font-size: 0.9rem;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    },

    // ========================================
    // CATEGORÍAS
    // ========================================
    renderCategories: function() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        grid.innerHTML = this.categories.map(cat => `
            <div class="category-card ${this.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
                <div class="category-icon">
                    <i class="fas ${this.getCategoryIcon(cat)}"></i>
                </div>
                <strong>${cat}</strong>
                ${cat !== 'Todos' ? `<small>${this.products.filter(p => p.category === cat).length}</small>` : ''}
            </div>
        `).join('');

        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                this.filterByCategory(category);
            });
        });
    },

    filterByCategory: function(category) {
        this.currentCategory = category;
        this.renderCategories();
        this.renderProducts();
    },

    // ========================================
    // PRODUCTOS
    // ========================================
    renderProducts: function() {
        let filtered = this.currentCategory === "Todos"
            ? [...this.products]
            : this.products.filter(p => p.category === this.currentCategory);

        if (this.searchTerm.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                p.vendor.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                p.origin.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => (b.isOffer ? 1 : 0) - (a.isOffer ? 1 : 0));

        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state"><i class="fas fa-search" style="font-size: 3rem;"></i><p>No se encontraron productos</p></div>`;
            return;
        }

        grid.innerHTML = filtered.map(p => {
            const qty = this.selectedQuantities[p.id] || 1;
            return `
                <div class="product-card" data-id="${p.id}">
                    <div class="product-image">
                        <img src="${p.img}" alt="${p.name}" loading="lazy">
                        ${p.isOffer ? `
                            <div class="offer-badge"><i class="fas fa-fire"></i> Oferta</div>
                            <div class="discount-badge">-${p.discount}%</div>
                        ` : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-vendor">${p.vendor}</div>
                        <div class="product-title">${p.name}</div>
                        <div class="product-origin"><i class="fas fa-map-marker-alt"></i> ${p.origin}</div>
                        <div class="product-price">
                            ${p.isOffer ? `
                                <span class="original-price">$${p.originalPrice.toFixed(2)}</span>
                                <span class="offer-price">$${p.price.toFixed(2)}</span>
                            ` : `
                                <span>$${p.price.toFixed(2)}</span>
                            `}
                        </div>
                        ${this.isClientRole() ? `
                            <div class="quantity-selector">
                                <button class="qty-btn" data-action="decrement" data-id="${p.id}">-</button>
                                <span class="qty-value" style="min-width: 30px; text-align: center;">${qty}</span>
                                <button class="qty-btn" data-action="increment" data-id="${p.id}">+</button>
                            </div>
                            <button class="btn-add" data-id="${p.id}">
                                <i class="fas fa-cart-plus"></i> Añadir al Carrito
                            </button>
                        ` : `
                            <button class="btn-disabled" disabled style="width: 100%; padding: 10px; background: #ccc; border: none; border-radius: 8px; cursor: not-allowed; margin-top: 8px;">
                                <i class="fas fa-store"></i> Modo Proveedor
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        // Eventos de cantidad
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const action = btn.getAttribute('data-action');
                const delta = action === 'increment' ? 1 : -1;
                this.updateQuantity(id, delta);
            });
        });

        // Eventos de añadir al carrito
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                this.addToCart(id, btn);
            });
        });
    },

    updateQuantity: function(id, delta) {
        const newQty = Math.max(1, (this.selectedQuantities[id] || 1) + delta);
        this.selectedQuantities[id] = newQty;
        this.renderProducts();
    },

    // ========================================
    // CARRITO
    // ========================================
    addToCart: function(id, btnElement) {
        if (!this.isClientRole()) {
            this.showToast("Debes cambiar a modo Cliente para comprar", "error");
            return;
        }

        const product = this.products.find(p => p.id === id);
        const quantity = this.selectedQuantities[id] || 1;
        const existing = this.cart.find(item => item.id === id);

        if (existing) {
            existing.quantity += quantity;
        } else {
            this.cart.push({ ...product, quantity: quantity });
        }

        this.saveCart();
        this.updateCartUI();
        this.showToast(`✓ ${quantity} x ${product.name} añadido al carrito`);

        if (btnElement) {
            const originalText = btnElement.innerHTML;
            btnElement.innerHTML = '<i class="fas fa-check"></i> ¡Añadido!';
            btnElement.style.background = '#10b981';
            setTimeout(() => {
                btnElement.innerHTML = originalText;
                btnElement.style.background = '';
            }, 800);
        }
    },

    saveCart: function() {
        localStorage.setItem('marketplaceCart', JSON.stringify(this.cart));
    },

    loadCart: function() {
        const saved = localStorage.getItem('marketplaceCart');
        if (saved) {
            this.cart = JSON.parse(saved);
        }
    },

    updateCartUI: function() {
        // Actualizar contador del carrito
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) cartCountElement.innerText = count;

        const container = document.getElementById('cartItems');
        if (!container) return;

        // Calcular totales
        let subtotalOriginal = 0;
        let ahorroTotal = 0;
        
        this.cart.forEach(item => {
            const precioActual = item.price;
            const precioOriginal = item.originalPrice || item.price;
            const subtotal = precioActual * item.quantity;
            const ahorro = (precioOriginal - precioActual) * item.quantity;
            subtotalOriginal += subtotal;
            ahorroTotal += ahorro > 0 ? ahorro : 0;
        });
        
        const totalPagar = subtotalOriginal;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; color: #cbd5e1;"></i>
                    <p style="margin-top: 1rem; color: #64748b;">Tu carrito está vacío</p>
                    <button onclick="window.marketplace.toggleCart()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-arrow-left"></i> Seguir comprando
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = this.cart.map(item => {
                const precioActual = item.price;
                const precioOriginal = item.originalPrice;
                const subtotal = precioActual * item.quantity;
                const ahorro = precioOriginal ? (precioOriginal - precioActual) * item.quantity : 0;
                
                return `
                    <div class="cart-item" style="display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid #e2e8f0;">
                        <img src="${item.img}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 10px;">
                        <div class="cart-item-info" style="flex: 1;">
                            <div class="cart-item-title" style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                            <div class="cart-item-vendor" style="font-size: 0.7rem; color: #64748b; margin-bottom: 6px;">${item.vendor}</div>
                            
                            ${item.isOffer ? `
                                <div class="cart-item-price" style="margin-bottom: 8px;">
                                    <span style="text-decoration: line-through; font-size: 0.75rem; color: #94a3b8;">$${precioOriginal.toFixed(2)}</span>
                                    <span style="color: #ef4444; font-weight: 700; margin-left: 6px;">$${precioActual.toFixed(2)}</span>
                                    <span style="background: #fef3c7; padding: 2px 6px; border-radius: 12px; font-size: 0.65rem; margin-left: 6px;">-${item.discount}%</span>
                                </div>
                            ` : `
                                <div class="cart-item-price" style="margin-bottom: 8px;">
                                    <span style="font-weight: 700;">$${precioActual.toFixed(2)}</span>
                                </div>
                            `}
                            
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1" style="width: 28px; height: 28px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer;">-</button>
                                    <span style="min-width: 30px; text-align: center; font-weight: 500;">${item.quantity}</span>
                                    <button class="cart-qty-btn" data-id="${item.id}" data-delta="1" style="width: 28px; height: 28px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer;">+</button>
                                </div>
                                <div style="font-weight: 700; color: #1e293b;">
                                    $${subtotal.toFixed(2)}
                                </div>
                            </div>
                            
                            ${ahorro > 0 ? `
                                <div style="font-size: 0.7rem; color: #10b981; margin-top: 6px;">
                                    <i class="fas fa-tag"></i> Ahorro: $${ahorro.toFixed(2)}
                                </div>
                            ` : ''}
                        </div>
                        <button class="cart-remove-btn" data-id="${item.id}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.1rem;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
            }).join('');
            
            // Eventos del carrito
            document.querySelectorAll('.cart-qty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    const delta = parseInt(btn.dataset.delta);
                    this.updateCartQuantity(id, delta);
                });
            });
            
            document.querySelectorAll('.cart-remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeFromCart(parseInt(btn.dataset.id));
                });
            });
        }

        // Actualizar total en el footer
        const cartTotalElement = document.getElementById('cartTotal');
        if (cartTotalElement) {
            cartTotalElement.innerHTML = `$${totalPagar.toFixed(2)}`;
        }
        
        // Actualizar resumen detallado
        this.updateCartSummary(subtotalOriginal, ahorroTotal, totalPagar);
    },
    
    updateCartSummary: function(subtotal, ahorro, total) {
        const cartFooter = document.querySelector('.cart-footer');
        if (!cartFooter) return;
        
        let summaryDiv = document.getElementById('cartSummaryDetails');
        if (!summaryDiv) {
            summaryDiv = document.createElement('div');
            summaryDiv.id = 'cartSummaryDetails';
            summaryDiv.style.cssText = 'margin-bottom: 15px; padding: 12px; background: #f8fafc; border-radius: 12px;';
            const totalRow = cartFooter.querySelector('.total-row');
            if (totalRow) {
                cartFooter.insertBefore(summaryDiv, totalRow);
            }
        }
        
        summaryDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
                <span style="color: #64748b;">Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${ahorro > 0 ? `
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px; color: #10b981;">
                    <span><i class="fas fa-tags"></i> Descuentos:</span>
                    <span>-$${ahorro.toFixed(2)}</span>
                </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
                <span style="color: #64748b;">Envío:</span>
                <span style="color: #10b981;">Gratis</span>
            </div>
            <div style="border-top: 1px dashed #cbd5e1; margin: 8px 0;"></div>
            <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem;">
                <span>Total a pagar:</span>
                <span style="color: #2563eb;">$${total.toFixed(2)}</span>
            </div>
        `;
    },

    updateCartQuantity: function(id, delta) {
        const item = this.cart.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.cart = this.cart.filter(i => i.id !== id);
            }
            this.saveCart();
            this.updateCartUI();
            this.showToast("Carrito actualizado");
        }
    },

    removeFromCart: function(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartUI();
        this.showToast("Producto eliminado del carrito");
    },

    // ========================================
    // CHECKOUT
    // ========================================
    checkout: function() {
        if (this.cart.length === 0) {
            this.showToast("Tu carrito está vacío", "error");
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);

        alert(`✅ ¡Gracias por tu compra!\n\n📦 Productos: ${itemCount} unidades\n💰 Total: $${total.toFixed(2)}\n\n📧 Te enviaremos la confirmación a tu correo.\n🇳🇮 ¡Gracias por apoyar productos nicaragüenses!`);

        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.toggleCart();
        this.showToast("🎉 Pedido realizado exitosamente");
    },

    // ========================================
    // UI
    // ========================================
    toggleCart: function() {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');
        if (cartSidebar) cartSidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
    },

    // ========================================
    // LIMPIEZA
    // ========================================
    destroy: function() {
        console.log('Marketplace: Destruido');
        this.cart = [];
        this.selectedQuantities = {};
    }
};

// ========================================
// EXPONER FUNCIONES GLOBALES
// ========================================
window.filterByCategory = (cat) => window.marketplace?.filterByCategory(cat);
window.updateQuantity = (id, delta) => window.marketplace?.updateQuantity(id, delta);
window.addToCart = (id) => window.marketplace?.addToCart(id);
window.updateCartQuantity = (id, delta) => window.marketplace?.updateCartQuantity(id, delta);
window.removeFromCart = (id) => window.marketplace?.removeFromCart(id);
window.toggleCart = () => window.marketplace?.toggleCart();
window.checkout = () => window.marketplace?.checkout();