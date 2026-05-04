window.inventory = {
    inventory: [],
    currentFilter: 'todos',
    currentSearch: '',

    init: function () {
        console.log("Inventory: Inicializando");
        this.loadData();
        this.renderInventory();
        this.setupEvents();
    },

    loadData: function () {
        const defaultInventory = [
            [
                { id: 1, codigo: "CEM-001", name: "Cemento Canal 42.5kg", stock: 150, price: "$12.50", category: "Construcción" },
                { id: 2, codigo: "HIE-001", name: "Hierro Corrugado 3/8", stock: 45, price: "$8.75", category: "Metales" },
                { id: 3, codigo: "PINT-001", name: "Pintura Látex Blanca", stock: 12, price: "$85.00", category: "Acabados" },
                { id: 4, codigo: "TUB-001", name: "Tubería PVC 1/2", stock: 200, price: "$2.15", category: "Plomería" },
                { id: 5, codigo: "TAL-001", name: "Taladro Percutor 800W", stock: 30, price: "$110.00", category: "Herramientas" },
                { id: 6, codigo: "ARE-002", name: "Arena Fina (Metro)", stock: 80, price: "$25.00", category: "Construcción" },
                { id: 7, codigo: "MAD-003", name: "Listón de Pino 2x2", stock: 60, price: "$4.50", category: "Construcción" },
                { id: 8, codigo: "HIE-004", name: "Malla Electrosoldada", stock: 25, price: "$45.00", category: "Metales" },
                { id: 9, codigo: "PINT-005", name: "Rodillo Profesional 9\"", stock: 100, price: "$6.25", category: "Acabados" },
                { id: 10, codigo: "TUB-006", name: "Codo PVC 90 Grados 1/2", stock: 350, price: "$0.45", category: "Plomería" },
                { id: 11, codigo: "TAL-007", name: "Juego de Brocas Concreto", stock: 40, price: "$18.00", category: "Herramientas" },
                { id: 12, codigo: "CEM-008", name: "Cal Hidratada 20kg", stock: 95, price: "$7.50", category: "Construcción" },
                { id: 13, codigo: "MAD-009", name: "Triplay 12mm", stock: 15, price: "$32.00", category: "Construcción" },
                { id: 14, codigo: "HIE-010", name: "Clavo con Cabeza 2\"", stock: 500, price: "$0.05", category: "Metales" },
                { id: 15, codigo: "PINT-011", name: "Esmalte Sintético Negro", stock: 18, price: "$15.50", category: "Acabados" },
                { id: 16, codigo: "TUB-012", name: "Pegamento PVC 8oz", stock: 65, price: "$5.30", category: "Plomería" },
                { id: 17, codigo: "TAL-013", name: "Esmeriladora 4 1/2\"", stock: 22, price: "$85.00", category: "Herramientas" },
                { id: 18, codigo: "CEM-014", name: "Ladrillo King Kong", stock: 1200, price: "$0.85", category: "Construcción" },
                { id: 19, codigo: "HIE-015", name: "Alambre Galvanizado #16", stock: 110, price: "$3.20", category: "Metales" },
                { id: 20, codigo: "PINT-016", name: "Thinner Corriente 1Lt", stock: 48, price: "$4.10", category: "Acabados" },
                { id: 21, codigo: "TUB-017", name: "Llave de Paso 1/2 Bronce", stock: 35, price: "$14.00", category: "Plomería" },
                { id: 22, codigo: "TAL-018", name: "Martillo de Uña 16oz", stock: 55, price: "$9.50", category: "Herramientas" },
                { id: 23, codigo: "CEM-019", name: "Bloque de Concreto 15cm", stock: 800, price: "$1.10", category: "Construcción" },
                { id: 24, codigo: "HIE-020", name: "Viga H 4\"", stock: 10, price: "$120.00", category: "Metales" },
                { id: 25, codigo: "PINT-021", name: "Brocha de Cerda 3\"", stock: 120, price: "$3.50", category: "Acabados" },
                { id: 26, codigo: "TUB-022", name: "Tee PVC 1/2", stock: 210, price: "$0.65", category: "Plomería" },
                { id: 27, codigo: "TAL-023", name: "Sierra Circular 1500W", stock: 14, price: "$145.00", category: "Herramientas" },
                { id: 28, codigo: "CEM-024", name: "Yeso Agrícola 25kg", stock: 40, price: "$6.00", category: "Construcción" },
                { id: 29, codigo: "HIE-025", name: "Ángulo de Fierro 1x1/8", stock: 85, price: "$12.50", category: "Metales" },
                { id: 30, codigo: "PINT-026", name: "Barniz Marino Brillante", stock: 20, price: "$22.00", category: "Acabados" },
                { id: 31, codigo: "TUB-027", name: "Unión Americana PVC 1/2", stock: 90, price: "$2.75", category: "Plomería" },
                { id: 32, codigo: "TAL-028", name: "Caja de Herramientas 19\"", stock: 30, price: "$28.00", category: "Herramientas" },
                { id: 33, codigo: "CEM-029", name: "Aditivo para Concreto", stock: 25, price: "$42.00", category: "Construcción" },
                { id: 34, codigo: "HIE-030", name: "Tubo Cuadrado 1\" Galv.", stock: 50, price: "$19.00", category: "Metales" },
                { id: 35, codigo: "PINT-031", name: "Cinta Masking 1\"", stock: 200, price: "$1.20", category: "Acabados" },
                { id: 36, codigo: "TUB-032", name: "Desagüe para Lavabo", stock: 45, price: "$7.50", category: "Plomería" },
                { id: 37, codigo: "TAL-033", name: "Nivel de Mano 24\"", stock: 18, price: "$14.00", category: "Herramientas" },
                { id: 38, codigo: "CEM-034", name: "Piedra Chancada (Metro)", stock: 15, price: "$35.00", category: "Construcción" },
                { id: 39, codigo: "HIE-035", name: "Plancha de Zinc Corrugado", stock: 60, price: "$16.50", category: "Metales" },
                { id: 40, codigo: "PINT-036", name: "Masilla para Paredes", stock: 33, price: "$11.00", category: "Acabados" },
                { id: 41, codigo: "TUB-037", name: "Sifón Flexible PVC", stock: 55, price: "$3.20", category: "Plomería" },
                { id: 42, codigo: "TAL-038", name: "Destornillador Phillips", stock: 150, price: "$4.00", category: "Herramientas" },
                { id: 43, codigo: "CEM-039", name: "Pegamento Extra Fuerte", stock: 70, price: "$9.50", category: "Construcción" },
                { id: 44, codigo: "HIE-040", name: "Canaleta Galv. 3mt", stock: 40, price: "$22.00", category: "Metales" },
                { id: 45, codigo: "PINT-041", name: "Impermeabilizante Techo", stock: 10, price: "$130.00", category: "Acabados" },
                { id: 46, codigo: "TUB-042", name: "Reducción PVC 3/4 a 1/2", stock: 110, price: "$0.85", category: "Plomería" },
                { id: 47, codigo: "TAL-043", name: "Flexómetro 5mt", stock: 90, price: "$6.50", category: "Herramientas" },
                { id: 48, codigo: "CEM-044", name: "Fragua Gris 1kg", stock: 100, price: "$2.50", category: "Construcción" },
                { id: 49, codigo: "HIE-045", name: "Malla Gallinero 1mt", stock: 30, price: "$55.00", category: "Metales" },
                { id: 50, codigo: "PINT-046", name: "Espátula de Acero 4\"", stock: 65, price: "$3.75", category: "Acabados" },
                { id: 51, codigo: "TUB-047", name: "Válvula Check 1\"", stock: 12, price: "$24.50", category: "Plomería" },
                { id: 52, codigo: "TAL-048", name: "Llave Inglesa 10\"", stock: 40, price: "$15.00", category: "Herramientas" },
                { id: 53, codigo: "CEM-049", name: "Adobe Decorativo", stock: 250, price: "$2.20", category: "Construcción" },
                { id: 54, codigo: "HIE-050", name: "Soldadura 6011 (Lote)", stock: 20, price: "$48.00", category: "Metales" },
                { id: 55, codigo: "PINT-051", name: "Sellador de Muros 1Gl", stock: 45, price: "$19.00", category: "Acabados" },
                { id: 56, codigo: "TUB-052", name: "Abrazadera Metal 1\"", stock: 300, price: "$0.35", category: "Plomería" },
                { id: 57, codigo: "TAL-053", name: "Alicate de Corte 7\"", stock: 50, price: "$11.00", category: "Herramientas" },
                { id: 58, codigo: "CEM-054", name: "Teja de Arcilla", stock: 500, price: "$1.40", category: "Construcción" },
                { id: 59, codigo: "HIE-055", name: "Pletina 1/2x1/8", stock: 75, price: "$9.00", category: "Metales" },
                { id: 60, codigo: "PINT-056", name: "Tinte para Madera Roble", stock: 15, price: "$8.50", category: "Acabados" },
                { id: 61, codigo: "TUB-057", name: "Flotador para Tanque", stock: 28, price: "$12.00", category: "Plomería" },
                { id: 62, codigo: "TAL-058", name: "Pistola de Silicón", stock: 42, price: "$7.00", category: "Herramientas" },
                { id: 63, codigo: "CEM-059", name: "Curador de Concreto", stock: 20, price: "$35.00", category: "Construcción" },
                { id: 64, codigo: "HIE-060", name: "Clavo de Acero 1\"", stock: 400, price: "$0.08", category: "Metales" },
                { id: 65, codigo: "PINT-061", name: "Bandeja para Pintura", stock: 80, price: "$4.20", category: "Acabados" },
                { id: 66, codigo: "TUB-062", name: "Tubo CPVC Caliente 1/2", stock: 140, price: "$5.80", category: "Plomería" },
                { id: 67, codigo: "TAL-063", name: "Gafas de Seguridad", stock: 60, price: "$3.50", category: "Herramientas" },
                { id: 68, codigo: "CEM-064", name: "Mortero Listo 40kg", stock: 55, price: "$10.00", category: "Construcción" },
                { id: 69, codigo: "HIE-065", name: "Bisagra de Fierro 3x3", stock: 120, price: "$2.10", category: "Metales" },
                { id: 70, codigo: "PINT-066", name: "Lija de Agua #180", stock: 500, price: "$0.60", category: "Acabados" },
                { id: 71, codigo: "TUB-067", name: "Terminal Macho PVC 1/2", stock: 180, price: "$0.40", category: "Plomería" },
                { id: 72, codigo: "TAL-068", name: "Serrucho de Mano 20\"", stock: 25, price: "$13.50", category: "Herramientas" },
                { id: 73, codigo: "CEM-069", name: "Bloqueta de Ventilación", stock: 100, price: "$4.50", category: "Construcción" },
                { id: 74, codigo: "HIE-070", name: "Tornillo Drywall 1 1/4", stock: 1000, price: "$0.03", category: "Metales" },
                { id: 75, codigo: "PINT-071", name: "Removedor de Pintura", stock: 14, price: "$12.00", category: "Acabados" },
                { id: 76, codigo: "TUB-072", name: "Tubo de Abasto Lavabo", stock: 60, price: "$5.50", category: "Plomería" },
                { id: 77, codigo: "TAL-073", name: "Arco de Sierra", stock: 35, price: "$8.00", category: "Herramientas" },
                { id: 78, codigo: "CEM-074", name: "Capa Base de Pavimento", stock: 30, price: "$28.00", category: "Construcción" },
                { id: 79, codigo: "HIE-075", name: "Cable de Acero 1/8", stock: 200, price: "$1.50", category: "Metales" },
                { id: 80, codigo: "PINT-076", name: "Pintura Spray Cromo", stock: 40, price: "$7.50", category: "Acabados" },
                { id: 81, codigo: "TUB-077", name: "Yee PVC 2\"", stock: 45, price: "$3.50", category: "Plomería" },
                { id: 82, codigo: "TAL-078", name: "Cincel de Punta 10\"", stock: 30, price: "$9.00", category: "Herramientas" },
                { id: 83, codigo: "CEM-079", name: "Microcemento Blanco", stock: 12, price: "$65.00", category: "Construcción" },
                { id: 84, codigo: "HIE-080", name: "Malla Mosquitera Gris", stock: 50, price: "$14.00", category: "Metales" },
                { id: 85, codigo: "PINT-081", name: "Brocha para Techos 5\"", stock: 30, price: "$8.50", category: "Acabados" },
                { id: 86, codigo: "TUB-082", name: "Tapón Hembra PVC 1/2", stock: 250, price: "$0.30", category: "Plomería" },
                { id: 87, codigo: "TAL-083", name: "Escuadra Metálica 12\"", stock: 40, price: "$6.00", category: "Herramientas" },
                { id: 88, codigo: "CEM-084", name: "Fibra de Vidrio Panel", stock: 18, price: "$45.00", category: "Construcción" },
                { id: 89, codigo: "HIE-085", name: "Aldaba de Seguridad", stock: 65, price: "$4.50", category: "Metales" },
                { id: 90, codigo: "PINT-086", name: "Mezclador de Pintura", stock: 100, price: "$1.50", category: "Acabados" },
                { id: 91, codigo: "TUB-087", name: "Trampa P para Desagüe", stock: 35, price: "$6.80", category: "Plomería" },
                { id: 92, codigo: "TAL-088", name: "Maza de Goma Negra", stock: 22, price: "$10.50", category: "Herramientas" },
                { id: 93, codigo: "CEM-089", name: "Baldosa Cerámica 30x30", stock: 300, price: "$1.85", category: "Construcción" },
                { id: 94, codigo: "HIE-090", name: "Grapa para Cercos", stock: 1000, price: "$0.02", category: "Metales" },
                { id: 95, codigo: "PINT-091", name: "Anticorrosivo Rojo Gl", stock: 24, price: "$26.00", category: "Acabados" },
                { id: 96, codigo: "TUB-092", name: "Reducción Bushing 1 a 1/2", stock: 95, price: "$1.20", category: "Plomería" },
                { id: 97, codigo: "TAL-093", name: "Juego de Llaves Allen", stock: 38, price: "$14.00", category: "Herramientas" },
                { id: 98, codigo: "CEM-094", name: "Junquillo de Plástico", stock: 150, price: "$0.90", category: "Construcción" },
                { id: 99, codigo: "HIE-095", name: "Cadena de Eslabón #3", stock: 80, price: "$4.80", category: "Metales" },
                { id: 100, codigo: "TAL-096", name: "Atornillador Eléctrico", stock: 12, price: "$55.00", category: "Herramientas" }
            ]
        ];

        const saved = localStorage.getItem('inventory');
        this.inventory = saved ? JSON.parse(saved) : defaultInventory;
    },

    saveData: function () {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
    },

    renderInventory: function () {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;

        let filtered = this.inventory;

        // Aplicar Filtro de Categoría
        if (this.currentFilter !== 'todos') {
            filtered = filtered.filter(item => item.category.toLowerCase() === this.currentFilter.toLowerCase());
        }

        // Aplicar Búsqueda
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
                    <td><a href="#" class="order-id" data-action="details">${item.codigo}</a></td>
                    <td>${item.name}</td>
                    <td><span class="badge badge-${categoryClass}">${item.category}</span></td>
                    <td><span class="stock-pill ${stockStatus}">${item.stock}</span></td>
                    <td><strong>${item.price}</strong></td>
                    <td class="actions-cell">
                        <button class="action-btn edit-btn" data-action="edit" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete-btn" data-action="delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        this.updateStats();
    },

    // MEJORA: Delegación de eventos (un solo listener para toda la tabla)
    setupTableDelegation: function () {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;

        tbody.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const id = parseInt(target.closest('tr').dataset.id);
            const item = this.inventory.find(i => i.id === id);

            if (action === 'edit') this.openProductModal(item);
            if (action === 'delete') this.deleteProduct(id);
            if (action === 'details') {
                e.preventDefault();
                this.showProductDetails(item);
            }
        });
    },

    updateStats: function () {
        const elements = {
            totalProducts: document.getElementById('totalProducts'),
            totalStock: document.getElementById('totalStock'),
            lowStock: document.getElementById('lowStock'),
            categories: document.getElementById('categories')
        };

        if (elements.totalProducts) elements.totalProducts.textContent = this.inventory.length;
        if (elements.totalStock) elements.totalStock.textContent = this.inventory.reduce((s, i) => s + i.stock, 0);
        if (elements.lowStock) elements.lowStock.textContent = this.inventory.filter(i => i.stock < 20).length;
        if (elements.categories) elements.categories.textContent = new Set(this.inventory.map(i => i.category)).size;
    },

    deleteProduct: function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) {
            this.inventory = this.inventory.filter(item => item.id !== id);
            this.saveData();
            this.renderInventory();
            this.showNotification('Producto eliminado correctamente', 'danger');
        }
    },

    openProductModal: function (product = null) {
        this.closeProductModal(); // Limpiar si hay uno abierto

        const modalHTML = `
            <div class="modal-overlay active" id="productModal">
                <div class="modal card-shadow">
                    <div class="modal-header">
                        <h2>${product ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
                        <button class="modal-close" onclick="window.inventory.closeProductModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm">
                            <div class="form-grid">
                                <div class="form-group"><label>Código</label><input type="text" id="codigo" value="${product ? product.codigo : ''}" placeholder="Ej: CEM-001" required></div>
                                <div class="form-group"><label>Nombre</label><input type="text" id="name" value="${product ? product.name : ''}" placeholder="Nombre del artículo" required></div>
                                <div class="form-group"><label>Categoría</label>
                                    <select id="category" required>
                                        <option value="" disabled ${!product ? 'selected' : ''}>Seleccionar categoría</option>
                                        ${['Construcción', 'Metales', 'Acabados', 'Plomería', 'Herramientas'].map(cat =>
            `<option value="${cat}" ${product?.category === cat ? 'selected' : ''}>${cat}</option>`
        ).join('')}
                                    </select>
                                </div>
                                <div class="form-group"><label>Stock Inicial</label><input type="number" id="stock" min="0" value="${product ? product.stock : 0}" required></div>
                                <div class="form-group"><label>Precio de Venta</label><input type="text" id="price" placeholder="$0.00" value="${product ? product.price : ''}" required></div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-cancel" onclick="window.inventory.closeProductModal()">Cancelar</button>
                                <button type="submit" class="btn-save">${product ? 'Guardar Cambios' : 'Crear Producto'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('productForm').addEventListener('submit', (e) => this.saveProduct(e, product));
    },

    saveProduct: function (e, product) {
        e.preventDefault();

        // Mantener la extracción del precio tal cual la tenías
        let rawPrice = document.getElementById('price').value.trim();
        if (!rawPrice.startsWith('$')) rawPrice = '$' + rawPrice;

        const productData = {
            codigo: document.getElementById('codigo').value.trim(),
            name: document.getElementById('name').value.trim(),
            category: document.getElementById('category').value,
            stock: parseInt(document.getElementById('stock').value) || 0,
            price: rawPrice
        };

        if (product) {
            const index = this.inventory.findIndex(i => i.id === product.id);
            if (index !== -1) {
                this.inventory[index] = { ...this.inventory[index], ...productData };
                this.showNotification('Actualización exitosa');
            }
        } else {
            const newId = this.inventory.length > 0 ? Math.max(...this.inventory.map(i => i.id)) + 1 : 1;
            this.inventory.push({ id: newId, ...productData });
            this.showNotification('Producto añadido al inventario', 'success');
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
                        <h2>Detalles Técnicos</h2>
                        <button class="modal-close" onclick="document.getElementById('detailsModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-grid">
                            <div class="detail-item"><span>Código:</span> <strong>${product.codigo}</strong></div>
                            <div class="detail-item"><span>Nombre:</span> <strong>${product.name}</strong></div>
                            <div class="detail-item"><span>Categoría:</span> <strong>${product.category}</strong></div>
                            <div class="detail-item"><span>Stock disponible:</span> <strong class="${product.stock < 20 ? 'text-danger' : ''}">${product.stock} unidades</strong></div>
                            <div class="detail-item"><span>Precio Unitario:</span> <strong>${product.price}</strong></div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },

    setupEvents: function () {
        // Delegación de eventos de la tabla
        this.setupTableDelegation();

        // Filtros por pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.renderInventory();
            });
        });

        // Búsqueda optimizada (Debounce ligero)
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

    showNotification: function (message, type = 'info') {
        const container = document.getElementById('notification-container') || this.createNotificationContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    createNotificationContainer: function () {
        const container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
        return container;
    }
};

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', () => window.inventory.init());