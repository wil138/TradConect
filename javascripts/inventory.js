// inventory.js - Gestión de inventario con API (productos + stock)
window.inventory = {
    inventory: [],
    categories: [],
    currentFilter: 'todos',
    currentSearch: '',
    productos: [],
    inventario: [],

    init: function() {
        console.log("📦 Inventory: Inicializando");
        this.loadDataFromAPI();
    },

    // ========== CARGA DE DATOS DESDE API ==========
    loadDataFromAPI: async function() {
        try {
            console.log("🔄 Cargando productos e inventario desde API...");
            const [prodResult, invResult] = await Promise.all([
                api.getProducts(),
                api.getInventory()
            ]);

            let productos = [];
            let inventario = [];

            if (prodResult.success) {
                productos = prodResult.data;
                console.log(`✅ Productos cargados: ${productos.length}`);
            } else {
                console.warn("⚠️ Error al cargar productos, usando localStorage:", prodResult.error);
                productos = JSON.parse(localStorage.getItem('productos') || '[]');
            }

            if (invResult.success) {
                inventario = invResult.data;
                console.log(`✅ Inventario cargado: ${inventario.length}`);
            } else {
                console.warn("⚠️ Error al cargar inventario, usando localStorage:", invResult.error);
                inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
            }

            this.productos = productos;
            this.inventario = inventario;
            this.buildInventory();
            this.extractCategories();
            this.renderFilters();
            this.renderInventory();
            this.setupEvents();
            this.setupCreateButton();
            this.updateStats();
        } catch (error) {
            console.error("❌ Error en loadDataFromAPI:", error);
            // Fallback a localStorage
            const productos = JSON.parse(localStorage.getItem('productos') || '[]');
            const inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
            this.productos = productos;
            this.inventario = inventario;
            this.buildInventory();
            this.extractCategories();
            this.renderFilters();
            this.renderInventory();
            this.setupEvents();
            this.setupCreateButton();
            this.updateStats();
        }
    },

    // ========== CONSTRUCCIÓN DE INVENTARIO COMBINADO ==========
    buildInventory: function() {
        this.inventory = this.productos.map((p, index) => {
            const inv = this.inventario.find(i => i.productoid === p.id);
            let categoria = p.categoria_nombre || p.categoria || 'General';
            return {
                id: p.id || index,
                inventoryId: inv ? inv.id : null,
                codigo: `PROD-${p.id || index}`,
                name: p.nombreproducto || p.nombre || 'Sin nombre',
                category: categoria,
                unidad: p.unidad_nombre || p.unidad || 'Unidad',
                stock: inv ? parseFloat(inv.stockdisponible) : 0,
                price: p.precioventa ? `$${parseFloat(p.precioventa).toFixed(2)}` : '$0.00',
                productId: p.id
            };
        });
        console.log(`📦 Inventario combinado: ${this.inventory.length} productos`);
    },

    // ========== EXTRACCIÓN DE CATEGORÍAS ==========
    extractCategories: function() {
        const categoriesSet = new Set();
        this.inventory.forEach(item => {
            if (item.category && item.category !== 'General') {
                categoriesSet.add(item.category);
            }
        });
        const catalogos = JSON.parse(localStorage.getItem('catalogos') || '{}');
        if (catalogos.categorias && Array.isArray(catalogos.categorias)) {
            catalogos.categorias.forEach(c => {
                const nombre = c.nombre || c.NombreCategoria || c.Nombre;
                if (nombre) categoriesSet.add(nombre);
            });
        }
        this.categories = [...categoriesSet].sort((a,b) => a.localeCompare(b));
        if (this.categories.length === 0) {
            this.categories = [
                'Carnes y Embutidos', 'Frutas y Verduras', 'Lácteos y Huevos',
                'Abarrotes', 'Bebidas', 'Panadería y Repostería',
                'Especias y Condimentos', 'Utensilios de Cocina', 'Vajilla y Cristalería',
                'Equipamiento', 'Limpieza', 'Pescados y Mariscos', 'Empaque y Desechables'
            ];
        }
        console.log(`📂 Categorías extraídas: ${this.categories.length}`);
    },

    // ========== RENDERIZADO DE FILTROS ==========
    renderFilters: function() {
        const container = document.querySelector('.tabs-container .tabs') || document.querySelector('.tabs');
        if (!container) return;
        let html = `<button class="tab-btn active" data-filter="todos"><i class="fas fa-list"></i> Todos</button>`;
        this.categories.forEach(cat => {
            if (typeof cat === 'string' && cat.trim()) {
                const safeCat = cat.trim();
                const icon = this.getCategoryIcon(safeCat);
                const filterValue = safeCat.toLowerCase().replace(/\s+/g, '-');
                html += `<button class="tab-btn" data-filter="${filterValue}"><i class="fas ${icon}"></i> ${safeCat}</button>`;
            }
        });
        container.innerHTML = html;
        this.setupEvents();
    },

    getCategoryIcon: function(category) {
        const icons = {
            'Carnes y Embutidos': 'fa-drumstick-bite',
            'Frutas y Verduras': 'fa-apple-alt',
            'Lácteos y Huevos': 'fa-cheese',
            'Abarrotes': 'fa-boxes',
            'Bebidas': 'fa-wine-bottle',
            'Panadería y Repostería': 'fa-bread-slice',
            'Especias y Condimentos': 'fa-pepper-hot',
            'Utensilios de Cocina': 'fa-utensils',
            'Vajilla y Cristalería': 'fa-wine-glass-alt',
            'Equipamiento': 'fa-microphone',
            'Limpieza': 'fa-pump-soap',
            'Pescados y Mariscos': 'fa-fish',
            'Empaque y Desechables': 'fa-recycle'
        };
        return icons[category] || 'fa-tag';
    },

    // ========== RENDERIZADO DE TABLA ==========
    renderInventory: function() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;

        const filter = (this.currentFilter || 'todos').toLowerCase().replace(/\s+/g, '-');
        const search = (this.currentSearch || '').toLowerCase();

        let filtered = this.inventory;
        if (filter !== 'todos') {
            filtered = filtered.filter(item => (item.category || 'General').toLowerCase().replace(/\s+/g, '-') === filter);
        }
        if (search) {
            filtered = filtered.filter(item => 
                (item.codigo || '').toLowerCase().includes(search) ||
                (item.name || '').toLowerCase().includes(search) ||
                (item.category || '').toLowerCase().includes(search)
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-inbox"></i><p>No se encontraron productos</p></div></td></tr>`;
            this.updateStats();
            return;
        }

        tbody.innerHTML = filtered.map(item => {
            const stock = typeof item.stock === 'number' ? item.stock : 0;
            const stockStatus = stock < 10 ? 'low-stock' : stock < 50 ? 'medium-stock' : 'high-stock';
            return `
                <tr data-id="${item.id || ''}" data-inventory-id="${item.inventoryId || ''}">
                    <td><strong>${item.codigo || 'N/A'}</strong></td>
                    <td>${this.escapeHtml(item.name)} <span style="font-size:0.75rem;color:#888;">(${this.escapeHtml(item.unidad)})</span></td>
                    <td><span class="badge">${this.escapeHtml(item.category)}</span></td>
                    <td><span class="stock-pill ${stockStatus}">${stock}</span></td>
                    <td><strong>${item.price}</strong></td>
                    <td class="actions-cell">
                        <button class="action-btn view-btn" data-action="view" title="Ver detalles"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-action="edit" title="Editar"><i class="fas fa-pen-to-square"></i></button>
                        <button class="action-btn delete-btn" data-action="delete" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        this.setupTableDelegation();
        this.updateStats();
    },

    // ========== DELEGACIÓN DE EVENTOS EN TABLA ==========
    setupTableDelegation: function() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;
        tbody.removeEventListener('click', this._tableClickHandler);
        this._tableClickHandler = (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const row = btn.closest('tr');
            if (!row) return;
            const id = parseInt(row.dataset.id);
            const inventoryId = row.dataset.inventoryId ? parseInt(row.dataset.inventoryId) : null;
            const item = this.inventory.find(i => i.id === id);
            if (!item) return;
            if (action === 'view') this.showProductDetails(item);
            else if (action === 'edit') this.openProductModal(item, inventoryId);
            else if (action === 'delete') this.deleteProduct(item);
        };
        tbody.addEventListener('click', this._tableClickHandler);
    },

    // ========== VER DETALLES DEL PRODUCTO ==========
    showProductDetails: function(product) {
        if (!product) return;
        const detailsHTML = `
            <div class="modal-overlay active" id="detailsModal" onclick="if(event.target===this)this.remove()">
                <div class="modal detail-card">
                    <div class="modal-header">
                        <h2><i class="fas fa-box"></i> Detalles del Producto</h2>
                        <button class="modal-close" onclick="document.getElementById('detailsModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-grid">
                            <div class="detail-item"><span>Código:</span><strong>${this.escapeHtml(product.codigo)}</strong></div>
                            <div class="detail-item"><span>Nombre:</span><strong>${this.escapeHtml(product.name)}</strong></div>
                            <div class="detail-item"><span>Categoría:</span><strong>${this.escapeHtml(product.category)}</strong></div>
                            <div class="detail-item"><span>Unidad:</span><strong>${this.escapeHtml(product.unidad)}</strong></div>
                            <div class="detail-item"><span>Stock:</span><strong>${product.stock}</strong></div>
                            <div class="detail-item"><span>Precio:</span><strong style="color:#10b981;">${product.price}</strong></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="document.getElementById('detailsModal').remove()" class="btn-secondary">Cerrar</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },

    // ========== MODAL DE EDICIÓN ==========
    openProductModal: function(product, inventoryId) {
        this.closeProductModal();
        const currentCategory = product.category || 'General';
        const allCategories = [...new Set([...this.categories, currentCategory])].sort((a,b) => a.localeCompare(b));
        const catOptions = allCategories.map(cat => 
            `<option value="${this.escapeHtml(cat)}" ${cat === currentCategory ? 'selected' : ''}>${this.escapeHtml(cat)}</option>`
        ).join('');

        const modalHTML = `
            <div class="modal-overlay active" id="productModal" onclick="if(event.target===this)window.inventory.closeProductModal()">
                <div class="modal card-shadow" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2><i class="fas fa-pen"></i> Editar Producto</h2>
                        <button class="modal-close" onclick="window.inventory.closeProductModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Nombre</label>
                                    <input type="text" id="name" value="${this.escapeHtml(product.name)}" required>
                                </div>
                                <div class="form-group">
                                    <label>Categoría</label>
                                    <select id="category" required>${catOptions}</select>
                                </div>
                                <div class="form-group">
                                    <label>Unidad</label>
                                    <input type="text" id="unidad" value="${this.escapeHtml(product.unidad)}">
                                </div>
                                <div class="form-group">
                                    <label>Stock</label>
                                    <input type="number" id="stock" value="${product.stock}" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Precio</label>
                                    <input type="number" id="price" value="${parseFloat(product.price.replace('$',''))}" step="0.01" min="0">
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-cancel" onclick="window.inventory.closeProductModal()">Cancelar</button>
                                <button type="submit" class="btn-save">💾 Guardar cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('productModal');
        if (modal) modal.dataset.inventoryId = inventoryId || '';
        const form = document.getElementById('productForm');
        if (form) {
            form.removeEventListener('submit', this._saveHandler);
            this._saveHandler = (e) => this.saveProduct(e, product);
            form.addEventListener('submit', this._saveHandler);
        }
    },

    // ========== GUARDAR PRODUCTO EDITADO ==========
    saveProduct: async function(e, product) {
        e.preventDefault();
        try {
            const newName = document.getElementById('name').value;
            const newCategory = document.getElementById('category').value;
            const newUnidad = document.getElementById('unidad').value;
            const newStock = parseInt(document.getElementById('stock').value) || 0;
            const newPrice = parseFloat(document.getElementById('price').value) || 0;
            const modal = document.getElementById('productModal');
            const inventoryId = modal ? modal.dataset.inventoryId : null;

            const productData = {
                nombreproducto: newName,
                categoria_nombre: newCategory,
                unidad_nombre: newUnidad,
                precioventa: newPrice
            };

            const productResult = await api.updateProduct(product.id, productData);
            if (!productResult.success) {
                this.showNotification(`❌ Error al actualizar producto: ${productResult.error}`, 'error');
                return;
            }

            if (inventoryId) {
                await api.updateInventory(inventoryId, { stockdisponible: newStock });
            } else if (newStock > 0) {
                await api.createInventory({ productoid: product.id, stockdisponible: newStock });
            }

            this.showNotification('✅ Producto actualizado', 'success');
            await this.loadDataFromAPI();
            this.closeProductModal();
        } catch (error) {
            console.error(error);
            this.showNotification('Error al guardar', 'error');
        }
    },

    // ========== ELIMINAR PRODUCTO ==========
    deleteProduct: async function(product) {
        if (!confirm(`¿Eliminar "${product.name}"?`)) return;
        try {
            const result = await api.deleteProduct(product.id);
            if (result.success) {
                this.showNotification('Producto eliminado', 'success');
                await this.loadDataFromAPI();
            } else {
                this.showNotification('Error al eliminar', 'error');
            }
        } catch (error) {
            console.error(error);
            this.showNotification('Error de conexión', 'error');
        }
    },

    // ========== CREAR NUEVO PRODUCTO ==========
    openCreateProductModal: function() {
        const sortedCategories = [...this.categories].sort((a,b) => a.localeCompare(b));
        const catOptions = sortedCategories.map(cat => 
            `<option value="${this.escapeHtml(cat)}">${this.escapeHtml(cat)}</option>`
        ).join('');

        const modalHTML = `
            <div class="modal-overlay active" id="createProductModal" onclick="if(event.target===this)window.inventory.closeProductModal()">
                <div class="modal card-shadow" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2><i class="fas fa-plus-circle"></i> Nuevo Producto</h2>
                        <button class="modal-close" onclick="window.inventory.closeProductModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="createProductForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Nombre *</label>
                                    <input type="text" id="newName" placeholder="Ej: Arroz integral" required>
                                </div>
                                <div class="form-group">
                                    <label>Categoría *</label>
                                    <select id="newCategory" required>
                                        <option value="">Selecciona</option>
                                        ${catOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Unidad</label>
                                    <input type="text" id="newUnidad" placeholder="kg, L, unidad" value="Unidad">
                                </div>
                                <div class="form-group">
                                    <label>Stock inicial</label>
                                    <input type="number" id="newStock" value="0" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Precio *</label>
                                    <input type="number" id="newPrice" placeholder="0.00" step="0.01" min="0" required>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-cancel" onclick="window.inventory.closeProductModal()">Cancelar</button>
                                <button type="submit" class="btn-save">✨ Crear producto</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const form = document.getElementById('createProductForm');
        if (form) {
            form.removeEventListener('submit', this._createHandler);
            this._createHandler = (e) => this.createNewProduct(e);
            form.addEventListener('submit', this._createHandler);
        }
    },

    createNewProduct: async function(e) {
        e.preventDefault();
        try {
            const nombre = document.getElementById('newName').value;
            const categoria = document.getElementById('newCategory').value;
            const unidad = document.getElementById('newUnidad').value || 'Unidad';
            const stock = parseInt(document.getElementById('newStock').value) || 0;
            const precio = parseFloat(document.getElementById('newPrice').value);

            if (!nombre || !categoria || !precio) {
                this.showNotification('Completa todos los campos obligatorios', 'warning');
                return;
            }

            const productData = {
                nombreproducto: nombre,
                categoria_nombre: categoria,
                unidad_nombre: unidad,
                precioventa: precio
            };

            const result = await api.createProduct(productData);
            if (result.success) {
                if (stock > 0) {
                    await api.createInventory({ productoid: result.data.id, stockdisponible: stock });
                }
                this.showNotification('Producto creado', 'success');
                await this.loadDataFromAPI();
                this.closeProductModal();
            } else {
                this.showNotification('Error al crear', 'error');
            }
        } catch (error) {
            console.error(error);
            this.showNotification('Error de conexión', 'error');
        }
    },

    // ========== CERRAR MODAL ==========
    closeProductModal: function() {
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
    },

    // ========== BOTÓN CREAR ==========
    setupCreateButton: function() {
        const createBtn = document.getElementById('addProductBtn');
        if (createBtn) {
            createBtn.removeEventListener('click', this._createBtnHandler);
            this._createBtnHandler = () => this.openCreateProductModal();
            createBtn.addEventListener('click', this._createBtnHandler);
        }
    },

    // ========== ESTADÍSTICAS ==========
    updateStats: function() {
        const totalProducts = document.getElementById('totalProducts');
        const totalStock = document.getElementById('totalStock');
        const lowStock = document.getElementById('lowStock');
        const categories = document.getElementById('categories');

        if (totalProducts) totalProducts.innerText = this.inventory.length;
        if (totalStock) totalStock.innerText = Math.round(this.inventory.reduce((s, i) => s + (i.stock || 0), 0));
        if (lowStock) lowStock.innerText = this.inventory.filter(i => (i.stock || 0) < 10).length;
        if (categories) categories.innerText = new Set(this.inventory.map(i => i.category || 'General')).size;
    },

    // ========== EVENTOS DE FILTRO Y BÚSQUEDA ==========
    setupEvents: function() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.removeEventListener('click', this._tabHandler);
            this._tabHandler = () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter') || 'todos';
                this.renderInventory();
            };
            btn.addEventListener('click', this._tabHandler);
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.removeEventListener('input', this._searchHandler);
            this._searchHandler = (e) => { this.currentSearch = e.target.value; this.renderInventory(); };
            searchInput.addEventListener('input', this._searchHandler);
        }
    },

    // ========== NOTIFICACIONES ==========
    showNotification: function(msg, type) {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.innerText = msg;
            toast.style.display = 'flex';
            toast.style.background = type === 'error' ? '#dc2626' : type === 'warning' ? '#f59e0b' : '#10b981';
            clearTimeout(this._toastTimeout);
            this._toastTimeout = setTimeout(() => toast.style.display = 'none', 3000);
        } else {
            alert(msg);
        }
    },

    // ========== UTILIDADES ==========
    escapeHtml: function(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    if (window.inventory && typeof window.inventory.init === 'function') {
        window.inventory.init();
    }
});