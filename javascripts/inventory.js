// inventory.js
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
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        const inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
        this.inventory = productos.map(p => {
            const inv = inventario.find(i => i.productoid === p.id);
            return {
                id: p.id,
                codigo: `PROD-${p.id}`,
                name: p.nombreproducto,
                category: p.categoria_nombre || 'General',
                unidad: p.unidad_nombre || 'Unidad',
                stock: inv ? parseFloat(inv.stockdisponible) : 0,
                price: p.precioventa ? `$${parseFloat(p.precioventa).toFixed(2)}` : '$0.00'
            };
        });
        if (!this.inventory.length) this.inventory = [];
    },
    
    renderInventory: function() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;
        let filtered = [...this.inventory];
        if (this.currentFilter !== 'todos') filtered = filtered.filter(item => item.category.toLowerCase() === this.currentFilter.toLowerCase());
        if (this.currentSearch) {
            const s = this.currentSearch.toLowerCase();
            filtered = filtered.filter(item => item.codigo.toLowerCase().includes(s) || item.name.toLowerCase().includes(s) || item.category.toLowerCase().includes(s));
        }
        if (filtered.length === 0) {
            tbody.innerHTML = `<td><td colspan="6"><div class="empty-state">No se encontraron productos</div></td></td>`;
            this.updateStats();
            return;
        }
        tbody.innerHTML = filtered.map(item => {
            const categoryClass = item.category.toLowerCase().replace(/ /g, '');
            const stockStatus = item.stock < 10 ? 'low-stock' : item.stock < 50 ? 'medium-stock' : 'high-stock';
            return `
                <tr data-id="${item.id}">
                    <td>${item.codigo}</td>
                    <td>${item.name} <span style="font-size:0.7rem;color:gray;">(${item.unidad})</span></td>
                    <td><span class="badge badge-${categoryClass}">${item.category}</span></td>
                    <td><span class="stock-pill ${stockStatus}">${item.stock}</span></td>
                    <td><strong>${item.price}</strong></td>
                    <td class="actions-cell">
                        <button class="action-btn view-btn" data-action="view" title="Ver detalles"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-action="edit" title="Editar"><i class="fas fa-pen-to-square"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
        this.setupTableDelegation();
        this.updateStats();
    },
    
    setupTableDelegation: function() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const row = btn.closest('tr');
            const id = parseInt(row.dataset.id);
            const item = this.inventory.find(i => i.id === id);
            if (action === 'view') this.showProductDetails(item);
            else if (action === 'edit') this.openProductModal(item);
        });
    },
    
    showProductDetails: function(product) {
        const detailsHTML = `
            <div class="modal-overlay active" id="detailsModal" onclick="if(event.target===this)this.remove()">
                <div class="modal detail-card">
                    <div class="modal-header"><h2>Detalles del Producto</h2><button class="modal-close" onclick="document.getElementById('detailsModal').remove()">&times;</button></div>
                    <div class="modal-body">
                        <div class="detail-grid">
                            <div class="detail-item"><span>Código:</span><strong>${product.codigo}</strong></div>
                            <div class="detail-item"><span>Nombre:</span><strong>${product.name}</strong></div>
                            <div class="detail-item"><span>Categoría:</span><strong>${product.category}</strong></div>
                            <div class="detail-item"><span>Unidad:</span><strong>${product.unidad}</strong></div>
                            <div class="detail-item"><span>Stock:</span><strong>${product.stock}</strong></div>
                            <div class="detail-item"><span>Precio:</span><strong>${product.price}</strong></div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },
    
    openProductModal: function(product) {
        this.closeProductModal();
        const modalHTML = `
            <div class="modal-overlay active" id="productModal">
                <div class="modal card-shadow">
                    <div class="modal-header"><h2>✏️ Editar Producto</h2><button class="modal-close" onclick="window.inventory.closeProductModal()">&times;</button></div>
                    <div class="modal-body">
                        <form id="productForm">
                            <div class="form-grid">
                                <div class="form-group"><label>Nombre</label><input type="text" id="name" value="${product.name}" required></div>
                                <div class="form-group"><label>Categoría</label><input type="text" id="category" value="${product.category}" required></div>
                                <div class="form-group"><label>Unidad</label><input type="text" id="unidad" value="${product.unidad}"></div>
                                <div class="form-group"><label>Stock</label><input type="number" id="stock" value="${product.stock}"></div>
                                <div class="form-group"><label>Precio</label><input type="text" id="price" value="${product.price.replace('$','')}"></div>
                            </div>
                            <div class="form-actions"><button type="button" class="btn-cancel" onclick="window.inventory.closeProductModal()">Cancelar</button><button type="submit" class="btn-save">Guardar</button></div>
                        </form>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('productForm').addEventListener('submit', (e) => this.saveProduct(e, product));
    },
    
    saveProduct: function(e, product) {
        e.preventDefault();
        product.name = document.getElementById('name').value;
        product.category = document.getElementById('category').value;
        product.unidad = document.getElementById('unidad').value;
        product.stock = parseInt(document.getElementById('stock').value);
        product.price = '$' + parseFloat(document.getElementById('price').value).toFixed(2);
        // Actualizar en localStorage (productos e inventario)
        let productos = JSON.parse(localStorage.getItem('productos') || '[]');
        const prodIndex = productos.findIndex(p => p.id === product.id);
        if (prodIndex !== -1) productos[prodIndex].nombreproducto = product.name;
        localStorage.setItem('productos', JSON.stringify(productos));
        let inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
        const invIndex = inventario.findIndex(i => i.productoid === product.id);
        if (invIndex !== -1) inventario[invIndex].stockdisponible = product.stock;
        localStorage.setItem('inventario', JSON.stringify(inventario));
        this.loadData();
        this.renderInventory();
        this.closeProductModal();
        this.showNotification('Producto actualizado', 'success');
    },
    
    closeProductModal: function() { const modal = document.getElementById('productModal'); if (modal) modal.remove(); },
    
    updateStats: function() {
        document.getElementById('totalProducts').textContent = this.inventory.length;
        document.getElementById('totalStock').textContent = this.inventory.reduce((s, i) => s + i.stock, 0);
        document.getElementById('lowStock').textContent = this.inventory.filter(i => i.stock < 10).length;
        document.getElementById('categories').textContent = new Set(this.inventory.map(i => i.category)).size;
    },
    
    setupEvents: function() {
        this.setupTableDelegation();
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.renderInventory();
            });
        });
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.addEventListener('input', (e) => { this.currentSearch = e.target.value; this.renderInventory(); });
    },
    
    showNotification: function(msg, type) {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.innerText = msg;
            toast.style.display = 'flex';
            toast.style.background = type === 'error' ? '#dc2626' : '#10b981';
            setTimeout(() => toast.style.display = 'none', 3000);
        } else alert(msg);
    }
};