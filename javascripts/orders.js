// orders.js - Gestión de pedidos conectado a la API real
window.orders = {
    orders: [],
    currentFilter: 'all',
    currentSearch: '',
    userRole: 'client',
    _boundStatusChange: null, 
    _boundViewClick: null,

    init: function () {
        console.log("📋 Orders: Inicializando");
        this.userRole = localStorage.getItem('userRole') === 'provider' ? 'provider' : 'client';
        this.loadOrders();
        this.setupEvents();
        this.renderOrders();
    },

    // =========================================================
    // CARGA DESDE localStorage (ya populado por api.login/refreshMyData)
    // =========================================================
    loadOrders: function () {
        const key = this.userRole === 'client' ? 'pedidos_comprador' : 'pedidos_proveedor';
        try {
            const stored = localStorage.getItem(key);
            this.orders = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('❌ Error al parsear pedidos:', e);
            this.orders = [];
        }
        console.log(`📦 Pedidos cargados (${this.userRole}):`, this.orders.length);
    },

    // =========================================================
    // RENDER PRINCIPAL
    // =========================================================
    renderOrders: function () {
        const tbody = document.getElementById('ordersTableBody')
            || document.getElementById('orders-table-body');
        if (!tbody) {
            console.warn("⚠️ No se encontró tbody de pedidos");
            return;
        }
        this._renderInto(tbody);
    },

    _renderInto: function (tbody) {
        const filtered = this.filterOrders();

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-inbox" style="font-size:2rem;opacity:.4;display:block;margin-bottom:.5rem"></i>
                        No hay pedidos que coincidan
                    </div>
                </td></tr>`;
            this.updateStats();
            return;
        }

        tbody.innerHTML = filtered.map(order => {
            const estado = order.estado_actual || 'Pendiente';
            const badgeClass = this._getBadgeClass(estado);
            const fecha = order.fechapedido
                ? new Date(order.fechapedido).toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'N/A';
            const monto = '$' + parseFloat(order.totalneto || 0).toFixed(2);
            const contraparte = this.userRole === 'client'
                ? (order.proveedor_nombre || 'Proveedor')
                : (order.restaurante_nombre || 'Cliente');

            const statusSelect = this.userRole === 'provider'
                ? `<select class="status-select" data-order-id="${order.id}">
                       ${this._getEstadoOptions(estado)}
                   </select>`
                : '';

            return `
                <tr data-order-id="${order.id}">
                    <td><strong>#${order.id}</strong></td>
                    <td>${fecha}</td>
                    <td>${contraparte}</td>
                    <td>${monto}</td>
                    <td><span class="badge ${badgeClass}">${estado}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn view-btn" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${statusSelect}
                    </td>
                </tr>`;
        }).join('');

        // Reasignar eventos con delegación en el tbody para evitar duplicados
        tbody.removeEventListener('click', this._boundViewClick);
        this._boundViewClick = (e) => {
            const btn = e.target.closest('.view-btn');
            if (!btn) return;
            const orderId = parseInt(btn.closest('tr').dataset.orderId);
            this.showOrderDetails(orderId);
        };
        tbody.addEventListener('click', this._boundViewClick);

        if (this.userRole === 'provider') {
            tbody.removeEventListener('change', this._boundStatusChange);
            this._boundStatusChange = (e) => {
                if (!e.target.classList.contains('status-select')) return;
                const orderId = parseInt(e.target.dataset.orderId);
                const newStatus = e.target.value;
                this.changeOrderStatus(orderId, newStatus, e.target);
            };
            tbody.addEventListener('change', this._boundStatusChange);
        }

        this.updateStats();
    },

    // =========================================================
    // HELPERS DE ESTADO
    // =========================================================
    _getBadgeClass: function (estado) {
        const map = {
            'Pendiente':  'badge-warning',
            'Confirmado': 'badge-info',
            'Enviado':    'badge-primary',
            'Entregado':  'badge-success',
            'Cancelado':  'badge-danger',
            'Completado': 'badge-success',
        };
        return map[estado] || 'badge-secondary';
    },

    _getEstadoOptions: function (currentEstado) {
        const catalogos = JSON.parse(localStorage.getItem('catalogos') || '{}');
        const estados = catalogos.estados_pedido || [];
        const fallback = ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'];
        const lista = estados.length > 0
            ? estados.map(e => e.estadonombre || e.nombre || 'Sin nombre')
            : fallback;
        return lista.map(nombre =>
            `<option value="${nombre}" ${nombre === currentEstado ? 'selected' : ''}>${nombre}</option>`
        ).join('');
    },

    // =========================================================
    // FILTRADO Y BÚSQUEDA
    // =========================================================
    filterOrders: function () {
        let result = [...this.orders];
        if (this.currentFilter !== 'all' && this.currentFilter !== 'todos') {
            result = result.filter(o => (o.estado_actual || 'Pendiente') === this.currentFilter);
        }
        if (this.currentSearch) {
            const term = this.currentSearch.toLowerCase();
            result = result.filter(o => {
                const nombre = this.userRole === 'client'
                    ? (o.proveedor_nombre || '')
                    : (o.restaurante_nombre || '');
                return String(o.id).includes(term) || nombre.toLowerCase().includes(term);
            });
        }
        return result;
    },

    // =========================================================
    // CAMBIAR ESTADO — llama a la API real
    // =========================================================
    changeOrderStatus: async function (orderId, newStatus, selectEl) {
        const catalogos = JSON.parse(localStorage.getItem('catalogos') || '{}');
        const estados = catalogos.estados_pedido || [];

        const estadoObj = estados.find(e =>
            e.estadonombre && e.estadonombre.toLowerCase() === newStatus.toLowerCase()
        );
        if (!estadoObj?.id) {
            this.showToast(`Estado "${newStatus}" no encontrado en catálogo`, 'error');
            return;
        }

        // Deshabilitar select mientras se procesa
        if (selectEl) selectEl.disabled = true;

        try {
            const result = await api.updateOrderStatus(
                orderId, estadoObj.id, `Cambio de estado a ${newStatus}`
            );
            if (result.success) {
                // Actualizar localStorage localmente sin llamada extra al servidor
                const key = 'pedidos_proveedor';
                const pedidos = JSON.parse(localStorage.getItem(key) || '[]');
                const idx = pedidos.findIndex(p => p.id === orderId);
                if (idx !== -1) {
                    pedidos[idx].estado_actual = newStatus;
                    localStorage.setItem(key, JSON.stringify(pedidos));
                }
                this.loadOrders();
                this.renderOrders();
                this.showToast(`Pedido #${orderId} → ${newStatus}`, 'success');
            } else {
                this.showToast(result.error || 'Error al actualizar estado', 'error');
                // Revertir el select al valor anterior
                if (selectEl) {
                    const order = this.orders.find(o => o.id === orderId);
                    if (order) selectEl.value = order.estado_actual || 'Pendiente';
                }
            }
        } catch (err) {
            console.error(err);
            this.showToast('Error de conexión', 'error');
        } finally {
            if (selectEl) selectEl.disabled = false;
        }
    },

    // =========================================================
    // REFRESCAR DESDE EL SERVIDOR
    // =========================================================
    refreshData: async function () {
        this.showToast('Actualizando pedidos...', 'info');
        const ok = await api.refreshMyData();
        if (ok) {
            this.loadOrders();
            this.renderOrders();
            this.showToast('Pedidos actualizados', 'success');
        } else {
            this.showToast('Error al refrescar datos', 'error');
        }
    },

    // =========================================================
    // MODAL DE DETALLES
    // =========================================================
    showOrderDetails: function (orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) { this.showToast('Pedido no encontrado', 'error'); return; }

        // Eliminar modal anterior si existe
        document.getElementById('orderDetailModal')?.remove();

        const detalles = order.detalles || [];
        const itemsHtml = detalles.length > 0
            ? detalles.map(d => {
                // El serializer devuelve preciounitario (sin guión bajo)
                const precio = parseFloat(d.preciounitario || d.precio_unitario || 0);
                const cant = parseFloat(d.cantidad || 0);
                const desc = parseFloat(d.descuentoaplicado || 0);
                const subtotal = precio * cant * (1 - desc / 100);
                return `
                    <tr>
                        <td>${d.producto_nombre || 'Producto'}</td>
                        <td>${cant}</td>
                        <td>$${precio.toFixed(2)}</td>
                        <td>${desc > 0 ? desc + '%' : '—'}</td>
                        <td>$${subtotal.toFixed(2)}</td>
                    </tr>`;
            }).join('')
            : '<tr><td colspan="5" style="text-align:center;color:#888">Sin productos registrados</td></tr>';

        const subtotal = parseFloat(order.subtotal || 0);
        const impuesto = parseFloat(order.impuesto || 0);
        const total = parseFloat(order.totalneto || 0);
        const estadoBadge = `<span class="badge ${this._getBadgeClass(order.estado_actual || 'Pendiente')}">${order.estado_actual || 'Pendiente'}</span>`;

        document.body.insertAdjacentHTML('beforeend', `
            <div class="modal-overlay active" id="orderDetailModal"
                 onclick="if(event.target===this)this.remove()">
                <div class="modal detail-card" style="max-width:860px;width:95%">
                    <div class="modal-header">
                        <h2><i class="fas fa-receipt" style="margin-right:.5rem"></i>Pedido #${order.id}</h2>
                        <button class="modal-close" onclick="document.getElementById('orderDetailModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">

                        <div class="detail-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem;margin-bottom:1.25rem">
                            <div><span style="color:var(--text-muted);font-size:.8rem">Fecha</span><br>
                                <strong>${new Date(order.fechapedido).toLocaleString('es-NI')}</strong></div>
                            <div><span style="color:var(--text-muted);font-size:.8rem">Estado</span><br>${estadoBadge}</div>
                            <div><span style="color:var(--text-muted);font-size:.8rem">Proveedor</span><br>
                                <strong>${order.proveedor_nombre || 'N/A'}</strong></div>
                            <div><span style="color:var(--text-muted);font-size:.8rem">Restaurante</span><br>
                                <strong>${order.restaurante_nombre || 'N/A'}</strong></div>
                            <div><span style="color:var(--text-muted);font-size:.8rem">Comentario</span><br>
                                <strong>${order.comentario || '—'}</strong></div>
                        </div>

                        <h3 style="margin-bottom:.75rem">Productos</h3>
                        <div style="overflow-x:auto">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th><th>Cant.</th>
                                        <th>Precio unit.</th><th>Descuento</th><th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>${itemsHtml}</tbody>
                            </table>
                        </div>

                        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.3rem;margin-top:1rem;font-size:.95rem">
                            <div>Subtotal: <strong>$${subtotal.toFixed(2)}</strong></div>
                            <div>Impuesto (15%): <strong>$${impuesto.toFixed(2)}</strong></div>
                            <div style="font-size:1.1rem;color:var(--primary,#3b82f6)">
                                Total: <strong>$${total.toFixed(2)}</strong>
                            </div>
                        </div>

                    </div>
                </div>
            </div>`);
    },

    // =========================================================
    // ESTADÍSTICAS
    // =========================================================
    updateStats: function () {
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };

        const counts = { Pendiente: 0, Confirmado: 0, Enviado: 0, Entregado: 0, Cancelado: 0 };
        let totalMonto = 0;

        this.orders.forEach(o => {
            const estado = o.estado_actual || 'Pendiente';
            if (counts[estado] !== undefined) counts[estado]++;
            totalMonto += parseFloat(o.totalneto || 0);
        });

        set('totalOrders',     this.orders.length);
        set('totalValue',      '$' + totalMonto.toFixed(2));
        set('pendingOrders',   counts.Pendiente);
        set('sentOrders',      counts.Enviado);
        set('deliveredOrders', counts.Entregado);
        set('cancelledOrders', counts.Cancelado);
        set('confirmedOrders', counts.Confirmado);
    },

    // =========================================================
    // EVENTOS DE TABS Y BÚSQUEDA
    // =========================================================
    setupEvents: function () {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter || 'all';
                this.renderOrders();
            });
        });

        const searchInput = document.getElementById('searchOrders');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.trim();
                this.renderOrders();
            });
        }
    },

    // =========================================================
    // TOAST
    // =========================================================
    showToast: function (msg, type = 'success') {
        const toast = document.getElementById('toastMessage');
        const text  = document.getElementById('toastText');
        if (toast && text) {
            text.innerText = msg;
            toast.style.display = 'flex';
            toast.style.background =
                type === 'error' ? '#ef4444' :
                type === 'info'  ? '#3b82f6' : '#10b981';
            clearTimeout(this._toastTimer);
            this._toastTimer = setTimeout(() => toast.style.display = 'none', 3000);
        } else {
            console.warn('[Toast]', msg);
        }
    }
};

// Inicialización automática
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.orders?.init());
} else {
    window.orders?.init();
}