// inventory.js - Versión SPA
window.inventory = {
    inventory: [],
    currentFilter: 'todos',
    currentSearch: '',
    
    init: function() {
        console.log("Inventory: Inicializando");
        this.loadData();
        this.renderInventory();
        this.setupEvents();
    },
    
    loadData: function() {
        const defaultInventory = [
            { id: 1, codigo: "CEM-001", name: "Cemento Canal 42.5kg", stock: 150, price: "$12.50", category: "Construcción" },
            { id: 2, codigo: "HIE-001", name: "Hierro Corrugado 3/8", stock: 45, price: "$8.75", category: "Metales" },
            { id: 3, codigo: "PINT-001", name: "Pintura Látex Blanca", stock: 12, price: "$85.00", category: "Acabados" },
            { id: 4, codigo: "TUB-001", name: "Tubería PVC 1/2", stock: 200, price: "$2.15", category: "Plomería" },
            { id: 5, codigo: "TAL-001", name: "Taladro Percutor 800W", stock: 30, price: "$110.00", category: "Herramientas" }
        ];
        
        const saved = localStorage.getItem('inventory');
        this.inventory = saved ? JSON.parse(saved) : defaultInventory;
    },
    
    saveData: function() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
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
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const item = this.inventory.find(i => i.id === id);
                if (item) this.openProductModal(item);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.deleteProduct(id);
            });
        });
        
        document.querySelectorAll('.order-id').forEach(link => {
            link.addEventListener('click', (e) => {
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
    
    deleteProduct: function(id) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            this.inventory = this.inventory.filter(item => item.id !== id);
            this.saveData();
            this.renderInventory();
            this.showNotification('Producto eliminado', 'success');
        }
    },
    
    openProductModal: function(product = null) {
        const existing = document.getElementById('productModal');
        if (existing) existing.remove();
        
        const modalHTML = `
            <div class="modal-overlay active" id="productModal">
                <div class="modal">
                    <div class="modal-header">
                        <h2>${product ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
                        <button class="modal-close" onclick="window.inventory.closeProductModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm">
                            <div class="form-group"><label>Código</label><input type="text" id="codigo" value="${product ? product.codigo : ''}" required></div>
                            <div class="form-group"><label>Nombre</label><input type="text" id="name" value="${product ? product.name : ''}" required></div>
                            <div class="form-group"><label>Categoría</label>
                                <select id="category" required>
                                    <option value="">Seleccionar</option>
                                    <option value="Construcción" ${product?.category === 'Construcción' ? 'selected' : ''}>Construcción</option>
                                    <option value="Metales" ${product?.category === 'Metales' ? 'selected' : ''}>Metales</option>
                                    <option value="Acabados" ${product?.category === 'Acabados' ? 'selected' : ''}>Acabados</option>
                                    <option value="Plomería" ${product?.category === 'Plomería' ? 'selected' : ''}>Plomería</option>
                                    <option value="Herramientas" ${product?.category === 'Herramientas' ? 'selected' : ''}>Herramientas</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Stock</label><input type="number" id="stock" min="0" value="${product ? product.stock : 0}" required></div>
                            <div class="form-group"><label>Precio</label><input type="text" id="price" placeholder="$0.00" value="${product ? product.price : ''}" required></div>
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
    },
    
    saveProduct: function(e, product) {
        e.preventDefault();
        let price = document.getElementById('price').value;
        if (!price.startsWith('$')) price = '$' + price;
        
        const productData = {
            codigo: document.getElementById('codigo').value,
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            stock: parseInt(document.getElementById('stock').value),
            price: price
        };
        
        if (product) {
            const index = this.inventory.findIndex(i => i.id === product.id);
            if (index !== -1) {
                this.inventory[index] = { ...this.inventory[index], ...productData };
                this.showNotification('Producto actualizado', 'success');
            }
        } else {
            const newId = Math.max(...this.inventory.map(i => i.id), 0) + 1;
            this.inventory.push({ id: newId, ...productData });
            this.showNotification('Producto creado', 'success');
        }
        
        this.saveData();
        this.closeProductModal();
        this.renderInventory();
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
    
    filterByCategory: function(category) {
        this.currentFilter = category;
        this.renderInventory();
    },
    
    searchProducts: function(term) {
        this.currentSearch = term;
        this.renderInventory();
    },
    
    setupEvents: function() {
        // Filtros por pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                this.filterByCategory(filter);
            });
        });
        
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchProducts(e.target.value));
        }
        
        // Botón nuevo producto
        const newBtn = document.getElementById('newProductBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.openProductModal());
        }
    },
    
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};