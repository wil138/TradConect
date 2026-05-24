// invoices.js - Versión SPA
// invoices.js - Versión con integración API
window.invoices = {
    invoicesData: [],
    currentFilter: 'all',
    currentSearch: '',
    
    init: async function() {
        console.log("Invoices: Inicializando con API");
        await this.loadInvoices();
        this.setupEvents();
    },
    
    loadInvoices: async function() {
        try {
            const response = await window.api.getMyInvoices();
            this.invoicesData = response.map(inv => ({
                id: inv.numerofactura,
                raw_id: inv.id,
                date: inv.fechaemision,
                amount: `$${parseFloat(inv.totalfacturado).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                amount_raw: parseFloat(inv.totalfacturado),
                status: this.getStatusFromAmount(parseFloat(inv.totalfacturado), inv.pedidoid?.estado_nombre),
                pedido_id: inv.pedidoid
            }));
            this.updateStats();
            this.renderInvoices();
        } catch (error) {
            console.error('Error loading invoices:', error);
            this.showNotification('Error al cargar facturas', 'error');
        }
    },
    
    getStatusFromAmount: function(amount, estadoPedido) {
        if (estadoPedido === 'Entregado') return 'pagadas';
        if (estadoPedido === 'Cancelado') return 'vencidas';
        return 'pendientes';
    },
    
    amountToNumber: function(amountStr) {
        return parseFloat(amountStr.replace('$', '').replace(/,/g, ''));
    },
    
    updateStats: function() {
        const total = this.invoicesData.length;
        const totalPagado = this.invoicesData.filter(i => i.status === 'pagadas').reduce((s, i) => s + i.amount_raw, 0);
        const totalPendiente = this.invoicesData.filter(i => i.status === 'pendientes' || i.status === 'vencidas').reduce((s, i) => s + i.amount_raw, 0);
        const pagadasCount = this.invoicesData.filter(i => i.status === 'pagadas').length;
        const pendientesCount = this.invoicesData.filter(i => i.status === 'pendientes').length;
        const vencidasCount = this.invoicesData.filter(i => i.status === 'vencidas').length;
        const reembolsadasCount = this.invoicesData.filter(i => i.status === 'reembolsadas').length;
        
        const el = (id) => document.getElementById(id);
        if (el('totalFacturas')) el('totalFacturas').textContent = total;
        if (el('totalPagado')) el('totalPagado').textContent = `$${totalPagado.toLocaleString()}`;
        if (el('totalPendiente')) el('totalPendiente').textContent = `$${totalPendiente.toLocaleString()}`;
        if (el('pagadasCount')) el('pagadasCount').textContent = pagadasCount;
        if (el('pendientesCount')) el('pendientesCount').textContent = pendientesCount;
        if (el('vencidasCount')) el('vencidasCount').textContent = vencidasCount;
        if (el('reembolsadasCount')) el('reembolsadasCount').textContent = reembolsadasCount;
    },
    
    formatDate: function(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
    
    getStatusText: function(status) {
        const map = {
            'pagadas': 'Pagada',
            'pendientes': 'Pendiente',
            'vencidas': 'Vencida',
            'reembolsadas': 'Reembolsada'
        };
        return map[status] || status;
    },
    
    getStatusClass: function(status) {
        const map = {
            'pagadas': 'badge-success',
            'pendientes': 'badge-warning',
            'vencidas': 'badge-danger',
            'reembolsadas': 'badge-info'
        };
        return map[status] || 'badge-secondary';
    },
    
    renderInvoices: function() {
        const tbody = document.getElementById('invoicesTableBody');
        if (!tbody) return;
        
        let filtered = [...this.invoicesData];
        
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(inv => inv.status === this.currentFilter);
        }
        
        if (this.currentSearch) {
            const search = this.currentSearch.toLowerCase();
            filtered = filtered.filter(inv => inv.id.toLowerCase().includes(search));
        }
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No hay facturas que coincidan</div></td></tr>`;
            return;
        }
        
        tbody.innerHTML = filtered.map(inv => `
            <tr>
                <td><strong><i class="fas fa-file-invoice"></i> ${inv.id}</strong></td>
                <td><i class="fas fa-calendar-alt"></i> ${this.formatDate(inv.date)}</td>
                <td><i class="fas fa-dollar-sign"></i> ${inv.amount}</td>
                <td><span class="badge ${this.getStatusClass(inv.status)}"><i class="fas ${inv.status === 'pagadas' ? 'fa-check-circle' : inv.status === 'pendientes' ? 'fa-clock' : 'fa-exclamation-circle'}"></i> ${this.getStatusText(inv.status)}</span></td>
                <td>
                    <button class="action-btn view-btn" data-id="${inv.raw_id}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn download-btn" data-id="${inv.raw_id}" title="Descargar">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Eventos de botones
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => this.viewInvoiceDetails(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', () => this.downloadInvoice(btn.dataset.id));
        });
    },
    
    filterInvoices: function(filter) {
        this.currentFilter = filter;
        this.renderInvoices();
    },
    
    searchInvoices: function(term) {
        this.currentSearch = term.toLowerCase();
        this.renderInvoices();
    },
    
    viewInvoiceDetails: async function(id) {
        try {
            const invoice = this.invoicesData.find(inv => inv.raw_id === id);
            if (!invoice) return;
            
            const content = document.getElementById('detailsContent');
            if (content) {
                content.innerHTML = `
                    <div style="padding: 10px;">
                        <p><strong><i class="fas fa-hashtag"></i> Nº Factura:</strong> ${invoice.id}</p>
                        <p><strong><i class="fas fa-calendar"></i> Fecha Emisión:</strong> ${this.formatDate(invoice.date)}</p>
                        <p><strong><i class="fas fa-dollar-sign"></i> Monto:</strong> ${invoice.amount}</p>
                        <p><strong><i class="fas fa-tag"></i> Estado:</strong> <span class="badge ${this.getStatusClass(invoice.status)}">${this.getStatusText(invoice.status)}</span></p>
                        <hr>
                        <p><strong><i class="fas fa-building"></i> Cliente:</strong> ${localStorage.getItem('userEmpresa') ? JSON.parse(localStorage.getItem('userEmpresa')).razon_social : 'N/A'}</p>
                    </div>
                `;
            }
            
            const modal = document.getElementById('detailsModal');
            if (modal) modal.classList.add('active');
        } catch (error) {
            this.showNotification('Error al cargar detalles', 'error');
        }
    },
    
    downloadInvoice: async function(id) {
        this.showNotification(`Descargando factura...`, 'info');
        setTimeout(() => {
            this.showNotification(`Factura descargada`, 'success');
        }, 1000);
    },
    
    setupEvents: function() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                this.filterInvoices(filter);
            });
        });
        
        const searchInput = document.getElementById('searchInvoice');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchInvoices(e.target.value));
        }
        
        const closeModalBtn = document.getElementById('closeModalBtn');
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());
        
        const closeDetailsBtn = document.getElementById('closeDetailsBtn');
        if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => this.closeDetailsModal());
        
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    },
    
    closeModal: function() {
        const modal = document.getElementById('invoiceModal');
        if (modal) modal.classList.remove('active');
    },
    
    closeDetailsModal: function() {
        const modal = document.getElementById('detailsModal');
        if (modal) modal.classList.remove('active');
    },
    
    showNotification: function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${message}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

window.filterInvoices = (filter) => window.invoices?.filterInvoices(filter);
window.searchInvoices = () => window.invoices?.searchInvoices(document.getElementById('searchInvoice')?.value || '');
window.closeModal = () => window.invoices?.closeModal();
window.closeDetailsModal = () => window.invoices?.closeDetailsModal();