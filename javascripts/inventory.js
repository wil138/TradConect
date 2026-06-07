// inventory.js - Versión con datos de prueba según esquema SQL
window.inventory = {
    inventory: [],
    currentFilter: 'todos',
    currentSearch: '',

    // Datos de prueba simulando las tablas:
    // Categoria (Id, NombreCategoria)
    // UnidadMedida (Id, NombreUnidad, Abreviatura)
    // Producto (Id, NombreProducto, PrecioVenta, CategoriaId, UnidadMedidaId)
    // InventarioBodega (ProductoId, StockDisponible)
    defaultProducts: [
        { id: 1, codigo: "PROD-001", name: "Cemento Portland 42.5kg", category: "Construcción", unidad: "Saco", stock: 250, price: 12.50 },
        { id: 2, codigo: "PROD-002", name: "Varilla Corrugada 3/8\"", category: "Metales", unidad: "Unidad", stock: 180, price: 8.75 },
        { id: 3, codigo: "PROD-003", name: "Pintura Látex Blanca 4L", category: "Acabados", unidad: "Galón", stock: 45, price: 85.00 },
        { id: 4, codigo: "PROD-004", name: "Tubería PVC 1/2\" x 3m", category: "Plomería", unidad: "Tubo", stock: 320, price: 2.15 },
        { id: 5, codigo: "PROD-005", name: "Taladro Percutor 800W", category: "Herramientas", unidad: "Unidad", stock: 28, price: 110.00 },
        { id: 6, codigo: "PROD-006", name: "Arena Fina (Metro cúbico)", category: "Construcción", unidad: "m³", stock: 75, price: 25.00 },
        { id: 7, codigo: "PROD-007", name: "Listón de Pino 2x2x3m", category: "Construcción", unidad: "Unidad", stock: 112, price: 4.50 },
        { id: 8, codigo: "PROD-008", name: "Malla Electrosoldada 6x6", category: "Metales", unidad: "Rollo", stock: 22, price: 45.00 },
        { id: 9, codigo: "PROD-009", name: "Rodillo Profesional 9\"", category: "Acabados", unidad: "Unidad", stock: 86, price: 6.25 },
        { id: 10, codigo: "PROD-010", name: "Codo PVC 90° 1/2\"", category: "Plomería", unidad: "Unidad", stock: 500, price: 0.45 },
        { id: 11, codigo: "PROD-011", name: "Juego de Brocas para Concreto", category: "Herramientas", unidad: "Juego", stock: 38, price: 18.00 },
        { id: 12, codigo: "PROD-012", name: "Cal Hidratada 20kg", category: "Construcción", unidad: "Saco", stock: 95, price: 7.50 },
        { id: 13, codigo: "PROD-013", name: "Triplay 12mm 1.22x2.44m", category: "Construcción", unidad: "Plancha", stock: 32, price: 32.00 },
        { id: 14, codigo: "PROD-014", name: "Clavo con Cabeza 2\"", category: "Metales", unidad: "Kg", stock: 450, price: 0.05 },
        { id: 15, codigo: "PROD-015", name: "Esmalte Sintético Negro 1L", category: "Acabados", unidad: "Litro", stock: 28, price: 15.50 },
        { id: 16, codigo: "PROD-016", name: "Pegamento para PVC 8oz", category: "Plomería", unidad: "Frasco", stock: 65, price: 5.30 },
        { id: 17, codigo: "PROD-017", name: "Esmeriladora Angular 4½\"", category: "Herramientas", unidad: "Unidad", stock: 19, price: 85.00 },
        { id: 18, codigo: "PROD-018", name: "Ladrillo King Kong", category: "Construcción", unidad: "Millar", stock: 1200, price: 0.85 },
        { id: 19, codigo: "PROD-019", name: "Alambre Galvanizado #16", category: "Metales", unidad: "Kg", stock: 110, price: 3.20 },
        { id: 20, codigo: "PROD-020", name: "Thinner Corriente 1L", category: "Acabados", unidad: "Litro", stock: 48, price: 4.10 }
    ],

    init: function () {
        console.log("Inventory: Inicializando con datos de prueba SQL");
        this.loadData();
        this.renderInventory();
        this.setupEvents();
    },

    loadData: function () {
        const saved = localStorage.getItem('inventory');
        if (saved) {
            this.inventory = JSON.parse(saved);
        } else {
            // Convertir los productos por defecto a formato con precio en string con $
            this.inventory = this.defaultProducts.map(p => ({
                ...p,
                price: `$${p.price.toFixed(2)}`
            }));
            this.saveData();
        }
    },

    saveData: function () {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
    },

    renderInventory: function () {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;

        let filtered = [...this.inventory];
        if (this.currentFilter !== 'todos') {
            filtered = filtered.filter(item => item.category.toLowerCase() === this.currentFilter.toLowerCase());
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
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">No se encontraron productos</div></td></tr>`;
            this.updateStats();
            return;
        }

        tbody.innerHTML = filtered.map(item => {
            const categoryClass = item.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const stockStatus = item.stock < 20 ? 'low-stock' : item.stock < 50 ? 'medium-stock' : 'high-stock';
            return `
                <tr data-id="${item.id}">
                    <td>${item.codigo}</td>
                    <td>${item.name} <span style="font-size:0.7rem; color:gray;">(${item.unidad})</span></td>
                    <td><span class="badge badge-${categoryClass}">${item.category}</span></td>
                    <td><span class="stock-pill ${stockStatus}">${item.stock}</span></td>
                    <td><strong>${item.price}</strong></td>
                    <td class="actions-cell">
                        <button class="action-btn view-btn" data-action="view" title="Ver detalles"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-action="edit" title="Editar"><i class="fas fa-pen-to-square"></i></button>
                        <button class="action-btn delete-btn" data-action="delete" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
        this.updateStats();
    },

    updateStats: function () {
        const totalProducts = document.getElementById('totalProducts');
        const totalStock = document.getElementById('totalStock');
        const lowStock = document.getElementById('lowStock');
        const categories = document.getElementById('categories');
        if (totalProducts) totalProducts.textContent = this.inventory.length;
        if (totalStock) totalStock.textContent = this.inventory.reduce((s, i) => s + i.stock, 0);
        if (lowStock) lowStock.textContent = this.inventory.filter(i => i.stock < 20).length;
        if (categories) categories.textContent = new Set(this.inventory.map(i => i.category)).size;
    },

    // Delegación de eventos para botones
    setupTableDelegation: function () {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const row = btn.closest('tr');
            const id = parseInt(row.dataset.id);
            const item = this.inventory.find(i => i.id === id);
            e.preventDefault();
            if (action === 'view') this.showProductDetails(item);
            else if (action === 'edit') this.openProductModal(item);
            else if (action === 'delete') this.deleteProduct(id);
        });
    },

    deleteProduct: function (id) {
        if (confirm('¿Eliminar este producto permanentemente?')) {
            this.inventory = this.inventory.filter(item => item.id !== id);
            this.saveData();
            this.renderInventory();
            this.showNotification('Producto eliminado', 'error');
        }
    },

    openProductModal: function (product = null) {
        this.closeProductModal();
        const isEditing = !!product;
        const modalHTML = `
            <div class="modal-overlay active" id="productModal">
                <div class="modal card-shadow">
                    <div class="modal-header">
                        <h2>${isEditing ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
                        <button class="modal-close" onclick="window.inventory.closeProductModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm">
                            <div class="form-grid">
                                <div class="form-group"><label>Código</label><input type="text" id="codigo" value="${product ? product.codigo : ''}" placeholder="Ej: PROD-001" required></div>
                                <div class="form-group"><label>Nombre</label><input type="text" id="name" value="${product ? product.name : ''}" placeholder="Nombre del producto" required></div>
                                <div class="form-group"><label>Unidad de Medida</label><input type="text" id="unidad" value="${product ? product.unidad : 'Unidad'}" placeholder="Ej: Saco, Kg, Litro"></div>
                                <div class="form-group"><label>Categoría</label>
                                    <select id="category" required>
                                        <option value="" disabled ${!product ? 'selected' : ''}>Seleccionar categoría</option>
                                        ${['Construcción', 'Metales', 'Acabados', 'Plomería', 'Herramientas'].map(cat =>
                                            `<option value="${cat}" ${product?.category === cat ? 'selected' : ''}>${cat}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="form-group"><label>Stock</label><input type="number" id="stock" min="0" value="${product ? product.stock : 0}" required></div>
                                <div class="form-group"><label>Precio de Venta</label><input type="text" id="price" placeholder="$0.00" value="${product ? product.price.replace('$','') : ''}" required></div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-cancel" onclick="window.inventory.closeProductModal()">Cancelar</button>
                                <button type="submit" class="btn-save">${isEditing ? 'Guardar Cambios' : 'Crear Producto'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('productForm').addEventListener('submit', (e) => this.saveProduct(e, product));
    },

    saveProduct: function (e, existingProduct) {
        e.preventDefault();
        let rawPrice = document.getElementById('price').value.trim();
        if (!rawPrice.startsWith('$')) rawPrice = '$' + rawPrice;
        const productData = {
            codigo: document.getElementById('codigo').value.trim(),
            name: document.getElementById('name').value.trim(),
            unidad: document.getElementById('unidad').value.trim() || 'Unidad',
            category: document.getElementById('category').value,
            stock: parseInt(document.getElementById('stock').value) || 0,
            price: rawPrice
        };
        if (existingProduct) {
            const index = this.inventory.findIndex(i => i.id === existingProduct.id);
            if (index !== -1) {
                this.inventory[index] = { ...this.inventory[index], ...productData };
                this.showNotification('Producto actualizado', 'success');
            }
        } else {
            const newId = this.inventory.length > 0 ? Math.max(...this.inventory.map(i => i.id)) + 1 : 1;
            this.inventory.push({ id: newId, ...productData });
            this.showNotification('Producto añadido', 'success');
        }
        this.saveData();
        this.closeProductModal();
        this.renderInventory();
    },

    closeProductModal: function () {
        const modal = document.getElementById('productModal');
        if (modal) modal.remove();
    },

    showProductDetails: function (product) {
        const detailsHTML = `
            <div class="modal-overlay active" id="detailsModal" onclick="if(event.target === this) this.remove()">
                <div class="modal detail-card">
                    <div class="modal-header">
                        <h2>Detalles del Producto</h2>
                        <button class="modal-close" onclick="document.getElementById('detailsModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-grid">
                            <div class="detail-item"><span>Código:</span> <strong>${product.codigo}</strong></div>
                            <div class="detail-item"><span>Nombre:</span> <strong>${product.name}</strong></div>
                            <div class="detail-item"><span>Categoría:</span> <strong>${product.category}</strong></div>
                            <div class="detail-item"><span>Unidad:</span> <strong>${product.unidad || 'N/A'}</strong></div>
                            <div class="detail-item"><span>Stock:</span> <strong class="${product.stock < 20 ? 'text-danger' : ''}">${product.stock} unidades</strong></div>
                            <div class="detail-item"><span>Precio:</span> <strong>${product.price}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },

    setupEvents: function () {
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
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.renderInventory();
            });
        }
        const newBtn = document.getElementById('newProductBtn');
        if (newBtn) newBtn.addEventListener('click', () => this.openProductModal());
    },

    showNotification: function (msg, type = 'success') {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.innerText = msg;
            toast.style.display = 'flex';
            toast.style.background = type === 'error' ? '#dc2626' : '#10b981';
            setTimeout(() => toast.style.display = 'none', 3000);
        } else {
            alert(msg);
        }
    }
};

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.inventory.init());
} else {
    window.inventory.init();
}