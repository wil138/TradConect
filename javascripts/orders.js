
// Datos Simulados basados en la imagen
const ordersData = [
    { id: "ORD-9917", client: "Ferretería El Martillo", initial: "FE", date: "22 May, 2025", items: 20, total: 1800.00, status: "Cancelado" },
    { id: "ORD-9921", client: "Ferretería El Martillo", initial: "FE", date: "24 May, 2024", items: 12, total: 1250.00, status: "Pendiente" },
    { id: "ORD-9920", client: "Constructora Norte", initial: "CO", date: "23 May, 2024", items: 45, total: 4500.50, status: "Enviado" },
    { id: "ORD-9919", client: "Suministros León", initial: "SU", date: "23 May, 2024", items: 8, total: 890.00, status: "Entregado" },
    { id: "ORD-9918", client: "Agropecuaria Central", initial: "AG", date: "22 May, 2024", items: 15, total: 2100.00, status: "Cancelado" },
];

function renderOrders(filterStatus = 'todos') {
    const tableBody = document.getElementById('orders-table-body');
    tableBody.innerHTML = ''; // Limpiar tabla

    const filteredOrders = filterStatus === 'todos'
        ? ordersData
        : ordersData.filter(order => order.status === filterStatus);

    filteredOrders.forEach(order => {
        const statusClass = `badge-${order.status.toLowerCase()}`;

        const row = `
                    <tr>
                        <td><a href="#" class="order-id">${order.id}</a></td>
                        <td>
                            <div class="client-info">
                                <div class="avatar-circle">${order.initial}</div>
                                <span>${order.client}</span>
                            </div>
                        </td>
                        <td style="color: var(--text-muted)">${order.date}</td>
                        <td class="items-count">${order.items}</td>
                        <td class="price-cell">$${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>
                            <span class="badge ${statusClass}">${order.status}</span>
                        </td>
                    </tr>
                `;
        tableBody.innerHTML += row;
    });
}

// Lógica de las pestañas (Tabs)
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Cambiar clase activa
        document.querySelector('.tab-btn.active').classList.remove('active');
        button.classList.add('active');

        // Filtrar datos
        const filterValue = button.getAttribute('data-filter');
        renderOrders(filterValue);
    });
});

// Carga inicial
window.onload = () => renderOrders('todos');
