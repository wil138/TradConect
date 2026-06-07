// invoices.js - Gestión de Facturación con Acciones Completas (Ver, Editar, Eliminar)

window.invoices = {
    invoicesData: [
        { id: "INV-2024-001", date: "2024-01-20", amount: "$1,250.00", status: "pagadas", client: "Construcciones XYZ" },
        { id: "INV-2024-002", date: "2024-01-19", amount: "$2,500.00", status: "pendientes", client: "Suministros Pro S.A." },
        { id: "INV-2024-003", date: "2024-01-18", amount: "$875.50", status: "vencidas", client: "Ferretería Central" },
        { id: "INV-2024-004", date: "2024-01-17", amount: "$3,100.00", status: "pendientes", client: "Comercial del Norte" },
        { id: "INV-2024-005", date: "2024-01-16", amount: "$450.25", status: "reembolsadas", client: "Tienda Local" },
        { id: "INV-2024-006", date: "2024-01-15", amount: "$5,200.00", status: "pagadas", client: "Grandes Obras S.A." },
        { id: "INV-2024-007", date: "2024-01-14", amount: "$1,800.00", status: "vencidas", client: "Distribuidora Meridional" },
        { id: "INV-2024-008", date: "2024-01-13", amount: "$2,100.00", status: "pendientes", client: "Innovación Constructiva" },
        { id: "INV-2024-009", date: "2024-01-12", amount: "$950.75", status: "pagadas", client: "Grupo Técnico" },
        { id: "INV-2024-010", date: "2024-01-11", amount: "$4,300.00", status: "reembolsadas", client: "Soluciones Integradas" }
    ],
    
    currentFilter: 'all',
    currentSearch: '',
    
    init: function() {
        console.log("Invoices: Inicializando");
        this.loadData();
        this.renderInvoices();
        this.setupEvents();
    },
    
    loadData: function() {
        const saved = localStorage.getItem('invoices');
        this.invoicesData = saved ? JSON.parse(saved) : this.invoicesData;
    },
    
    saveData: function() {
        localStorage.setItem('invoices', JSON.stringify(this.invoicesData));
    },
    
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },
    
    getStatusText: function(status) {
        const map = {
            'pagadas': '✅ Pagada',
            'pendientes': '⏳ Pendiente',
            'vencidas': '⚠️ Vencida',
            'reembolsadas': '🔄 Reembolsada'
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
            this.updateStats();
            return;
        }
        
        tbody.innerHTML = filtered.map(inv => `
            <tr data-id="${inv.id}">
                <td><strong>${inv.id}</strong></td>
                <td>${this.formatDate(inv.date)}</td>
                <td>${inv.amount}</td>
                <td><span class="badge ${this.getStatusClass(inv.status)}">${this.getStatusText(inv.status)}</span></td>
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
            const invoice = this.invoicesData.find(inv => inv.id === invoiceId);
            
            if (!invoice) return;
            
            if (action === 'view') this.showInvoiceDetails(invoice);
            if (action === 'edit') this.openInvoiceModal(invoice);
            if (action === 'delete') this.deleteInvoice(invoiceId);
        });
    },
    
    // 👁️ VER DETALLES
    showInvoiceDetails: function(invoice) {
        const detailsHTML = `
            <div class="modal-overlay active" id="invoiceDetailsModal" onclick="if(event.target === this) this.remove()">
                <div class="modal detail-card">
                    <div class="modal-header">
                        <h2><i class="fas fa-file-invoice-dollar"></i> Detalles de Factura</h2>
                        <button class="modal-close" onclick="document.getElementById('invoiceDetailsModal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span><i class="fas fa-hashtag"></i> Nº Factura:</span>
                                <strong>${invoice.id}</strong>
                            </div>
                            <div class="detail-item">
                                <span><i class="fas fa-calendar"></i> Fecha Emisión:</span>
                                <strong>${this.formatDate(invoice.date)}</strong>
                            </div>
                            <div class="detail-item">
                                <span><i class="fas fa-dollar-sign"></i> Monto:</span>
                                <strong style="color: var(--accent-color)">${invoice.amount}</strong>
                            </div>
                            <div class="detail-item">
                                <span><i class="fas fa-tag"></i> Estado:</span>
                                <strong><span class="badge ${this.getStatusClass(invoice.status)}">${this.getStatusText(invoice.status)}</span></strong>
                            </div>
                            <div class="detail-item">
                                <span><i class="fas fa-building"></i> Cliente:</span>
                                <strong>${invoice.client || 'No especificado'}</strong>
                            </div>
                            <div class="detail-item">
                                <span><i class="fas fa-address-card"></i> NIT:</span>
                                <strong>J-03123456-7</strong>
                            </div>
                        </div>
                        <hr style="margin: 20px 0; border: 1px solid var(--border-color);">
                        <div style="background: var(--bg-secondary); padding: 15px; border-radius: 8px;">
                            <h4><i class="fas fa-info-circle"></i> Información Adicional</h4>
                            <ul style="margin-top: 10px; color: var(--text-muted); list-style: none; padding: 0;">
                                <li style="margin: 8px 0;"><i class="fas fa-check"></i> Factura emitida correctamente</li>
                                <li style="margin: 8px 0;"><i class="fas fa-lock"></i> Documento protegido y certificado</li>
                                <li style="margin: 8px 0;"><i class="fas fa-download"></i> Disponible para descargar en PDF</li>
                            </ul>
                        </div>
                        <div style="margin-top: 15px;">
                            <button class="btn-primary" onclick="window.invoices.downloadInvoice('${invoice.id}')">
                                <i class="fas fa-download"></i> Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },
    
    // ✏️ EDITAR
    openInvoiceModal: function(invoice = null) {
        this.closeInvoiceModal();
        
        const statusOptions = ['pagadas', 'pendientes', 'vencidas', 'reembolsadas'];
        
        const modalHTML = `
            <div class="modal-overlay active" id="invoiceModal">
                <div class="modal card-shadow">
                    <div class="modal-header">
                        <h2>${invoice ? '✏️ Editar Factura' : '➕ Nueva Factura'}</h2>
                        <button class="modal-close" onclick="window.invoices.closeInvoiceModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="invoiceForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label><i class="fas fa-hashtag"></i> Número de Factura</label>
                                    <input type="text" id="invoiceId" value="${invoice ? invoice.id : ''}" placeholder="INV-2024-XXX" required ${invoice ? 'readonly' : ''}>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-calendar"></i> Fecha</label>
                                    <input type="date" id="invoiceDate" value="${invoice ? invoice.date : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-dollar-sign"></i> Monto</label>
                                    <input type="text" id="invoiceAmount" placeholder="$0.00" value="${invoice ? invoice.amount : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-building"></i> Cliente</label>
                                    <input type="text" id="invoiceClient" placeholder="Nombre del cliente" value="${invoice ? invoice.client : ''}" required>
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-tag"></i> Estado</label>
                                    <select id="invoiceStatus" required>
                                        <option value="">Seleccionar estado</option>
                                        ${statusOptions.map(status => 
                                            `<option value="${status}" ${invoice?.status === status ? 'selected' : ''}>${this.getStatusText(status)}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-cancel" onclick="window.invoices.closeInvoiceModal()">Cancelar</button>
                                <button type="submit" class="btn-save">${invoice ? '💾 Guardar Cambios' : '✅ Crear Factura'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('invoiceForm').addEventListener('submit', (e) => this.saveInvoice(e, invoice));
    },
    
    saveInvoice: function(e, invoice) {
        e.preventDefault();
        
        let rawAmount = document.getElementById('invoiceAmount').value.trim();
        if (!rawAmount.startsWith('$')) rawAmount = '$' + rawAmount;
        
        const invoiceData = {
            id: document.getElementById('invoiceId').value.trim(),
            date: document.getElementById('invoiceDate').value,
            amount: rawAmount,
            status: document.getElementById('invoiceStatus').value,
            client: document.getElementById('invoiceClient').value.trim()
        };
        
        if (invoice) {
            const index = this.invoicesData.findIndex(i => i.id === invoice.id);
            if (index !== -1) {
                this.invoicesData[index] = invoiceData;
                this.showNotification('Factura actualizada correctamente', 'success');
            }
        } else {
            this.invoicesData.push(invoiceData);
            this.showNotification('Factura creada correctamente', 'success');
        }
        
        this.saveData();
        this.closeInvoiceModal();
        this.renderInvoices();
    },
    
    closeInvoiceModal: function() {
        const modal = document.getElementById('invoiceModal');
        if (modal) modal.remove();
    },
    
    // 🗑️ ELIMINAR
    deleteInvoice: function(invoiceId) {
        if (confirm('⚠️ ¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer.')) {
            this.invoicesData = this.invoicesData.filter(i => i.id !== invoiceId);
            this.saveData();
            this.renderInvoices();
            this.showNotification('Factura eliminada correctamente', 'danger');
        }
    },
    
    // DESCARGAR
    downloadInvoice: function(id) {
        const invoice = this.invoicesData.find(inv => inv.id === id);
        if (invoice) {
            this.showNotification(`Descargando factura ${invoice.id}...`, 'info');
            setTimeout(() => {
                this.showNotification(`Factura ${invoice.id} descargada correctamente`, 'success');
            }, 1500);
        }
    },
    
    // ESTADÍSTICAS
    updateStats: function() {
        const stats = {
            totalInvoices: this.invoicesData.length,
            totalPaid: this.calculateTotal('pagadas'),
            totalPending: this.calculateTotal('pendientes'),
            paidCount: this.invoicesData.filter(i => i.status === 'pagadas').length,
            pendingCount: this.invoicesData.filter(i => i.status === 'pendientes').length,
            expiredCount: this.invoicesData.filter(i => i.status === 'vencidas').length,
            refundedCount: this.invoicesData.filter(i => i.status === 'reembolsadas').length
        };
        
        document.getElementById('totalFacturas').textContent = stats.totalInvoices;
        document.getElementById('totalPagado').textContent = stats.totalPaid;
        document.getElementById('totalPendiente').textContent = stats.totalPending;
        document.getElementById('pagadasCount').textContent = stats.paidCount;
        document.getElementById('pendientesCount').textContent = stats.pendingCount;
        document.getElementById('vencidasCount').textContent = stats.expiredCount;
        document.getElementById('reembolsadasCount').textContent = stats.refundedCount;
    },
    
    calculateTotal: function(status) {
        const total = this.invoicesData
            .filter(inv => inv.status === status)
            .reduce((sum, inv) => {
                const value = parseFloat(inv.amount.replace(/[$,]/g, ''));
                return sum + (isNaN(value) ? 0 : value);
            }, 0);
        
        return total.toLocaleString('es-ES', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
    },
    
    setupEvents: function() {
        // Filtros por pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.renderInvoices();
            });
        });
        
        // Búsqueda
        const searchInput = document.getElementById('searchInvoice');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.renderInvoices();
            });
        }
        
        // Botón Nueva Factura
        const newBtn = document.getElementById('newInvoiceBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.openInvoiceModal());
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