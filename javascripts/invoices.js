// invoices.js
window.invoices = {
    invoicesData: [],
    currentFilter: 'all',
    currentSearch: '',
    
    init: function() {
        console.log("Invoices: Inicializando");
        this.loadData();
        this.renderInvoices();
        this.setupEvents();
    },
    
    loadData: function() {
        const role = localStorage.getItem('userRole');
        let pedidos = [];
        if (role === 'client') {
            pedidos = JSON.parse(localStorage.getItem('pedidos_comprador') || '[]');
        } else {
            pedidos = JSON.parse(localStorage.getItem('pedidos_proveedor') || '[]');
        }
        // Solo pedidos completados (Entregado) se consideran facturas
        this.invoicesData = pedidos.filter(o => o.estado_actual === 'Entregado').map(o => ({
            id: `INV-${o.id}`,
            date: o.fechapedido ? o.fechapedido.split('T')[0] : new Date().toISOString().split('T')[0],
            amount: o.totalneto ? '$' + parseFloat(o.totalneto).toFixed(2) : '$0.00',
            status: 'pagadas',
            client: o.restaurante_nombre || o.proveedor_nombre || 'Cliente'
        }));
        if (!this.invoicesData.length) this.invoicesData = [];
    },
    
    renderInvoices: function() {
        const tbody = document.getElementById('invoicesTableBody');
        if (!tbody) return;
        let filtered = [...this.invoicesData];
        if (this.currentFilter !== 'all') filtered = filtered.filter(inv => inv.status === this.currentFilter);
        if (this.currentSearch) filtered = filtered.filter(inv => inv.id.toLowerCase().includes(this.currentSearch.toLowerCase()));
        if (filtered.length === 0) {
            tbody.innerHTML = `<td><td colspan="5"><div class="empty-state">No hay facturas</div></td></tr>`;
            this.updateStats();
            return;
        }
        tbody.innerHTML = filtered.map(inv => `
            <tr data-id="${inv.id}">
                <td><strong>${inv.id}</strong></td>
                <td>${inv.date}</td>
                <td>${inv.amount}</td>
                <td><span class="badge badge-success">✅ Pagada</span></td>
                <td class="actions-cell">
                    <button class="action-btn view-btn" data-action="view" title="Ver detalles"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete-btn" data-action="delete" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
        this.setupTableDelegation();
        this.updateStats();
    },
    
    setupTableDelegation: function() {
        const tbody = document.getElementById('invoicesTableBody');
        if (!tbody) return;
        tbody.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            const action = target.dataset.action;
            const invoiceId = target.closest('tr').dataset.id;
            const invoice = this.invoicesData.find(i => i.id === invoiceId);
            if (!invoice) return;
            if (action === 'view') this.showInvoiceDetails(invoice);
            if (action === 'delete') this.deleteInvoice(invoiceId);
        });
    },
    
    showInvoiceDetails: function(invoice) {
        const detailsHTML = `
            <div class="modal-overlay active" id="invoiceDetailsModal" onclick="if(event.target===this)this.remove()">
                <div class="modal detail-card">
                    <div class="modal-header"><h2><i class="fas fa-file-invoice-dollar"></i> Detalles de Factura</h2><button class="modal-close" onclick="document.getElementById('invoiceDetailsModal').remove()">&times;</button></div>
                    <div class="modal-body">
                        <div class="detail-grid">
                            <div class="detail-item"><span>Nº Factura:</span><strong>${invoice.id}</strong></div>
                            <div class="detail-item"><span>Fecha:</span><strong>${invoice.date}</strong></div>
                            <div class="detail-item"><span>Monto:</span><strong>${invoice.amount}</strong></div>
                            <div class="detail-item"><span>Estado:</span><strong><span class="badge badge-success">Pagada</span></strong></div>
                            <div class="detail-item"><span>Cliente:</span><strong>${invoice.client}</strong></div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },
    
    deleteInvoice: function(invoiceId) {
        if (confirm('¿Eliminar esta factura?')) {
            this.invoicesData = this.invoicesData.filter(i => i.id !== invoiceId);
            this.updateStats();
            this.renderInvoices();
            this.showNotification('Factura eliminada', 'success');
        }
    },
    
    updateStats: function() {
        document.getElementById('totalFacturas').textContent = this.invoicesData.length;
        const totalPaid = this.invoicesData.reduce((s, i) => s + parseFloat(i.amount.replace('$', '')), 0);
        document.getElementById('totalPagado').textContent = '$' + totalPaid.toFixed(2);
        document.getElementById('totalPendiente').textContent = '$0.00';
        document.getElementById('pagadasCount').textContent = this.invoicesData.length;
        document.getElementById('pendientesCount').textContent = 0;
        document.getElementById('vencidasCount').textContent = 0;
        document.getElementById('reembolsadasCount').textContent = 0;
    },
    
    setupEvents: function() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.renderInvoices();
            });
        });
        const searchInput = document.getElementById('searchInvoice');
        if (searchInput) searchInput.addEventListener('input', (e) => { this.currentSearch = e.target.value; this.renderInvoices(); });
    },
    
    showNotification: function(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};