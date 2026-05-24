// inventory.js - Versión SPA
// inventory.js - Versión con integración API
window.inventory = {
    inventory: [],
    currentFilter: 'todos',
    currentSearch: '',
    
    init: async function() {
        console.log("Inventory: Inicializando con API");
        await this.loadInventory();
        this.setupEvents();
    },
    
    loadInventory: async function() {
        try {
            const response = await window.api.getMyProducts();
            this.inventory = response.map(p => ({
                id: p.id,
                codigo: `PROD-${p.id.toString().padStart(4, '0')}`,
                name: p.nombreproducto,
                stock: p.stock_disponible || 0,
                price: `$${parseFloat(p.precioventa).toFixed(2)}`,
                category: p.categoria_nombre || 'Sin categoría'
            }));
            this.renderInventory();
        } catch (error) {
            console.error('Error loading inventory:', error);
            this.showNotification('Error al cargar inventario', 'error');
        }
    },
    
    renderInventory: function() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;

        let filtered = this.inventory;
        
        if (this.currentFilter !== 'todos') {
            filtered = filtered.filter(item => item.category.toLowerCase() === this.currentFilter);
        }
        if (this.currentSearch) {
            const s = this.currentSearch.toLowerCase();
            filtered = filtered.filter(item =>
                item.codigo.toLowerCase().includes(s) ||
                item.name.toLowerCase().includes(s) ||
                item.category.toLowerCase().includes(s)
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">No hay productos</div></td></tr>`;
            this.updateStats();
            return;
        }

        tbody.innerHTML = filtered.map(item => {
            const categoryLower = item.category.toLowerCase();
            const stockClass = item.stock < 20 ? 'low-stock' : item.stock < 50 ? 'medium-stock' : 'high-stock';
            return `
                <tr>
                    <td><a href="#" class="order-id" data-id="${item.id}">${item.codigo}</a></td>
                    <td>${item.name}</td>
                    <td><span class="badge badge-${categoryLower}">${item.category}</span></td>
                    <td class="${stockClass}">${item.stock}</td>
                    <td><strong>${item.price}</strong></td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${item.id}" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete-btn" data-id="${item.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.updateStats();
        this.attachTableEvents();
    },
    
    attachTableEvents: function() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const item = this.inventory.find(i => i.id === id);
                if (item) this.openProductModal(item);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                if (confirm('¿Estás seguro de eliminar este producto?')) {
                    try {
                        await window.api.deleteProduct(id);
                        await this.loadInventory();
                        this.showNotification('Producto eliminado', 'success');
                    } catch (error) {
                        this.showNotification('Error al eliminar producto', 'error');
                    }
                }
            });
        });
        
        document.querySelectorAll('.order-id').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = parseInt(link.dataset.id);
                const item = this.inventory.find(i => i.id === id);
                if (item) this.showProductDetails(item);
            });
        });
    },
    
    updateStats: function() {
        const totalProducts = document.getElementById('totalProducts');
        const totalStock = document.getElementById('totalStock');
        const lowStock = document.getElementById('lowStock');
        const categories = document.getElementById('categories');
        
        if (totalProducts) totalProducts.textContent = this.inventory.length;
        if (totalStock) totalStock.textContent = this.inventory.reduce((s, i) => s + i.stock, 0);
        if (lowStock) lowStock.textContent = this.inventory.filter(i => i.stock < 20).length;
        if (categories) categories.textContent = new Set(this.inventory.map(i => i.category)).size;
    },
    
    openProductModal: function(product = null) {
        const existing = document.getElementById('productModal');
        if (existing) existing.remove();
        
        // Primero cargar categorías
        this.loadCategoriesForModal(product);
    },
    
    loadCategoriesForModal: async function(product) {
        try {
            const categories = await window.api.getCategories();
            const unidades = await window.api.getUnidadesMedida();
            
            const modalHTML = `
                <div class="modal-overlay active" id="productModal">
                    <div class="modal" style="max-width: 500px;">
                        <div class="modal-header">
                            <h2>${product ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
                            <button class="modal-close" onclick="window.inventory.closeProductModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="productForm">
                                <div class="form-group">
                                    <label>Nombre</label>
                                    <input type="text" id="name" value="${product ? product.name : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Categoría</label>
                                    <select id="category" required>
                                        <option value="">Seleccionar</option>
                                        ${categories.filter(c => c.name !== 'Todos').map(c => `
                                            <option value="${c.id}" ${product?.category === c.name ? 'selected' : ''}>${c.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Unidad de Medida</label>
                                    <select id="unidadmedida" required>
                                        <option value="">Seleccionar</option>
                                        ${unidades.map(u => `
                                            <option value="${u.id}">${u.nombreunidad}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Precio de Venta</label>
                                    <input type="number" id="price" step="0.01" min="0" value="${product ? parseFloat(product.price.replace('$', '')) : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Cantidad Mínima de Pedido</label>
                                    <input type="number" id="minorder" min="1" value="1" required>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn-secondary" onclick="window.inventory.closeProductModal()">Cancelar</button>
                                    <button type="submit" class="btn-primary">${product ? 'Actualizar' : 'Guardar'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>`;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.getElementById('productForm').addEventListener('submit', (e) => this.saveProduct(e, product));
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showNotification('Error al cargar datos', 'error');
        }
    },
    
    saveProduct: async function(e, product) {
        e.preventDefault();
        
        const productData = {
            nombreproducto: document.getElementById('name').value,
            categoriaid: parseInt(document.getElementById('category').value),
            unidadmedidaid: parseInt(document.getElementById('unidadmedida').value),
            precioventa: parseFloat(document.getElementById('price').value),
            cantidadminimapedido: parseInt(document.getElementById('minorder').value),
            descripcion: '',
            esperecedero: false,
            eliminado: false
        };
        
        try {
            if (product) {
                await window.api.updateProduct(product.id, productData);
                this.showNotification('Producto actualizado', 'success');
            } else {
                await window.api.createProduct(productData);
                this.showNotification('Producto creado', 'success');
            }
            this.closeProductModal();
            await this.loadInventory();
        } catch (error) {
            this.showNotification(error.message || 'Error al guardar producto', 'error');
        }
    },
    
    closeProductModal: function() {
        const modal = document.getElementById('productModal');
        if (modal) modal.remove();
    },
    
    showProductDetails: function(product) {
        const detailsHTML = `
            <div class="modal-overlay active" id="detailsModal">
                <div class="modal">
                    <div class="modal-header">
                        <h2>📋 Detalles del Producto</h2>
                        <button class="modal-close" onclick="document.getElementById('detailsModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Código:</strong> ${product.codigo}</p>
                        <p><strong>Nombre:</strong> ${product.name}</p>
                        <p><strong>Categoría:</strong> ${product.category}</p>
                        <p><strong>Stock:</strong> ${product.stock} unidades</p>
                        <p><strong>Precio:</strong> ${product.price}</p>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },
    
    filterByCategory: async function(category) {
        this.currentFilter = category;
        this.renderInventory();
    },
    
    searchProducts: function(term) {
        this.currentSearch = term;
        this.renderInventory();
    },
    
    setupEvents: function() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                this.filterByCategory(filter);
            });
        });
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchProducts(e.target.value));
        }
        
        const newBtn = document.getElementById('newProductBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.openProductModal());
        }
    },
    
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};