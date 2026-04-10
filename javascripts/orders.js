const ordersData = [
    { id: "#ORD-001", date: "2023-10-25", client: "Construcciones S.A.", total: "$1,250.00", status: "completed" },
    { id: "#ORD-002", date: "2023-10-26", client: "Ferretería Central", total: "$450.00", status: "pending" },
    { id: "#ORD-003", date: "2023-10-27", client: "Ingeniería Moderna", total: "$2,100.00", status: "shipped" }
];

function renderOrders() {
    constthink
The user is pointing out that my previous response was cut off. I need to continue the code generation exactly where it stopped.

The previous response stopped at:
`<dyad-write path="javascripts/orders.js" description="Lógica para renderizar y gestionar pedidos.">`
`const ordersData = [`
`    { id: "#ORD-001", date: "2023-10-25", client: "Construcciones S.A.", total: "$1,250.00", status: "completed" },`
`    { id: "#ORD-002", date: "2023-10-26", client: "Ferretería Central", total: "$450.00", status: "pending" },`
`    { id: "#ORD-003", date: "2023-10-27", client: "Ingeniería Moderna", total: "$2,100.00", status: "shipped" }`
`];`

`function renderOrders() {`
`    const`

I need to complete `javascripts/orders.js` and then continue with the other files requested (CSS and JS for each page).

Files to complete/create:
1. `javascripts/orders.js` (finish)
2. `javascripts/inventory.js`
3. `javascripts/invoices.js`
4. `javascripts/analytics.js`
5. `javascripts/profile.js`
6. Update HTML files to include these scripts and the new CSS.

Wait, the user asked for "css y js respectivo para cada uno". I already started `Styles/pages.css`.

Let's finish `javascripts/orders.js` first.

Then `javascripts/inventory.js`.
Then `javascripts/invoices.js`.
Then `javascripts/analytics.js`.
Then `javascripts/profile.js`.

And I should update the HTML files to link these.

Actually, I'll just provide the full content of the files that were missing or incomplete.

The previous response ended at `const` inside `renderOrders`.

```javascript
    const container = document.getElementById('ordersTableBody');
    if (!container) return;

    container.innerHTML = ordersData.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.date}</td>
            <td>${order.client}</td>
            <td>${order.total}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>
                <button class="action-btn"><i class="fa-solid fa-eye"></i></button>
                <button class="action-btn"><i class="fa-solid fa-download"></i></button>
            </td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderOrders);
```

Then `javascripts/inventory.js`:
```javascript
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
```

Then `javascripts/invoices.js`:
```javascript
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
```

I also need to update the HTML files to have the correct table structures and script tags.

Let's go.container = document.getElementById('ordersTableBody');
    if (!container) return;

    container.innerHTML = ordersData.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.date}</td>
            <td>${order.client}</td>
            <td>${order.total}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>
                <button class="action-btn"><i class="fa-solid fa-eye"></i></button>
                <button class="action-btn"><i class="fa-solid fa-download"></i></button>
            </td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderOrders);