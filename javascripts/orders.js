// orders.js - Gestión de Pedidos con Acciones (Ver, Editar, Eliminar)

window.orders = {
    ordersData: [
        { id: "ORD-2024-001", client: "Juan García", total: "$1,250.00", status: "Pendiente", date: "2024-01-15", items: 5 },
        { id: "ORD-2024-002", client: "María López", total: "$2,500.00", status: "Enviado", date: "2024-01-14", items: 8 },
        { id: "ORD-2024-003", client: "Carlos Ruiz", total: "$875.50", status: "Entregado", date: "2024-01-13", items: 3 },
        { id: "ORD-2024-004", client: "Ana Martínez", total: "$3,100.00", status: "Pendiente", date: "2024-01-12", items: 12 },
        { id: "ORD-2024-005", client: "Pedro González", total: "$450.25", status: "Cancelado", date: "2024-01-11", items: 2 },
        { id: "ORD-2024-006", client: "Laura Sánchez", total: "$5,200.00", status: "Enviado", date: "2024-01-10", items: 15 },
        { id: "ORD-2024-007", client: "Roberto Díaz", total: "$1,800.00", status: "Entregado", date: "2024-01-09", items: 6 },
        { id: "ORD-2024-008", client: "Sofía Torres", total: "$2,100.00", status: "Pendiente", date: "2024-01-08", items: 9 },
        { id: "ORD-2024-009", client: "Miguel Hernández", total: "$950.75", status: "Enviado", date: "2024-01-07", items: 4 },
        { id: "ORD-2024-010", client: "Elena Vargas", total: "$4,300.00", status: "Entregado", date: "2024-01-06", items: 14 },
    ],
    
    currentFilter: 'todos',
    currentSearch: '',
    
    init: function() {
        console.log("Orders: Inicializando");
        this.loadData();
        this.renderOrders();
        this.setupEvents();
    },
    
    loadData: function() {
        const saved = localStorage.getItem('orders');
        this.ordersData = saved ? JSON.parse(saved) : this.ordersData;
    },
    
    saveData: function() {
        localStorage.setItem('orders', JSON.stringify(this.ordersData));
    },
    
    renderOrders: function() {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;
        
        let filtered = this.ordersData;
        
        // Aplicar filtro de estado
        if (this.currentFilter !== 'todos') {
            filtered = filtered.filter(order => order.status === this.currentFilter);
        }
        
        // Aplicar búsqueda
        if (this.currentSearch) {
            const search = this.currentSearch.toLowerCase();
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(search) ||
                order.client.toLowerCase().includes(search)
            );
        }
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No se encontraron pedidos</div></td></tr>`;
            this.updateStats();
            return;
        }
        
        tbody.innerHTML = filtered.map(order => {
            const statusClass = {
                'Pendiente': 'badge-warning',
                'Enviado': 'badge-info',
                'Entregado': 'badge-success',
                'Cancelado': 'badge-danger'
            }[order.status] || 'badge-secondary';
            
            return `
                <tr data-id="${order.id}">
                    <td><strong>${order.id}</strong></td>
                    <td>${order.client}</td>
                    <td>${order.total}</td>
                    <td><span class="badge ${statusClass}">${order.status}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn view-btn" data-action="view" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" data-action="edit" title="Editar">
                            <i class="fas fa-pen-to-square"></i>
                        </button>
                        <button class="action-btn delete-btn" data-action="delete" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.setupTableDelegation();
        this.updateStats();
    },
    
    setupTableDelegation: function() {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;
        
        tbody.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            
            const action = target.dataset.action;
            const orderId = target.closest('tr').dataset.id;
            const order = this.ordersData.find(o => o.id === orderId);
            
            if (!order) return;
            
            if (action === 'view') this.showOrderDetails(order);
            if (action === 'edit') this.openOrderModal(order);
            if (action === 'delete') this.deleteOrder(orderId);
        });
    },
    
    // 👁️ VER DETALLES
    showOrderDetails: function(order) {
        const detailsHTML = `
            <div class="modal-overlay active" id="orderDetailsModal" onclick="if(event.target === this) this.remove()">
                <div class="modal detail-card">
                    <div class="modal-header">
                        <h2><i class="fas fa-box"></i> Detalles del Pedido</h2>
                        <button class="modal-close" onclick="document.getElementById('orderDetailsModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span><i class="fas fa-hashtag"></i> ID Pedido:</span>
                                <strong>${order.id}</strong>
                            </div>
                            <div class="detail-item">
                                <span><i class="fas fa-user"></i> Cliente:</span>
                                <strong>${order.client}</strong>
                            </div>
                            <div class="detail-item">
                                <span><i class="fas fa-calendar"></i> Fecha:</span>
                                <strong>${order.date}</strong>
                            </div>
                            <div class="detail-item">
                                <span><i class="fas fa-boxes"></i> Artículos:</span>
                                <strong>${order.items} productos</strong>
                            </div>
                            <div class="detail-item">
                                <span><i class="fas fa-dollar-sign"></i> Total:</span>
                                <strong style="color: var(--accent-color)">${order.total}</strong>
                            </div>
                            <div class="detail-item">
                                <span><i class="fas fa-tag"></i> Estado:</span>
                                <strong><span class="badge ${this.getStatusClass(order.status)}">${order.status}</span></strong>
                            </div>
                        </div>
                        <hr style="margin: 20px 0; border: 1px solid var(--border-color);">
                        <div style="background: var(--bg-secondary); padding: 15px; border-radius: 8px;">
                            <h4><i class="fas fa-info-circle"></i> Notas del Pedido</h4>
                            <p style="color: var(--text-muted); margin-top: 10px;">Este pedido contiene ${order.items} artículos clasificados en distintas categorías. 
                            El estado actual es <strong>${order.status.toLowerCase()}</strong> desde la fecha registrada.</p>
                        </div>
                    </div>
                </div>
            </div>`;
        
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },
    
    // ✏️ EDITAR
    openOrderModal: function(order = null) {
        this.closeOrderModal();
        
        const statusOptions = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado'];
        
        const modalHTML = `
            <div class="modal-overlay active" id="orderModal">
                <div class="modal card-shadow">
                    <div class="modal-header">
                        <h2>${order ? '✏️ Editar Pedido' : '➕ Nuevo Pedido'}</h2>
                        <button class="modal-close" onclick="window.orders.closeOrderModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="orderForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label><i class="fas fa-hashtag"></i> ID Pedido</label>
                                    <input type="text" id="orderId" value="${order ? order.id : ''}" placeholder="ORD-2024-XXX" required ${order ? 'readonly' : ''}>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-user"></i> Cliente</label>
                                    <input type="text" id="orderClient" value="${order ? order.client : ''}" placeholder="Nombre del cliente" required>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-calendar"></i> Fecha</label>
                                    <input type="date" id="orderDate" value="${order ? order.date : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-boxes"></i> Cantidad de Artículos</label>
                                    <input type="number" id="orderItems" min="1" value="${order ? order.items : 1}" required>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-dollar-sign"></i> Total</label>
                                    <input type="text" id="orderTotal" placeholder="$0.00" value="${order ? order.total : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-tag"></i> Estado</label>
                                    <select id="orderStatus" required>
                                        <option value="">Seleccionar estado</option>
                                        ${statusOptions.map(status => 
                                            `<option value="${status}" ${order?.status === status ? 'selected' : ''}>${status}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-cancel" onclick="window.orders.closeOrderModal()">Cancelar</button>
                                <button type="submit" class="btn-save">${order ? '💾 Guardar Cambios' : '✅ Crear Pedido'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('orderForm').addEventListener('submit', (e) => this.saveOrder(e, order));
    },
    
    saveOrder: function(e, order) {
        e.preventDefault();
        
        let rawTotal = document.getElementById('orderTotal').value.trim();
        if (!rawTotal.startsWith('$')) rawTotal = '$' + rawTotal;
        
        const orderData = {
            id: document.getElementById('orderId').value.trim(),
            client: document.getElementById('orderClient').value.trim(),
            date: document.getElementById('orderDate').value,
            items: parseInt(document.getElementById('orderItems').value) || 1,
            total: rawTotal,
            status: document.getElementById('orderStatus').value
        };
        
        if (order) {
            const index = this.ordersData.findIndex(o => o.id === order.id);
            if (index !== -1) {
                this.ordersData[index] = orderData;
                this.showNotification('Pedido actualizado correctamente', 'success');
            }
        } else {
            this.ordersData.push(orderData);
            this.showNotification('Pedido creado correctamente', 'success');
        }
        
        this.saveData();
        this.closeOrderModal();
        this.renderOrders();
    },
    
    closeOrderModal: function() {
        const modal = document.getElementById('orderModal');
        if (modal) modal.remove();
    },
    
    // 🗑️ ELIMINAR
    deleteOrder: function(orderId) {
        if (confirm('⚠️ ¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
            this.ordersData = this.ordersData.filter(o => o.id !== orderId);
            this.saveData();
            this.renderOrders();
            this.showNotification('Pedido eliminado correctamente', 'danger');
        }
    },
    
    // UTILIDADES
    getStatusClass: function(status) {
        const map = {
            'Pendiente': 'badge-warning',
            'Enviado': 'badge-info',
            'Entregado': 'badge-success',
            'Cancelado': 'badge-danger'
        };
        return map[status] || 'badge-secondary';
    },
    
    updateStats: function() {
        const stats = {
            totalOrders: this.ordersData.length,
            pendingOrders: this.ordersData.filter(o => o.status === 'Pendiente').length,
            sentOrders: this.ordersData.filter(o => o.status === 'Enviado').length,
            deliveredOrders: this.ordersData.filter(o => o.status === 'Entregado').length,
            cancelledOrders: this.ordersData.filter(o => o.status === 'Cancelado').length,
            totalValue: this.calculateTotal()
        };
        
        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('pendingOrders').textContent = stats.pendingOrders;
        document.getElementById('sentOrders').textContent = stats.sentOrders;
        document.getElementById('deliveredOrders').textContent = stats.deliveredOrders;
        document.getElementById('cancelledOrders').textContent = stats.cancelledOrders;
        document.getElementById('totalValue').textContent = stats.totalValue;
    },
    
    calculateTotal: function() {
        return this.ordersData.reduce((sum, order) => {
            const value = parseFloat(order.total.replace(/[$,]/g, ''));
            return sum + (isNaN(value) ? 0 : value);
        }, 0).toLocaleString('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
    },
    
    setupEvents: function() {
        // Filtros por pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.renderOrders();
            });
        });
        
        // Búsqueda
        const searchInput = document.getElementById('searchOrders');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.renderOrders();
            });
        }
        
        // Botón Nuevo Pedido
        const newBtn = document.getElementById('newOrderBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.openOrderModal());
        }
    },
    
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
};