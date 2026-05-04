// orders.js - Versión SPA
window.orders = {
    ordersData: [
        { id: "ORD-9917", client: "Ferretería El Martillo", initial: "FE", date: "22 May, 2025", items: 20, total: 1800.00, status: "Cancelado" },
        { id: "ORD-9921", client: "Ferretería El Martillo", initial: "FE", date: "24 May, 2024", items: 12, total: 1250.00, status: "Pendiente" },
        { id: "ORD-9920", client: "Constructora Norte", initial: "CO", date: "23 May, 2024", items: 45, total: 4500.50, status: "Enviado" },
        { id: "ORD-9919", client: "Suministros León", initial: "SU", date: "23 May, 2024", items: 8, total: 890.00, status: "Entregado" },
        { id: "ORD-9918", client: "Agropecuaria Central", initial: "AG", date: "22 May, 2024", items: 15, total: 2100.00, status: "Cancelado" },
    ],
    
    currentFilter: 'todos',
    
    init: function() {
        console.log("Orders: Inicializando");
        this.renderOrders();
        this.setupEvents();
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
            return `
                <tr>
                    <td><a href="#" class="order-id">${order.id}</a></td>
                    <td><div class="client-info"><div class="avatar-circle">${order.initial}</div><span>${order.client}</span></div></td>
                    <td>${order.date}</td>
                    <td class="items-count">${order.items}</td>
                    <td class="price-cell">$${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td><span class="badge ${statusClass}">${order.status}</span></td>
                </tr>
            `;
        }).join('');
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
    }
};