// Datos de prueba
const invoicesData = [
    { id: "INV-2023-001", date: "2023-10-20", amount: "$1,250.00", status: "pendientes" },
    { id: "INV-2023-002", date: "2023-10-22", amount: "$450.00", status: "pagadas" },
    { id: "INV-2023-003", date: "2023-10-25", amount: "$2,300.00", status: "pendientes" },
    { id: "INV-2023-004", date: "2023-10-28", amount: "$1,800.00", status: "pendientes" },
    { id: "INV-2023-005", date: "2023-10-30", amount: "$3,500.00", status: "vencidas" },
    { id: "INV-2023-006", date: "2023-11-02", amount: "$750.00", status: "reembolsadas" },
    { id: "INV-2023-007", date: "2023-11-05", amount: "$1,200.00", status: "reembolsadas" },
    { id: "INV-2023-008", date: "2023-11-10", amount: "$2,800.00", status: "vencidas" },
    { id: "INV-2023-009", date: "2023-11-15", amount: "$900.00", status: "pagadas" },
    { id: "INV-2023-010", date: "2023-11-20", amount: "$1,500.00", status: "pendientes" },
    { id: "INV-2024-001", date: "2024-01-10", amount: "$2,100.00", status: "pagadas" },
    { id: "INV-2024-002", date: "2024-01-15", amount: "$3,200.00", status: "pendientes" },
    { id: "INV-2024-003", date: "2024-01-20", amount: "$1,800.00", status: "pagadas" },
    { id: "INV-2024-004", date: "2024-01-25", amount: "$4,500.00", status: "vencidas" },
    { id: "INV-2024-005", date: "2024-02-01", amount: "$950.00", status: "pendientes" },
    { id: "INV-2024-006", date: "2024-02-05", amount: "$2,750.00", status: "pagadas" },
    { id: "INV-2024-007", date: "2024-02-10", amount: "$1,600.00", status: "reembolsadas" },
    { id: "INV-2024-008", date: "2024-02-15", amount: "$3,800.00", status: "pendientes" },
    { id: "INV-2024-009", date: "2024-02-20", amount: "$2,200.00", status: "pagadas" },
    { id: "INV-2024-010", date: "2024-02-25", amount: "$1,450.00", status: "vencidas" },
    { id: "INV-2024-011", date: "2024-03-01", amount: "$5,000.00", status: "pendientes" },
    { id: "INV-2024-012", date: "2024-03-05", amount: "$850.00", status: "pagadas" },
    { id: "INV-2024-013", date: "2024-03-10", amount: "$3,250.00", status: "reembolsadas" },
    { id: "INV-2024-014", date: "2024-03-15", amount: "$1,950.00", status: "pendientes" },
    { id: "INV-2024-015", date: "2024-03-20", amount: "$2,650.00", status: "pagadas" }
];

let invoices = [...invoicesData];
let currentFilter = 'all';
let currentSearch = '';

// Conversión de string a número
function amountToNumber(amountStr) {
    return parseFloat(amountStr.replace('$', '').replace(/,/g, ''));
}

// Actualizar estadísticas
function updateStats() {
    const total = invoices.length;
    const totalPagado = invoices
        .filter(i => i.status === 'pagadas')
        .reduce((sum, i) => sum + amountToNumber(i.amount), 0);
    const totalPendiente = invoices
        .filter(i => i.status === 'pendientes' || i.status === 'vencidas')
        .reduce((sum, i) => sum + amountToNumber(i.amount), 0);
    const pagadasCount = invoices.filter(i => i.status === 'pagadas').length;
    const pendientesCount = invoices.filter(i => i.status === 'pendientes').length;
    const vencidasCount = invoices.filter(i => i.status === 'vencidas').length;

    document.getElementById('totalFacturas').textContent = total;
    document.getElementById('totalPagado').textContent = `$${totalPagado.toLocaleString()}`;
    document.getElementById('totalPendiente').textContent = `$${totalPendiente.toLocaleString()}`;
    document.getElementById('pagadasCount').textContent = pagadasCount;
    document.getElementById('pendientesCount').textContent = pendientesCount;
    document.getElementById('vencidasCount').textContent = vencidasCount;
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Texto legible del estado
function getStatusText(status) {
    const map = {
        pagadas: 'Pagada',
        pendientes: 'Pendiente',
        vencidas: 'Vencida',
        reembolsadas: 'Reembolsada'
    };
    return map[status] || status;
}

// Renderizar tabla
function renderInvoices() {
    let filtered = invoices;

    if (currentFilter !== 'all') {
        filtered = filtered.filter(inv => inv.status === currentFilter);
    }
    if (currentSearch) {
        filtered = filtered.filter(inv =>
            inv.id.toLowerCase().includes(currentSearch)
        );
    }

    const tbody = document.getElementById('invoicesTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <p>No hay facturas que coincidan</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(inv => `
        <tr>
            <td><strong>${inv.id}</strong></td>
            <td>${formatDate(inv.date)}</td>
            <td>${inv.amount}</td>
            <td><span class="badge badge-${inv.status}">${getStatusText(inv.status)}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewInvoiceDetails('${inv.id}')" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn download-btn" onclick="downloadInvoice('${inv.id}')" title="Descargar">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterInvoices(filter) {
    currentFilter = filter;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) btn.classList.add('active');
    });
    renderInvoices();
}

function searchInvoices() {
    currentSearch = document.getElementById('searchInvoice').value.toLowerCase();
    renderInvoices();
}

function viewInvoiceDetails(id) {
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
        const content = document.getElementById('detailsContent');
        content.innerHTML = `
            <div style="padding: 10px;">
                <p><strong>📄 Nº Factura:</strong> ${invoice.id}</p>
                <p><strong>📅 Fecha Emisión:</strong> ${formatDate(invoice.date)}</p>
                <p><strong>💰 Monto:</strong> ${invoice.amount}</p>
                <p><strong>🎯 Estado:</strong> <span class="badge badge-${invoice.status}">${getStatusText(invoice.status)}</span></p>
            </div>`;
        document.getElementById('detailsModal').classList.add('active');
    }
}

function closeDetailsModal() {
    document.getElementById('detailsModal').classList.remove('active');
}

function downloadInvoice(id) {
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
        showNotification(`Descargando factura ${invoice.id}...`, 'info');
    }
}

// Modal nueva factura
function openNewInvoiceModal() {
    document.getElementById('invoiceId').value = '';
    document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceAmount').value = '';
    document.getElementById('invoiceStatus').value = 'pendientes';
    document.getElementById('invoiceModal').classList.add('active');
}

function closeModal() {
    document.getElementById('invoiceModal').classList.remove('active');
}

document.getElementById('invoiceForm').addEventListener('submit', function (e) {
    e.preventDefault();
    let amount = document.getElementById('invoiceAmount').value;
    if (!amount.startsWith('$')) amount = `$${amount}`;

    const newInvoice = {
        id: document.getElementById('invoiceId').value,
        date: document.getElementById('invoiceDate').value,
        amount: amount,
        status: document.getElementById('invoiceStatus').value
    };

    invoices.unshift(newInvoice);
    updateStats();
    renderInvoices();
    closeModal();
    showNotification(`Factura ${newInvoice.id} creada exitosamente`, 'success');
});

// Notificaciones (unificada)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Inicialización
updateStats();
renderInvoices();