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
        return this.loadDataFromAPI();
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
                productos = appUtils.readJSON('productos', []);
                this.showNotification('No se pudieron actualizar los productos. Se muestra la copia guardada.', 'warning');
            }

            if (invResult.success) {
                inventario = invResult.data;
                console.log(`✅ Inventario cargado: ${inventario.length}`);
            } else {
                console.warn("⚠️ Error al cargar inventario, usando localStorage:", invResult.error);
                inventario = appUtils.readJSON('inventario', []);
                this.showNotification('No se pudo actualizar el stock. Se muestra la copia guardada.', 'warning');
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
            const productos = appUtils.readJSON('productos', []);
            const inventario = appUtils.readJSON('inventario', []);
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
            const records = this.inventario.filter(i => i.productoid === p.id);
            const inv = records[0];
            let categoria = p.categoria_nombre || p.categoria || 'General';
            return {
                id: p.id || index,
                inventoryId: inv ? inv.id : null,
                codigo: `PROD-${p.id || index}`,
                name: p.nombreproducto || p.nombre || 'Sin nombre',
                category: categoria,
                unidad: p.unidad_nombre || p.unidad || 'Unidad',
                stock: records.reduce((sum, i) => sum + Number(i.stockdisponible || 0), 0),
                price: p.precioventa ? `${appUtils.currencySymbol()}${parseFloat(p.precioventa).toFixed(2)}` : appUtils.money(0),
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
        const catalogos = appUtils.readJSON('catalogos', {});
        if (catalogos.categorias && Array.isArray(catalogos.categorias)) {
            catalogos.categorias.forEach(c => {
                const nombre = c.nombrecategoria || c.nombre || c.NombreCategoria || c.Nombre;
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
    openProductModal: function(product) { this.openEditor(this.productos.find(p => p.id === product.id)); },
    openCreateProductModal: function() { this.openEditor(null); },
    openEditor: function(product) {
        this.closeProductModal();
        const catalogs = appUtils.readJSON('catalogos', {});
        const branches = appUtils.readJSON('sucursales', []).filter(b => b.estado === 'Activo');
        if (!branches.length) { this.showNotification('Crea una sucursal activa en Mi Perfil antes de registrar stock.', 'warning'); return; }
        const escape = value => this.escapeHtml(String(value ?? ''));
        const options = (items, name, selected) => items.map(item => `<option value="${escape(item.id)}" ${String(item.id) === String(selected) ? 'selected' : ''}>${escape(item[name])}</option>`).join('');
        const html = `<div class="modal-overlay active" id="productModal"><div class="modal card-shadow"><div class="modal-header"><h2>${product ? 'Editar producto' : 'Nuevo producto'}</h2><button type="button" id="closeProductEditor">?</button></div><form id="productEditor" class="modal-body"><div class="form-grid">
            <label>Nombre<input name="nombreproducto" value="${escape(product?.nombreproducto)}" required maxlength="150"></label>
            <label>Categor?a<select name="categoriaid" required>${options(catalogs.categorias || [], 'nombrecategoria', product?.categoriaid)}</select></label>
            <label>Unidad<select name="unidadmedidaid" required>${options(catalogs.unidades_medida || [], 'nombreunidad', product?.unidadmedidaid)}</select></label>
            <label>Precio<input name="precioventa" type="number" step="0.01" min="0.01" value="${escape(product?.precioventa || '')}" required></label>
            <label>Cantidad m?nima<input name="cantidadminimapedido" type="number" min="1" step="1" value="${product?.cantidadminimapedido || 1}" required></label>
            <label>Sucursal<select name="sucursal_id" id="productBranch">${options(branches, 'nombresucursal')}</select></label>
            <label>Stock en esta sucursal<input name="stock" id="productStock" type="number" step="0.01" min="0" value="0" required></label>
            </div><p id="productEditorStatus" role="status"></p><button type="submit" class="btn-primary">Guardar</button></form></div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        const form = document.getElementById('productEditor');
        const branch = document.getElementById('productBranch');
        const updateStock = () => { document.getElementById('productStock').value = this.inventario.find(i => i.productoid === product?.id && i.sucursalid === Number(branch.value))?.stockdisponible || 0; };
        branch.onchange = updateStock; updateStock();
        document.getElementById('closeProductEditor').onclick = () => this.closeProductModal();
        form.onsubmit = async event => {
            event.preventDefault(); const button = form.querySelector('button[type="submit"]'); button.disabled = true;
            const data = Object.fromEntries(new FormData(form));
            data.categoriaid = Number(data.categoriaid); data.unidadmedidaid = Number(data.unidadmedidaid); data.sucursal_id = Number(data.sucursal_id);
            data[product ? 'stock_disponible' : 'stock_inicial'] = data.stock; delete data.stock;
            try {
                const result = product ? await api.updateProduct(product.id, data) : await api.createProduct(data);
                if (!result.success) { document.getElementById('productEditorStatus').textContent = result.error; return; }
                this.closeProductModal(); await this.loadDataFromAPI(); this.showNotification('Producto y stock guardados.', 'success');
            } finally { button.disabled = false; }
        };
    },
    deleteProduct: async function(product) {
        if (!confirm(`?Eliminar "${product.name}"?`)) return;
        const result = await api.deleteProduct(product.id);
        if (result.success) await this.loadDataFromAPI(); else this.showNotification(result.error, 'error');
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
    showNotification: function(msg, type) { appUtils.showToast(msg, type); },

    // ========== UTILIDADES ==========
    escapeHtml: appUtils.escapeHtml
};
