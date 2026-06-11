// orders.js - Gestión de pedidos con datos reales desde localStorage
window.orders = {
    ordersData: [],
    currentFilter: 'todos',
    currentSearch: '',

    init: function() {
        console.log("Orders: Inicializando");
        this.loadData();
        this.renderOrders();
        this.setupEvents();
    },

    loadData: function() {
        const role = localStorage.getItem('userRole');
        let rawOrders = [];
        if (role === 'client') {
            rawOrders = JSON.parse(localStorage.getItem('pedidos_comprador') || '[]');
        } else {
            rawOrders = JSON.parse(localStorage.getItem('pedidos_proveedor') || '[]');
        }
        // Asegurar que totalneto sea número y agregar campo 'total' para mostrar
        this.ordersData = rawOrders.map(order => ({
            ...order,
            totalneto: typeof order.totalneto === 'number' ? order.totalneto : parseFloat(order.totalneto) || 0,
            total: `$${ (typeof order.totalneto === 'number' ? order.totalneto : parseFloat(order.totalneto) || 0).toFixed(2) }`,
            estado_actual: order.estado_actual || 'Pendiente'
        }));
    },

    renderOrders: function() {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;

        let filtered = [...this.ordersData];
        if (this.currentFilter !== 'todos') {
            filtered = filtered.filter(order => order.estado_actual === this.currentFilter);
        }
        if (this.currentSearch) {
            const search = this.currentSearch.toLowerCase();
            filtered = filtered.filter(order =>
                order.id.toString().includes(search) ||
                (order.restaurante_nombre || order.proveedor_nombre || '').toLowerCase().includes(search)
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No se encontraron pedidos</div></td></tr>`;
            this.updateStats();
            return;
        }

        tbody.innerHTML = filtered.map(order => {
            const statusClass = this.getStatusClass(order.estado_actual);
            const clientName = order.restaurante_nombre || order.proveedor_nombre || 'Cliente';
            return `
                <tr data-id="${order.id}">
                    <td><strong>#${order.id}</strong></td>
                    <td>${this.escapeHtml(clientName)}</td>
                    <td>${order.total}</td>
                    <td><span class="badge ${statusClass}">${order.estado_actual}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn view-btn" data-action="view" title="Ver detalles"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-action="edit" title="Editar estado"><i class="fas fa-pen-to-square"></i></button>
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
        // Remover listener anterior para evitar duplicados
        const newTbody = tbody.cloneNode(true);
        tbody.parentNode.replaceChild(newTbody, tbody);
        newTbody.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            const action = target.dataset.action;
            const row = target.closest('tr');
            const orderId = parseInt(row.dataset.id);
            const order = this.ordersData.find(o => o.id === orderId);
            if (!order) return;
            if (action === 'view') this.showOrderDetails(order);
            if (action === 'edit') this.openOrderStatusModal(order);
        });
        // Re-asignar referencia
        document.getElementById('orders-table-body')?.parentNode.replaceChild(newTbody, document.getElementById('orders-table-body'));
        // Actualizar variable global (opcional)
        window.ordersTableBody = newTbody;
    },

    showOrderDetails: function(order) {
        const detallesHtml = (order.detalles || []).map(d => `
            <div class="detail-item">
                <span>${this.escapeHtml(d.producto_nombre || 'Producto')}</span>
                <strong>${d.cantidad} x $${parseFloat(d.preciounitario).toFixed(2)}</strong>
            </div>
        `).join('') || '<p>Sin detalles</p>';

        const modalHtml = `
            <div class="modal-overlay active" id="orderDetailsModal" onclick="if(event.target===this)this.remove()">
                <div class="modal detail-card">
                    <div class="modal-header">
                        <h2><i class="fas fa-box"></i> Detalles del Pedido #${order.id}</h2>
                        <button class="modal-close" onclick="document.getElementById('orderDetailsModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-grid">
                            <div class="detail-item"><span>Cliente:</span><strong>${this.escapeHtml(order.restaurante_nombre || order.proveedor_nombre)}</strong></div>
                            <div class="detail-item"><span>Fecha:</span><strong>${new Date(order.fechapedido).toLocaleDateString()}</strong></div>
                            <div class="detail-item"><span>Total:</span><strong>${order.total}</strong></div>
                            <div class="detail-item"><span>Estado:</span><strong><span class="badge ${this.getStatusClass(order.estado_actual)}">${order.estado_actual}</span></strong></div>
                            <div class="detail-item"><span>Subtotal:</span><strong>$${parseFloat(order.subtotal).toFixed(2)}</strong></div>
                            <div class="detail-item"><span>Impuesto:</span><strong>$${parseFloat(order.impuesto).toFixed(2)}</strong></div>
                        </div>
                        <hr>
                        <h4>Productos</h4>
                        <div class="detail-grid">${detallesHtml}</div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    openOrderStatusModal: function(order) {
        this.closeOrderModal();
        const statusOptions = ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'];
        const modalHtml = `
            <div class="modal-overlay active" id="orderModal">
                <div class="modal card-shadow">
                    <div class="modal-header">
                        <h2><i class="fas fa-edit"></i> Cambiar estado del pedido #${order.id}</h2>
                        <button class="modal-close" onclick="window.orders.closeOrderModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="orderStatusForm">
                            <div class="form-group">
                                <label>Nuevo estado</label>
                                <select id="newOrderStatus" class="form-control">
                                    ${statusOptions.map(s => `<option value="${s}" ${order.estado_actual === s ? 'selected' : ''}>${s}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-cancel" onclick="window.orders.closeOrderModal()">Cancelar</button>
                                <button type="submit" class="btn-save">Guardar cambio</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('orderStatusForm').addEventListener('submit', (e) => this.updateOrderStatus(e, order));
    },

    updateOrderStatus: async function(e, order) {
        e.preventDefault();
        const newStatus = document.getElementById('newOrderStatus').value;
        // Aquí deberías llamar a la API para actualizar el estado en el backend
        // Ejemplo: await api.updateOrderStatus(order.id, { estado_id: id_del_estado });
        // Por ahora, solo actualizamos localmente y mostramos mensaje
        this.showNotification(`Estado del pedido #${order.id} cambiado a "${newStatus}" (simulado)`, 'success');
        this.closeOrderModal();
        // Si quisieras recargar datos del backend, llamar a api.login de nuevo o a un endpoint de refresco
        // window.api.login(localStorage.getItem('userEmail'), '****').then(() => this.loadData());
    },

    closeOrderModal: function() {
        const modal = document.getElementById('orderModal');
        if (modal) modal.remove();
    },

    getStatusClass: function(status) {
        const map = {
            'Pendiente': 'badge-warning',
            'Confirmado': 'badge-info',
            'Enviado': 'badge-primary',
            'Entregado': 'badge-success',
            'Cancelado': 'badge-danger'
        };
        return map[status] || 'badge-secondary';
    },

    updateStats: function() {
        const totalOrders = this.ordersData.length;
        const totalValue = this.ordersData.reduce((sum, o) => sum + (o.totalneto || 0), 0);
        const pending = this.ordersData.filter(o => o.estado_actual === 'Pendiente').length;
        const sent = this.ordersData.filter(o => o.estado_actual === 'Enviado').length;
        const delivered = this.ordersData.filter(o => o.estado_actual === 'Entregado').length;
        const cancelled = this.ordersData.filter(o => o.estado_actual === 'Cancelado').length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('pendingOrders').textContent = pending;
        document.getElementById('sentOrders').textContent = sent;
        document.getElementById('deliveredOrders').textContent = delivered;
        document.getElementById('cancelledOrders').textContent = cancelled;
        document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
    },

    setupEvents: function() {
        const tabs = document.querySelectorAll('#ordersTabContainer .tab-btn');
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.renderOrders();
            });
        });
        const searchInput = document.getElementById('searchOrders');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.renderOrders();
            });
        }
    },

    showNotification: function(message, type) {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.innerText = message;
            toast.style.display = 'flex';
            toast.style.background = type === 'success' ? '#10b981' : '#3b82f6';
            setTimeout(() => toast.style.display = 'none', 3000);
        } else alert(message);
    },

    escapeHtml: function(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
};