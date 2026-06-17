// marketplace.js - VERSIÓN CON CACHÉ LOCAL Y MEJORAS
window.marketplace = {
    products: [],
    categories: [],
    currentCategory: "Todos",
    searchTerm: "",
    _stylesInjected: false,
    _loading: false,

    _cssStyles: `
        <style id="marketplace-modal-styles">
            .products-grid {
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
                gap: 1.8rem !important;
            }
            .product-card {
                border-radius: 20px !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.06) !important;
                transition: transform 0.25s ease, box-shadow 0.25s ease !important;
                background: white;
                overflow: hidden;
            }
            .product-card:hover {
                transform: translateY(-6px) !important;
                box-shadow: 0 12px 30px rgba(0,0,0,0.12) !important;
            }
            .product-image {
                height: 220px !important;
                position: relative;
                overflow: hidden;
            }
            .product-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .product-title {
                font-size: 1.1rem !important;
                min-height: 3rem !important;
                font-weight: 600;
                margin: 0.5rem 0;
            }
            .product-vendor {
                font-size: 0.85rem;
                color: #64748b;
            }
            .product-origin {
                font-size: 0.8rem;
                color: #94a3b8;
                margin: 0.25rem 0;
            }
            .product-price {
                font-size: 1.25rem;
                font-weight: 700;
                margin: 0.5rem 0;
            }
            .original-price {
                text-decoration: line-through;
                color: #94a3b8;
                font-size: 0.9rem;
                margin-right: 0.5rem;
            }
            .offer-price {
                color: #ef4444;
            }
            .offer-badge {
                position: absolute;
                top: 10px;
                left: 10px;
                background: #ef4444;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            .discount-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #fbbf24;
                color: #1e293b;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 700;
            }
            .product-info {
                padding: 1rem 1.2rem 1.2rem;
            }
            .quantity-selector {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            }
            .qty-btn {
                background: #f1f5f9;
                border: none;
                border-radius: 8px;
                padding: 6px 14px;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                transition: 0.2s;
                color: #1e293b;
            }
            .qty-btn:hover {
                background: #e2e8f0;
            }
            .btn-add {
                width: 100%;
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white;
                border: none;
                padding: 10px 0;
                border-radius: 40px;
                font-weight: 700;
                cursor: pointer;
                transition: 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }
            .btn-add:hover {
                transform: scale(1.02);
                box-shadow: 0 8px 20px rgba(37,99,235,0.3);
            }
            .detail-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(8px);
                z-index: 10000;
                display: none;
                justify-content: center;
                align-items: center;
                padding: 1.5rem;
            }
            .detail-modal-overlay.active {
                display: flex;
            }
            .detail-modal-content {
                background: white;
                border-radius: 28px;
                max-width: 650px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                padding: 2rem 2rem 1.5rem;
                box-shadow: 0 30px 60px rgba(0,0,0,0.3);
                animation: modalFadeIn 0.3s ease;
                position: relative;
            }
            @keyframes modalFadeIn {
                from { opacity: 0; transform: scale(0.95) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .detail-modal-close {
                position: absolute;
                top: 1.2rem;
                right: 1.5rem;
                font-size: 2rem;
                cursor: pointer;
                color: #94a3b8;
                background: none;
                border: none;
                transition: 0.2s;
            }
            .detail-modal-close:hover {
                color: #dc2626;
                transform: rotate(90deg);
            }
            .detail-modal-header {
                display: flex;
                align-items: center;
                gap: 1.2rem;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid #f1f5f9;
            }
            .detail-modal-header img {
                width: 100px;
                height: 100px;
                object-fit: cover;
                border-radius: 16px;
                background: #f1f5f9;
            }
            .detail-modal-header h2 {
                font-size: 1.6rem;
                font-weight: 800;
                margin: 0 0 0.25rem 0;
                color: #0f172a;
            }
            .detail-modal-header .vendor {
                font-size: 0.9rem;
                color: #64748b;
            }
            .detail-modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin: 1.5rem 0;
            }
            .detail-modal-body .info-item {
                background: #f8fafc;
                padding: 0.75rem 1rem;
                border-radius: 12px;
            }
            .detail-modal-body .info-item label {
                display: block;
                font-size: 0.7rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #94a3b8;
                font-weight: 600;
            }
            .detail-modal-body .info-item span {
                font-weight: 700;
                color: #0f172a;
                font-size: 1rem;
            }
            .detail-modal-body .info-item.price {
                background: #dbeafe;
            }
            .detail-modal-body .info-item.price span {
                color: #2563eb;
                font-size: 1.3rem;
            }
            .detail-modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid #f1f5f9;
            }
            .detail-modal-footer .btn-add-cart {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white;
                border: none;
                padding: 0.8rem 2rem;
                border-radius: 40px;
                font-weight: 700;
                cursor: pointer;
                transition: 0.2s;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .detail-modal-footer .btn-add-cart:hover {
                transform: scale(1.04);
                box-shadow: 0 8px 20px rgba(37,99,235,0.3);
            }
            .detail-modal-footer .btn-close {
                background: #e2e8f0;
                border: none;
                padding: 0.8rem 1.8rem;
                border-radius: 40px;
                font-weight: 600;
                cursor: pointer;
                color: #334155;
            }
            .detail-modal-footer .btn-close:hover {
                background: #cbd5e1;
            }
            @media (max-width: 600px) {
                .detail-modal-content { padding: 1.5rem; }
                .detail-modal-header { flex-direction: column; text-align: center; }
                .detail-modal-header img { width: 120px; height: 120px; }
                .detail-modal-body { grid-template-columns: 1fr; }
                .products-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important; }
            }
        </style>
    `,

    init: async function() {
        console.log('🛒 Marketplace: Inicializando');
        this._injectStyles();
        await this.loadProducts();
        this.renderCategories();
        this.renderProducts();
        this.setupEvents();
    },

    _injectStyles: function() {
        if (this._stylesInjected) return;
        document.head.insertAdjacentHTML('beforeend', this._cssStyles);
        this._stylesInjected = true;
    },

    escapeHtml: function(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    loadProducts: async function(filters = {}, forceRefresh = false) {
        if (this._loading) return;
        this._loading = true;
        try {
            const result = await api.getMarketplaceProducts(filters, forceRefresh);
            console.log("📦 Respuesta del marketplace:", result);

            if (result.success) {
                const data = result.data;
                console.log("📋 Primer producto:", data[0]);

                this.products = data.map(p => ({
                    id: p.id,
                    name: p.nombreproducto || 'Sin nombre',
                    description: p.descripcion || 'Sin descripción',
                    price: parseFloat(p.precio_final) || 0,
                    originalPrice: parseFloat(p.precio_original) || null,
                    discount: p.descuento || 0,
                    isOffer: p.promocion_activa || false,
                    category: p.categoria_nombre || "General",
                    proveedorId: p.empresa_id,
                    proveedorNombre: p.empresa_nombre || 'Proveedor',
                    sucursalOrigenId: p.sucursal_origen_id || null,
                    origin: "Nicaragua",
                    img: p.imagenurl || "https://placehold.co/300x200?text=Producto",
                    stock_disponible: p.inventario?.reduce((sum, inv) => sum + inv.stock, 0) || 0,
                    unidad: p.unidad_nombre || 'Unidad',
                    cantidad_minima: 1,
                    es_perecedero: p.esperecedero || false,
                    dias_vida_util: p.diasvidautil || null,
                    inventario: p.inventario || []
                }));

                this.categories = ["Todos", ...new Set(this.products.map(p => p.category))];
                console.log(`✅ Productos cargados: ${this.products.length} (${result.fromCache ? 'desde caché' : 'del servidor'})`);
            } else {
                this.showToast(result.error || 'Error al cargar productos', true);
                // Fallback a datos locales
                const localProducts = JSON.parse(localStorage.getItem('marketplace_products') || 'null');
                if (localProducts) {
                    this.products = localProducts;
                    this.categories = ["Todos", ...new Set(this.products.map(p => p.category))];
                    this.showToast('Usando datos locales (fuera de línea)', true);
                } else {
                    this.products = [];
                    this.categories = ["Todos"];
                }
            }
        } catch (error) {
            console.error('❌ Error cargando marketplace:', error);
            this.showToast('Error de conexión con el servidor', true);
            const localProducts = JSON.parse(localStorage.getItem('marketplace_products') || 'null');
            if (localProducts) {
                this.products = localProducts;
                this.categories = ["Todos", ...new Set(this.products.map(p => p.category))];
                this.showToast('Usando datos locales (fuera de línea)', true);
            } else {
                this.products = [];
                this.categories = ["Todos"];
            }
        } finally {
            this._loading = false;
            localStorage.setItem('marketplace_products', JSON.stringify(this.products));
        }
    },

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

    renderCategories: function() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;
        grid.innerHTML = this.categories.map(cat => `
            <div class="category-card ${this.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
                <div class="category-icon"><i class="fas ${this.getCategoryIcon(cat)}"></i></div>
                <strong>${this.escapeHtml(cat)}</strong>
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
            filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || p.proveedorNombre.toLowerCase().includes(term));
        }
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><p>No se encontraron productos</p></div>`;
            return;
        }

        grid.innerHTML = filtered.map(p => {
            const nameEscaped = this.escapeHtml(p.name);
            const vendorEscaped = this.escapeHtml(p.proveedorNombre);

            const offerHtml = p.isOffer ? `
                <div class="offer-badge"><i class="fas fa-fire"></i> Oferta</div>
                <div class="discount-badge">-${p.discount}%</div>
            ` : '';
            const priceHtml = p.isOffer ? `
                <span class="original-price">$${p.originalPrice.toFixed(2)}</span>
                <span class="offer-price">$${p.price.toFixed(2)}</span>
            ` : `<span>$${p.price.toFixed(2)}</span>`;

            return `
                <div class="product-card" data-id="${p.id}">
                    <div class="product-image">
                        <img src="${p.img}" alt="${nameEscaped}" loading="lazy">
                        ${offerHtml}
                    </div>
                    <div class="product-info">
                        <div class="product-vendor">${vendorEscaped}</div>
                        <div class="product-title">${nameEscaped}</div>
                        <div class="product-origin"><i class="fas fa-map-marker-alt"></i> ${p.origin}</div>
                        <div class="product-price">${priceHtml}</div>

                        <div style="margin-top:10px;">
                            <div class="quantity-selector" style="display:flex; justify-content:space-between; align-items:center;">
                                <button class="qty-btn" data-id="${p.id}" data-delta="-1">-</button>
                                <span id="qty-${p.id}">1</span>
                                <button class="qty-btn" data-id="${p.id}" data-delta="1">+</button>
                            </div>
                            <button class="btn-add"
                                data-id="${p.id}"
                                data-price="${p.price}"
                                data-name="${nameEscaped}"
                                data-img="${p.img}"
                                data-proveedor="${vendorEscaped}"
                                data-proveedor-id="${p.proveedorId}"
                                data-sucursal-origen="${p.sucursalOrigenId || ''}"
                                data-original="${p.originalPrice || ''}"
                                data-inventario='${JSON.stringify(p.inventario)}'>
                                <i class="fas fa-cart-plus"></i> Añadir al carrito
                            </button>
                            <button class="btn-detail-modal" data-id="${p.id}" style="width:100%; margin-top:6px; background:#f1f5f9; border:none; border-radius:8px; padding:6px; cursor:pointer; font-size:0.8rem; color:#475569; transition:0.2s;">
                                <i class="fas fa-eye"></i> Ver detalles
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Eventos de cantidad
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

        // Eventos de añadir al carrito
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
                    proveedorNombre: btn.dataset.proveedor,
                    proveedorId: parseInt(btn.dataset.proveedorId),
                    sucursalOrigenId: btn.dataset.sucursalOrigen ? parseInt(btn.dataset.sucursalOrigen) : null,
                    img: btn.dataset.img,
                    inventario: JSON.parse(btn.dataset.inventario || '[]')
                };

                if (window.CartModule?.addToCart) {
                    window.CartModule.addToCart(product, quantity);
                } else {
                    this.showToast('Carrito no disponible', true);
                }
            });
        });

        // Eventos del modal
        document.querySelectorAll('.btn-detail-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const product = this.products.find(p => p.id === id);
                if (product) this._openDetailModal(product);
            });
        });
    },

    _openDetailModal: function(product) {
        const existing = document.getElementById('productDetailModal');
        if (existing) existing.remove();

        const nameEscaped = this.escapeHtml(product.name);
        const vendorEscaped = this.escapeHtml(product.proveedorNombre);
        const categoryEscaped = this.escapeHtml(product.category);
        const descriptionEscaped = this.escapeHtml(product.description);
        const unitEscaped = this.escapeHtml(product.unidad);

        const modalHTML = `
            <div class="detail-modal-overlay active" id="productDetailModal" onclick="if(event.target===this) document.getElementById('productDetailModal').remove()">
                <div class="detail-modal-content" onclick="event.stopPropagation()">
                    <button class="detail-modal-close" onclick="document.getElementById('productDetailModal').remove()">&times;</button>

                    <div class="detail-modal-header">
                        <img src="${product.img}" alt="${nameEscaped}" onerror="this.src='https://placehold.co/300x200?text=Producto'">
                        <div>
                            <h2>${nameEscaped}</h2>
                            <div class="vendor"><i class="fas fa-building"></i> ${vendorEscaped}</div>
                            <div style="margin-top:4px; font-size:0.85rem; color:#64748b;">
                                <i class="fas fa-tag"></i> ${categoryEscaped}
                            </div>
                        </div>
                    </div>

                    <div class="detail-modal-body">
                        <div class="info-item price">
                            <label>Precio</label>
                            <span>${product.isOffer ? `<span style="text-decoration:line-through;font-size:0.9rem;color:#94a3b8;">$${product.originalPrice.toFixed(2)}</span> <span style="color:#ef4444;">$${product.price.toFixed(2)}</span>` : `$${product.price.toFixed(2)}`}</span>
                        </div>
                        <div class="info-item">
                            <label>Unidad</label>
                            <span>${unitEscaped}</span>
                        </div>
                        <div class="info-item">
                            <label>Cantidad mínima</label>
                            <span>${product.cantidad_minima}</span>
                        </div>
                        <div class="info-item">
                            <label>Stock disponible</label>
                            <span>${product.stock_disponible}</span>
                        </div>
                        ${product.es_perecedero ? `
                        <div class="info-item">
                            <label>Vida útil</label>
                            <span>${product.dias_vida_util || 'N/A'} días</span>
                        </div>` : ''}
                        <div class="info-item" style="grid-column: 1 / -1;">
                            <label>Descripción</label>
                            <span style="font-weight:400; font-size:0.95rem;">${descriptionEscaped}</span>
                        </div>
                        <div class="info-item" style="grid-column: 1 / -1;">
                            <label>Origen</label>
                            <span><i class="fas fa-map-marker-alt"></i> ${product.origin}</span>
                        </div>
                    </div>

                    <div class="detail-modal-footer">
                        <button class="btn-close" onclick="document.getElementById('productDetailModal').remove()">Cerrar</button>
                        <button class="btn-add-cart" onclick="window.marketplace._addFromModal(${product.id})">
                            <i class="fas fa-cart-plus"></i> Añadir al carrito (1)
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('productDetailModal').dataset.productId = product.id;
    },

    _addFromModal: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (window.CartModule?.addToCart) {
            window.CartModule.addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                proveedorNombre: product.proveedorNombre,
                proveedorId: product.proveedorId,
                sucursalOrigenId: product.sucursalOrigenId,
                img: product.img,
                inventario: product.inventario
            }, 1);
            this.showToast(`${product.name} añadido al carrito`);
            const modal = document.getElementById('productDetailModal');
            if (modal) modal.remove();
        } else {
            this.showToast('Carrito no disponible', true);
        }
    },

    setupEvents: function() {
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderProducts();
            });
        }
        window.addEventListener('storage', (e) => {
            if (e.key === 'userRole') this.renderProducts();
        });
    },

    showToast: function(message, isErr = false) {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.innerText = message;
            toast.style.display = 'flex';
            toast.style.background = isErr ? '#ef4444' : '#10b981';
            clearTimeout(this._toastTimeout);
            this._toastTimeout = setTimeout(() => toast.style.display = 'none', 3000);
        } else {
            alert(message);
        }
    },

    refresh: async function() {
        await this.loadProducts({}, true);
        this.renderCategories();
        this.renderProducts();
        this.showToast('Marketplace actualizado');
    },

    destroy: function() {
        console.log('Marketplace: Destruido');
    }
};

// Inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.marketplace && window.marketplace.init) window.marketplace.init();
    });
} else {
    if (window.marketplace && window.marketplace.init) window.marketplace.init();
}