const invoicesData = [
    { id: "INV-2023-001", date: "2023-10-20", amount: "$1,250.00", status: "paid" },
    { id: "INV-2023-002", date: "2023-10-22", amount: "$450.00", status: "pending" }
];

function renderInvoices() {
    const container = document.getElementById('invoicesTableBody');
    if (!container) return;

    container.innerHTML = invoicesData.map(inv => `
        <tr>
            <td>${inv.id}</td>
            <td>${inv.date}</td>
            <td>${inv.amount}</td>
            <td><span class="status-badge status-${inv.status === 'paid' ? 'completed' : 'pending'}">${inv.status}</span></td>
            <td>
                <button class="action-btn"><i class="fa-solid fa-file-pdf"></i></button>
            </td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderInvoices);