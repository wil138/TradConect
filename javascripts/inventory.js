const inventoryData = [
    { id: 1, name: "Cemento Canal 42.5kg", stock: 150, price: "$12.50", category: "Construcción" },
    { id: 2, name: "Hierro Corrugado 3/8", stock: 45, price: "$8.75", category: "Metales" },
    { id: 3, name: "Pintura Látex Blanca", stock: 12, price: "$85.00", category: "Acabados" }
];

function renderInventory() {
    const container = document.getElementById('inventoryTableBody');
    if (!container) return;

    container.innerHTML = inventoryData.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.stock}</td>
            <td>${item.price}</td>
            <td>
                <button class="action-btn"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="action-btn" style="color: #ef4444;"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderInventory);