// Datos del inventario (fuente inmutable)
const inventoryData = [
    { id: 1, codigo: "CEM-001", name: "Cemento Canal 42.5kg", stock: 150, price: "$12.50", category: "Construcción" },
    { id: 2, codigo: "HIE-001", name: "Hierro Corrugado 3/8", stock: 45, price: "$8.75", category: "Metales" },
    { id: 3, codigo: "PINT-001", name: "Pintura Látex Blanca", stock: 12, price: "$85.00", category: "Acabados" },
    { id: 4, codigo: "TUB-001", name: "Tubería PVC 1/2", stock: 200, price: "$2.15", category: "Plomería" },
    { id: 5, codigo: "TAL-001", name: "Taladro Percutor 800W", stock: 30, price: "$110.00", category: "Herramientas" }
];

let inventory = [...inventoryData];      // copia de trabajo
let currentFilter = 'todos';
let currentSearch = '';
let editingId = null;

// ---------- RENDERIZADO ----------
function renderInventory() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    let filtered = inventory;

    // Filtro por categoría
    if (currentFilter !== 'todos') {
        filtered = filtered.filter(item => item.category.toLowerCase() === currentFilter);
    }

    // Búsqueda textual (código, nombre, categoría)
    if (currentSearch) {
        const s = currentSearch.toLowerCase();
        filtered = filtered.filter(item =>
            item.codigo.toLowerCase().includes(s) ||
            item.name.toLowerCase().includes(s) ||
            item.category.toLowerCase().includes(s)
        );
    }

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fa-solid fa-box-open"></i>
                        <p>No hay productos que coincidan</p>
                    </div>
                </td>
            </tr>`;
        updateStats();
        return;
    }

    filtered.forEach(item => {
        const categoryLower = item.category.toLowerCase();
        const statusClass = `badge-${categoryLower}`;
        const stockClass = item.stock < 20 ? 'low-stock' : item.stock < 50 ? 'medium-stock' : 'high-stock';

        const row = `
            <tr>
                <td><a href="#" class="order-id" data-id="${item.id}">${item.codigo}</a></td>
                <td>${item.name}</td>
                <td><span class="badge ${statusClass}">${item.category}</span></td>
                <td class="${stockClass}">${item.stock}</td>
                <td><strong>${item.price}</strong></td>
                <td>
                    <button class="action-btn edit-btn" data-id="${item.id}" title="Editar">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${item.id}" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        tableBody.innerHTML += row;
    });

    attachButtonEvents();
    updateStats();
}

function updateStats() {
    document.getElementById('totalProducts').textContent = inventory.length;
    document.getElementById('totalStock').textContent = inventory.reduce((s, i) => s + i.stock, 0);
    document.getElementById('lowStock').textContent = inventory.filter(i => i.stock < 20).length;
    document.getElementById('categories').textContent = new Set(inventory.map(i => i.category)).size;
}

// ---------- FILTROS Y BÚSQUEDA ----------
function filterInventory(filterValue) {
    currentFilter = filterValue;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filterValue) btn.classList.add('active');
    });
    renderInventory();
}

function searchInventory() {
    currentSearch = document.getElementById('searchInput').value.toLowerCase();
    renderInventory();
}

// ---------- EVENTOS DE BOTONES ----------
function attachButtonEvents() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const item = inventory.find(i => i.id === id);
            openProductModal(item);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            deleteProduct(id);
        });
    });

    document.querySelectorAll('.order-id').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const id = parseInt(link.getAttribute('data-id'));
            const item = inventory.find(i => i.id === id);
            showProductDetails(item);
        });
    });
}

// ---------- CRUD ----------
function deleteProduct(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        inventory = inventory.filter(item => item.id !== id);
        renderInventory();
        showNotification('Producto eliminado correctamente', 'success');
    }
}

function openProductModal(product = null) {
    editingId = product ? product.id : null;

    const modalHTML = `
        <div class="modal-overlay active" id="productModal">
            <div class="modal">
                <div class="modal-header">
                    <h2>${product ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
                    <button class="modal-close" onclick="closeProductModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="productForm">
                        <div class="form-group">
                            <label for="codigo">Código</label>
                            <input type="text" id="codigo" value="${product ? product.codigo : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="name">Nombre del Producto</label>
                            <input type="text" id="name" value="${product ? product.name : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="category">Categoría</label>
                            <select id="category" required>
                                <option value="">Seleccionar categoría</option>
                                <option value="Construcción" ${product?.category === 'Construcción' ? 'selected' : ''}>Construcción</option>
                                <option value="Metales" ${product?.category === 'Metales' ? 'selected' : ''}>Metales</option>
                                <option value="Acabados" ${product?.category === 'Acabados' ? 'selected' : ''}>Acabados</option>
                                <option value="Plomería" ${product?.category === 'Plomería' ? 'selected' : ''}>Plomería</option>
                                <option value="Herramientas" ${product?.category === 'Herramientas' ? 'selected' : ''}>Herramientas</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="stock">Stock</label>
                            <input type="number" id="stock" min="0" value="${product ? product.stock : 0}" required>
                        </div>
                        <div class="form-group">
                            <label for="price">Precio</label>
                            <input type="text" id="price" placeholder="$0.00" value="${product ? product.price : ''}" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeProductModal()">Cancelar</button>
                            <button type="submit" class="btn-primary">${product ? 'Actualizar' : 'Guardar'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('productForm').addEventListener('submit', saveProduct);
}

function saveProduct(e) {
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

    if (editingId) {
        const index = inventory.findIndex(item => item.id === editingId);
        if (index !== -1) {
            inventory[index] = { ...inventory[index], ...productData };
            showNotification('Producto actualizado correctamente', 'success');
        }
    } else {
        const newId = Math.max(...inventory.map(item => item.id), 0) + 1;
        inventory.push({ id: newId, ...productData });
        showNotification('Producto creado correctamente', 'success');
    }

    closeProductModal();
    renderInventory();
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.remove();
    editingId = null;
}

function showProductDetails(product) {
    const detailsHTML = `
        <div class="modal-overlay active" id="detailsModal">
            <div class="modal">
                <div class="modal-header">
                    <h2>📋 Detalles del Producto</h2>
                    <button class="modal-close" onclick="document.getElementById('detailsModal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-details">
                        <p><strong>Código:</strong> ${product.codigo}</p>
                        <p><strong>Nombre:</strong> ${product.name}</p>
                        <p><strong>Categoría:</strong> ${product.category}</p>
                        <p><strong>Stock:</strong> ${product.stock} unidades</p>
                        <p><strong>Precio:</strong> ${product.price}</p>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', detailsHTML);
}

// ---------- NOTIFICACIONES (mismo que en invoices) ----------
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ---------- EVENT LISTENERS ----------
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const filterValue = btn.getAttribute('data-filter');
        filterInventory(filterValue);
    });
});

document.querySelector('.btn-new-product')?.addEventListener('click', () => openProductModal());
document.getElementById('searchInput')?.addEventListener('input', searchInventory);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    renderInventory();
});