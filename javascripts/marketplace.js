// marketplace.js - Módulo completo con carrito integrado
window.marketplace = {
    
   categories: [],
    currentCategory: "Todos",
    searchTerm: "",
    selectedQuantities: {},

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    init: function () {
        console.log('Marketplace: Inicializando');

        this.categories = ["Todos", ...new Set(this.products.map(p => p.category))];

        this.products.forEach(p => { this.selectedQuantities[p.id] = 1; });

        this.renderCategories();
        this.renderProducts();
        this.setupEvents();
    },

    // ========================================
    // EVENTOS
    // ========================================
    setupEvents: function () {
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
    getCategoryIcon: function (cat) {
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

    isClientRole: function () {
        const role = localStorage.getItem('userRole') || "client";
        return role === "client";
    },

    showToast: function (message, type = "success") {
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
    renderCategories: function () {
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

    filterByCategory: function (category) {
        this.currentCategory = category;
        this.renderCategories();
        this.renderProducts();
    },

    // ========================================
    // PRODUCTOS
    // ========================================
    renderProducts: function () {
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
                    </div>
                </div>
            `;
        }).join('');
    },

    // ========================================
    // LIMPIEZA
    // ========================================
    destroy: function () {
        console.log('Marketplace: Destruido');
        this.selectedQuantities = {};
    }
};

// ========================================
// EXPONER FUNCIONES GLOBALES
// ========================================
window.filterByCategory = (cat) => window.marketplace?.filterByCategory(cat);