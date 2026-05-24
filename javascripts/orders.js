// orders.js - Versión con integración API
window.orders = {
    ordersData: [],
    currentFilter: 'todos',
    estadosMap: {},
    
    init: async function() {
        console.log("Orders: Inicializando con API");
        await this.loadEstados();
        await this.loadOrders();
        this.setupEvents();
    },
    
    loadEstados: async function() {
        try {
            const estados = await window.api.getEstadosPedido();
            this.estadosMap = {};
            estados.forEach(e => {
                this.estadosMap[e.estadonombre] = e;
            });
        } catch (error) {
            console.error('Error loading estados:', error);
        }
    },
    
    loadOrders: async function() {
        try {
            const response = await window.api.getMyOrders();
            this.ordersData = response.map(order => ({
                id: `ORD-${order.id.toString().padStart(6, '0')}`,
                raw_id: order.id,
                client: order.restaurante_nombre || 'Cliente',
                initial: (order.restaurante_nombre || 'CL').substring(0, 2).toUpperCase(),
                date: new Date(order.fechapedido).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
                items: order.detalles?.length || 0,
                total: order.totalneto,
                status: order.estado_nombre || 'Pendiente',
                status_color: order.estado_color,
                status_icono: order.estado_icono
            }));
            this.renderOrders();
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showNotification('Error al cargar pedidos', 'error');
        }
    },
    
    renderOrders: function() {
        const tableBody = document.getElementById('orders-table-body');
        if (!tableBody) return;
        
        const filtered = this.currentFilter === 'todos' 
            ? this.ordersData 
            : this.ordersData.filter(order => order.status === this.currentFilter);
        
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6"><div class="empty-state">No hay pedidos</div></td></tr>`;
            return;
        }
        
        tableBody.innerHTML = filtered.map(order => {
            const statusClass = `badge-${order.status.toLowerCase()}`;
            const statusText = order.status === 'Pendiente' ? 'Pendiente' :
                              order.status === 'Enviado' ? 'Enviado' :
                              order.status === 'Entregado' ? 'Entregado' : 'Cancelado';
            return `
                <tr>
                    <td><a href="#" class="order-id" data-id="${order.raw_id}">${order.id}</a></td>
                    <td><div class="client-info"><div class="avatar-circle">${order.initial}</div><span>${order.client}</span></div></td>
                    <td>${order.date}</td>
                    <td class="items-count">${order.items}</td>
                    <td class="price-cell">$${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');
        
        // Agregar evento click a IDs
        document.querySelectorAll('.order-id').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = parseInt(link.dataset.id);
                await this.showOrderDetail(id);
            });
        });
    },
    
    showOrderDetail: async function(orderId) {
        try {
            const order = await window.api.getOrderDetail(orderId);
            
            const modalHTML = `
                <div class="modal-overlay active" id="orderDetailModal">
                    <div class="modal" style="max-width: 700px;">
                        <div class="modal-header">
                            <h2><i class="fas fa-truck"></i> Detalle del Pedido #ORD-${orderId.toString().padStart(6, '0')}</h2>
                            <button class="modal-close" onclick="document.getElementById('orderDetailModal').remove()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                                <div>
                                    <p><strong><i class="fas fa-store"></i> Restaurante:</strong></p>
                                    <p>${order.restaurante_nombre}</p>
                                </div>
                                <div>
                                    <p><strong><i class="fas fa-building"></i> Proveedor:</strong></p>
                                    <p>${order.proveedor_nombre}</p>
                                </div>
                                <div>
                                    <p><strong><i class="fas fa-calendar"></i> Fecha:</strong></p>
                                    <p>${new Date(order.fechapedido).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p><strong><i class="fas fa-tag"></i> Estado:</strong></p>
                                    <p><span class="badge ${order.estado_nombre === 'Pendiente' ? 'badge-warning' : order.estado_nombre === 'Enviado' ? 'badge-info' : order.estado_nombre === 'Entregado' ? 'badge-success' : 'badge-danger'}">${order.estado_nombre}</span></p>
                                </div>
                            </div>
                            
                            <h3>Productos:</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f1f5f9;">
                                        <th style="padding: 8px; text-align: left;">Producto</th>
                                        <th style="padding: 8px; text-align: center;">Cantidad</th>
                                        <th style="padding: 8px; text-align: right;">Precio</th>
                                        <th style="padding: 8px; text-align: right;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(order.detalles || []).map(d => `
                                        <tr style="border-bottom: 1px solid #e2e8f0;">
                                            <td style="padding: 8px;">${d.producto_nombre}</td>
                                            <td style="padding: 8px; text-align: center;">${d.cantidad}</td>
                                            <td style="padding: 8px; text-align: right;">$${parseFloat(d.preciounitario).toFixed(2)}</td>
                                            <td style="padding: 8px; text-align: right;">$${parseFloat(d.subtotal).toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" style="padding: 8px; text-align: right;"><strong>Subtotal:</strong></td>
                                        <td style="padding: 8px; text-align: right;">$${parseFloat(order.subtotal).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" style="padding: 8px; text-align: right;"><strong>IVA (15%):</strong></td>
                                        <td style="padding: 8px; text-align: right;">$${parseFloat(order.impuesto).toFixed(2)}</td>
                                    </tr>
                                    <tr style="background: #f1f5f9;">
                                        <td colspan="3" style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
                                        <td style="padding: 8px; text-align: right;"><strong>$${parseFloat(order.totalneto).toFixed(2)}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                            
                            ${order.comentario ? `
                                <div style="margin-top: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px;">
                                    <strong><i class="fas fa-comment"></i> Comentario:</strong>
                                    <p style="margin-top: 0.25rem;">${order.comentario}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        } catch (error) {
            console.error('Error loading order detail:', error);
            this.showNotification('Error al cargar detalle del pedido', 'error');
        }
    },
    
    filterOrders: function(filter) {
        this.currentFilter = filter;
        this.renderOrders();
    },
    
    setupEvents: function() {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filterValue = button.getAttribute('data-filter');
                this.filterOrders(filterValue);
            });
        });
    },
    
    showNotification: function(message, type) {
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