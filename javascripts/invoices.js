// invoices.js - Versión SPA
window.invoices = {
    invoicesData: [
        { id: "INV-2023-001", date: "2023-05-31", amount: "$1,858.13", status: "reembolsadas" },
        { id: "INV-2023-002", date: "2023-07-16", amount: "$4,548.85", status: "vencidas" },
        { id: "INV-2023-003", date: "2023-01-18", amount: "$2,538.08", status: "pendientes" },
        { id: "INV-2023-004", date: "2023-01-02", amount: "$2,755.44", status: "pagadas" },
        { id: "INV-2023-005", date: "2023-03-01", amount: "$2,169.56", status: "pendientes" },
        { id: "INV-2023-006", date: "2023-02-06", amount: "$229.87", status: "vencidas" },
        { id: "INV-2023-007", date: "2023-05-06", amount: "$2,006.64", status: "vencidas" },
        { id: "INV-2023-008", date: "2023-03-27", amount: "$1,208.33", status: "pendientes" },
        { id: "INV-2023-009", date: "2023-09-25", amount: "$4,512.33", status: "pagadas" },
        { id: "INV-2023-010", date: "2023-05-25", amount: "$224.50", status: "pagadas" },
        { id: "INV-2023-011", date: "2023-09-13", amount: "$4,119.61", status: "vencidas" },
        { id: "INV-2023-012", date: "2023-05-18", amount: "$3,265.42", status: "pendientes" },
        { id: "INV-2023-013", date: "2023-08-07", amount: "$3,729.11", status: "pendientes" },
        { id: "INV-2023-014", date: "2023-07-26", amount: "$1,619.58", status: "vencidas" },
        { id: "INV-2023-015", date: "2023-01-12", amount: "$3,150.47", status: "pagadas" },
        { id: "INV-2023-016", date: "2023-09-06", amount: "$3,573.78", status: "pagadas" },
        { id: "INV-2023-017", date: "2023-03-23", amount: "$728.40", status: "vencidas" },
        { id: "INV-2023-018", date: "2023-07-12", amount: "$3,511.49", status: "pagadas" },
        { id: "INV-2023-019", date: "2023-01-13", amount: "$2,570.08", status: "reembolsadas" },
        { id: "INV-2023-020", date: "2023-04-30", amount: "$1,710.40", status: "pagadas" },
        { id: "INV-2023-021", date: "2023-02-21", amount: "$1,532.93", status: "reembolsadas" },
        { id: "INV-2023-022", date: "2023-01-14", amount: "$1,572.56", status: "pendientes" },
        { id: "INV-2023-023", date: "2023-10-19", amount: "$3,609.04", status: "vencidas" },
        { id: "INV-2023-024", date: "2023-09-07", amount: "$786.16", status: "vencidas" },
        { id: "INV-2023-025", date: "2023-03-28", amount: "$3,361.65", status: "reembolsadas" },
        { id: "INV-2023-026", date: "2023-05-05", amount: "$1,557.19", status: "vencidas" },
        { id: "INV-2023-027", date: "2023-03-03", amount: "$1,951.44", status: "vencidas" },
        { id: "INV-2023-028", date: "2023-02-27", amount: "$1,422.13", status: "pendientes" },
        { id: "INV-2023-029", date: "2023-07-28", amount: "$230.55", status: "pagadas" },
        { id: "INV-2023-030", date: "2023-05-02", amount: "$4,964.77", status: "pendientes" },
        { id: "INV-2023-031", date: "2023-03-29", amount: "$3,534.46", status: "pendientes" },
        { id: "INV-2023-032", date: "2023-09-14", amount: "$4,963.48", status: "vencidas" },
        { id: "INV-2023-033", date: "2023-05-07", amount: "$1,109.77", status: "reembolsadas" },
        { id: "INV-2023-034", date: "2023-01-04", amount: "$1,495.95", status: "pagadas" },
        { id: "INV-2023-035", date: "2023-04-03", amount: "$2,161.65", status: "pagadas" },
        { id: "INV-2023-036", date: "2023-05-28", amount: "$3,173.17", status: "pendientes" },
        { id: "INV-2023-037", date: "2023-01-25", amount: "$1,826.40", status: "vencidas" },
        { id: "INV-2023-038", date: "2023-06-10", amount: "$3,729.05", status: "reembolsadas" },
        { id: "INV-2023-039", date: "2023-06-15", amount: "$2,642.66", status: "pagadas" },
        { id: "INV-2023-040", date: "2023-01-15", amount: "$3,275.25", status: "pagadas" },
        { id: "INV-2023-041", date: "2023-07-19", amount: "$3,872.60", status: "pagadas" },
        { id: "INV-2023-042", date: "2023-01-29", amount: "$274.84", status: "reembolsadas" },
        { id: "INV-2023-043", date: "2023-04-01", amount: "$4,853.65", status: "reembolsadas" },
        { id: "INV-2023-044", date: "2023-02-16", amount: "$2,603.04", status: "reembolsadas" },
        { id: "INV-2023-045", date: "2023-09-19", amount: "$1,568.42", status: "reembolsadas" },
        { id: "INV-2023-046", date: "2023-03-31", amount: "$4,723.60", status: "pagadas" },
        { id: "INV-2023-047", date: "2023-03-17", amount: "$83.75", status: "vencidas" },
        { id: "INV-2023-048", date: "2023-10-17", amount: "$3,454.19", status: "reembolsadas" },
        { id: "INV-2023-049", date: "2023-02-16", amount: "$104.30", status: "vencidas" },
        { id: "INV-2023-050", date: "2023-08-21", amount: "$2,807.71", status: "vencidas" },
        { id: "INV-2023-051", date: "2023-02-09", amount: "$3,164.30", status: "vencidas" },
        { id: "INV-2023-052", date: "2023-04-21", amount: "$3,570.56", status: "pendientes" },
        { id: "INV-2023-053", date: "2023-07-09", amount: "$153.97", status: "reembolsadas" },
        { id: "INV-2023-054", date: "2023-01-21", amount: "$1,410.97", status: "pagadas" },
        { id: "INV-2023-055", date: "2023-06-18", amount: "$208.86", status: "vencidas" },
        { id: "INV-2023-056", date: "2023-09-26", amount: "$3,755.32", status: "vencidas" },
        { id: "INV-2023-057", date: "2023-05-03", amount: "$197.12", status: "reembolsadas" },
        { id: "INV-2023-058", date: "2023-04-16", amount: "$4,175.37", status: "reembolsadas" },
        { id: "INV-2023-059", date: "2023-05-03", amount: "$2,084.64", status: "vencidas" },
        { id: "INV-2023-060", date: "2023-01-01", amount: "$635.85", status: "vencidas" },
        { id: "INV-2023-061", date: "2023-09-09", amount: "$1,233.01", status: "pendientes" },
        { id: "INV-2023-062", date: "2023-08-07", amount: "$695.13", status: "pagadas" },
        { id: "INV-2023-063", date: "2023-10-27", amount: "$568.77", status: "pagadas" },
        { id: "INV-2023-064", date: "2023-09-20", amount: "$2,328.48", status: "pagadas" },
        { id: "INV-2023-065", date: "2023-01-12", amount: "$1,874.90", status: "reembolsadas" },
        { id: "INV-2023-066", date: "2023-07-02", amount: "$1,896.48", status: "reembolsadas" },
        { id: "INV-2023-067", date: "2023-07-28", amount: "$2,529.10", status: "vencidas" },
        { id: "INV-2023-068", date: "2023-01-25", amount: "$2,660.41", status: "reembolsadas" },
        { id: "INV-2023-069", date: "2023-08-16", amount: "$1,689.87", status: "reembolsadas" },
        { id: "INV-2023-070", date: "2023-02-10", amount: "$4,099.45", status: "reembolsadas" },
        { id: "INV-2023-071", date: "2023-01-28", amount: "$3,421.76", status: "pendientes" },
        { id: "INV-2023-072", date: "2023-04-14", amount: "$3,629.83", status: "reembolsadas" },
        { id: "INV-2023-073", date: "2023-09-30", amount: "$2,329.01", status: "vencidas" },
        { id: "INV-2023-074", date: "2023-01-17", amount: "$3,630.40", status: "vencidas" },
        { id: "INV-2023-075", date: "2023-05-07", amount: "$2,698.35", status: "pagadas" },
        { id: "INV-2023-076", date: "2023-09-10", amount: "$201.82", status: "pagadas" },
        { id: "INV-2023-077", date: "2023-09-25", amount: "$1,167.72", status: "pagadas" },
        { id: "INV-2023-078", date: "2023-09-04", amount: "$1,034.25", status: "pendientes" },
        { id: "INV-2023-079", date: "2023-10-19", amount: "$2,383.72", status: "pendientes" },
        { id: "INV-2023-080", date: "2023-06-17", amount: "$2,063.19", status: "pendientes" },
        { id: "INV-2023-081", date: "2023-01-25", amount: "$265.35", status: "reembolsadas" },
        { id: "INV-2023-082", date: "2023-04-30", amount: "$3,381.58", status: "pagadas" },
        { id: "INV-2023-083", date: "2023-08-06", amount: "$3,543.16", status: "pagadas" },
        { id: "INV-2023-084", date: "2023-07-09", amount: "$2,382.37", status: "pendientes" },
        { id: "INV-2023-085", date: "2023-01-25", amount: "$4,650.60", status: "pagadas" },
        { id: "INV-2023-086", date: "2023-10-26", amount: "$383.29", status: "reembolsadas" },
        { id: "INV-2023-087", date: "2023-01-26", amount: "$880.58", status: "pendientes" },
        { id: "INV-2023-088", date: "2023-07-22", amount: "$1,840.46", status: "reembolsadas" },
        { id: "INV-2023-089", date: "2023-09-12", amount: "$1,110.08", status: "vencidas" },
        { id: "INV-2023-090", date: "2023-09-22", amount: "$563.67", status: "pendientes" },
        { id: "INV-2023-091", date: "2023-06-24", amount: "$3,812.69", status: "vencidas" },
        { id: "INV-2023-092", date: "2023-08-03", amount: "$1,717.29", status: "pagadas" },
        { id: "INV-2023-093", date: "2023-06-12", amount: "$2,144.20", status: "pagadas" },
        { id: "INV-2023-094", date: "2023-09-17", amount: "$2,948.27", status: "vencidas" },
        { id: "INV-2023-095", date: "2023-05-25", amount: "$4,415.24", status: "reembolsadas" },
        { id: "INV-2023-096", date: "2023-08-23", amount: "$2,934.45", status: "reembolsadas" },
        { id: "INV-2023-097", date: "2023-03-26", amount: "$1,785.56", status: "pagadas" },
        { id: "INV-2023-098", date: "2023-07-30", amount: "$1,826.41", status: "vencidas" },
        { id: "INV-2023-099", date: "2023-03-18", amount: "$323.16", status: "reembolsadas" },
        { id: "INV-2023-100", date: "2023-01-12", amount: "$297.50", status: "vencidas" }
    ],

    currentFilter: 'all',
    currentSearch: '',
    
    init: function() {
        console.log("Invoices: Inicializando");
        this.updateStats();
        this.renderInvoices();
        this.setupEvents();
    },
    
    amountToNumber: function(amountStr) {
        return parseFloat(amountStr.replace('$', '').replace(/,/g, ''));
    },
    
    updateStats: function() {
        const total = this.invoicesData.length;
        const totalPagado = this.invoicesData.filter(i => i.status === 'pagadas').reduce((s, i) => s + this.amountToNumber(i.amount), 0);
        const totalPendiente = this.invoicesData.filter(i => i.status === 'pendientes' || i.status === 'vencidas').reduce((s, i) => s + this.amountToNumber(i.amount), 0);
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
                <td><strong>${inv.id}</strong></td>
                <td>${this.formatDate(inv.date)}</td>
                <td>${inv.amount}</td>
                <td><span class="badge ${this.getStatusClass(inv.status)}">${this.getStatusText(inv.status)}</span></td>
                <td>
                    <button class="action-btn view-btn" data-id="${inv.id}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn download-btn" data-id="${inv.id}" title="Descargar">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Eventos de botones
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => this.viewInvoiceDetails(btn.dataset.id));
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
    
    viewInvoiceDetails: function(id) {
        const invoice = this.invoicesData.find(inv => inv.id === id);
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
                    <p><strong><i class="fas fa-building"></i> Cliente:</strong> Suministros Pro S.A.</p>
                    <p><strong><i class="fas fa-address-card"></i> NIT:</strong> J-03123456-7</p>
                </div>
            `;
        }
        
        const modal = document.getElementById('detailsModal');
        if (modal) modal.classList.add('active');
    },
    
    downloadInvoice: function(id) {
        const invoice = this.invoicesData.find(inv => inv.id === id);
        if (invoice) {
            this.showNotification(`Descargando factura ${invoice.id}...`, 'info');
            // Simular descarga
            setTimeout(() => {
                this.showNotification(`Factura ${invoice.id} descargada`, 'success');
            }, 1000);
        }
    },
    
    setupEvents: function() {
        // Pestañas de filtro
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                this.filterInvoices(filter);
            });
        });
        
        // Búsqueda
        const searchInput = document.getElementById('searchInvoice');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchInvoices(e.target.value));
        }
        
        // Botón nueva factura
        const newBtn = document.getElementById('newInvoiceBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.openNewInvoiceModal());
        }
        
        // Cerrar modales
        const closeModalBtn = document.getElementById('closeModalBtn');
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());
        
        const cancelModalBtn = document.getElementById('cancelModalBtn');
        if (cancelModalBtn) cancelModalBtn.addEventListener('click', () => this.closeModal());
        
        const closeDetailsBtn = document.getElementById('closeDetailsBtn');
        if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => this.closeDetailsModal());
        
        // Overlay para cerrar modales
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Formulario nueva factura
        const form = document.getElementById('invoiceForm');
        if (form) {
            form.addEventListener('submit', (e) => this.createInvoice(e));
        }
    },
    
    openNewInvoiceModal: function() {
        const modal = document.getElementById('invoiceModal');
        if (modal) {
            modal.classList.add('active');
            
            const idInput = document.getElementById('invoiceId');
            const dateInput = document.getElementById('invoiceDate');
            const amountInput = document.getElementById('invoiceAmount');
            const statusSelect = document.getElementById('invoiceStatus');
            
            if (idInput) idInput.value = '';
            if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
            if (amountInput) amountInput.value = '';
            if (statusSelect) statusSelect.value = 'pendientes';
        }
    },
    
    closeModal: function() {
        const modal = document.getElementById('invoiceModal');
        if (modal) modal.classList.remove('active');
    },
    
    closeDetailsModal: function() {
        const modal = document.getElementById('detailsModal');
        if (modal) modal.classList.remove('active');
    },
    
    createInvoice: function(e) {
        e.preventDefault();
        
        let amount = document.getElementById('invoiceAmount').value;
        if (!amount.startsWith('$')) amount = `$${amount}`;
        
        const newInvoice = {
            id: document.getElementById('invoiceId').value,
            date: document.getElementById('invoiceDate').value,
            amount: amount,
            status: document.getElementById('invoiceStatus').value
        };
        
        this.invoicesData.unshift(newInvoice);
        this.updateStats();
        this.renderInvoices();
        this.closeModal();
        this.showNotification(`Factura ${newInvoice.id} creada exitosamente`, 'success');
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

// Exponer funciones globales
window.filterInvoices = (filter) => window.invoices?.filterInvoices(filter);
window.searchInvoices = () => window.invoices?.searchInvoices(document.getElementById('searchInvoice')?.value || '');
window.openNewInvoiceModal = () => window.invoices?.openNewInvoiceModal();
window.closeModal = () => window.invoices?.closeModal();
window.closeDetailsModal = () => window.invoices?.closeDetailsModal();
window.viewInvoiceDetails = (id) => window.invoices?.viewInvoiceDetails(id);
window.downloadInvoice = (id) => window.invoices?.downloadInvoice(id);