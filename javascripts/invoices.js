
// invoices.js - Versión SPA
window.invoices = {
    invoicesData: [
        { id: "INV-2023-001", date: "2023-10-20", amount: "$1,250.00", status: "pendientes" },
        { id: "INV-2023-002", date: "2023-10-22", amount: "$450.00", status: "pagadas" },
        { id: "INV-2023-003", date: "2023-10-25", amount: "$2,300.00", status: "pendientes" },
        // ... más datos
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
        
        const el = (id) => document.getElementById(id);
        if (el('totalFacturas')) el('totalFacturas').textContent = total;
        if (el('totalPagado')) el('totalPagado').textContent = `$${totalPagado.toLocaleString()}`;
        if (el('totalPendiente')) el('totalPendiente').textContent = `$${totalPendiente.toLocaleString()}`;
        if (el('pagadasCount')) el('pagadasCount').textContent = pagadasCount;
        if (el('pendientesCount')) el('pendientesCount').textContent = pendientesCount;
        if (el('vencidasCount')) el('vencidasCount').textContent = vencidasCount;
    },
    
    formatDate: function(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
    },
    
    getStatusText: function(status) {
        const map = { pagadas: 'Pagada', pendientes: 'Pendiente', vencidas: 'Vencida', reembolsadas: 'Reembolsada' };
        return map[status] || status;
    },
    
    renderInvoices: function() {
        const tbody = document.getElementById('invoicesTableBody');
        if (!tbody) return;
        
        let filtered = this.invoicesData;
        if (this.currentFilter !== 'all') filtered = filtered.filter(inv => inv.status === this.currentFilter);
        if (this.currentSearch) filtered = filtered.filter(inv => inv.id.toLowerCase().includes(this.currentSearch));
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No hay facturas</div></td></tr>`;
            return;
        }
        
        tbody.innerHTML = filtered.map(inv => `
            <tr>
                <td><strong>${inv.id}</strong></td>
                <td>${this.formatDate(inv.date)}</td>
                <td>${inv.amount}</td>
                <td><span class="badge badge-${inv.status}">${this.getStatusText(inv.status)}</span></td>
                <td>
                    <button class="action-btn view-btn" data-id="${inv.id}" title="Ver detalles"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `).join('');
        
        // Eventos de botones
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => this.viewInvoiceDetails(btn.dataset.id));
        });
    },
    
    filterInvoices: function(filter) {
        this.currentFilter = filter;
        this.renderInvoices();
    },
    
    searchInvoices: function(term) {
        this.currentSearch = term;
        this.renderInvoices();
    },
    
    viewInvoiceDetails: function(id) {
        const invoice = this.invoicesData.find(inv => inv.id === id);
        if (invoice) {
            const content = document.getElementById('detailsContent');
            if (content) {
                content.innerHTML = `<p><strong>Nº Factura:</strong> ${invoice.id}</p><p><strong>Fecha:</strong> ${this.formatDate(invoice.date)}</p><p><strong>Monto:</strong> ${invoice.amount}</p><p><strong>Estado:</strong> ${this.getStatusText(invoice.status)}</p>`;
                const modal = document.getElementById('detailsModal');
                if (modal) modal.classList.add('active');
            }
        }
    },
    
    setupEvents: function() {
        // Pestañas de filtro
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterInvoices(btn.getAttribute('data-filter'));
            });
        });
        
        // Búsqueda
        const searchInput = document.getElementById('searchInvoice');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchInvoices(e.target.value));
        }
        
        // Modal
        const newBtn = document.getElementById('newInvoiceBtn');
        if (newBtn) newBtn.addEventListener('click', () => this.openNewInvoiceModal());
        
        const closeModal = document.getElementById('closeModalBtn');
        if (closeModal) closeModal.addEventListener('click', () => this.closeModal());
        
        const cancelModal = document.getElementById('cancelModalBtn');
        if (cancelModal) cancelModal.addEventListener('click', () => this.closeModal());
        
        const closeDetails = document.getElementById('closeDetailsBtn');
        if (closeDetails) closeDetails.addEventListener('click', () => this.closeDetailsModal());
        
        const form = document.getElementById('invoiceForm');
        if (form) form.addEventListener('submit', (e) => this.createInvoice(e));
    },
    
    openNewInvoiceModal: function() {
        const modal = document.getElementById('invoiceModal');
        if (modal) modal.classList.add('active');
        const idInput = document.getElementById('invoiceId');
        const dateInput = document.getElementById('invoiceDate');
        if (idInput) idInput.value = '';
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
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
        this.showNotification(`Factura ${newInvoice.id} creada`);
    },
    
    showNotification: function(message) {
        const notification = document.createElement('div');
        notification.className = 'notification notification-success';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};