// dashboard.js - VERSIÓN COMPLETAMENTE BASADA EN localStorage (sin peticiones extra)
window.dashboard = {
    data: null,
    salesData: null,
    dailySalesData: null,
    recentOrders: [],
    userRole: 'provider', // o 'client' según corresponda

    init: async function() {
        console.log("📊 Dashboard: Inicializando");
        this.destroy();
        this._events = new AbortController();
        const events = this._events;
        const refreshed = await api.refreshFullData();
        if (events.signal.aborted) return;
        if (!refreshed) this.showNotification('No se pudo actualizar el tablero. Se muestra la copia guardada.', 'warning');
        this.userRole = localStorage.getItem('userRole') || 'provider';
        // Cargar datos desde localStorage (ya actualizados por refreshFullData)
        this.loadFromStorage();
        // Renderizar todo
        this.renderKPIs();
        this.renderCharts();
        this.renderRecentOrders();
        this.renderBusinessAlerts();
        window.notifications?.refresh();
        const alerts = document.getElementById('businessAlerts');
        alerts?.addEventListener('click', event => {
            const button = event.target.closest('[data-alert-module]');
            if (button) window.router?.navigateTo(button.dataset.alertModule);
        }, { signal: events.signal });
        // Escuchar cambios en localStorage (para actualizar si otro módulo modifica datos)
        this.setupStorageListener();
    },

    // ========== CARGA DESDE LOCALSTORAGE ==========
    loadFromStorage: function() {
        // Productos
        const productos = appUtils.readJSON('productos', []);
        // Inventario (para stock)
        const inventario = appUtils.readJSON('inventario', []);
        // Pedidos según rol
        const key = this.userRole === 'provider' ? 'pedidos_proveedor' : 'pedidos_comprador';
        const currency = localStorage.getItem('marketplaceCurrency') || '1';
        const pedidos = appUtils.readJSON(key, []).filter(order => String(order.monedaid) === String(currency));

        // Estadísticas (si existen, pueden usarse para complementar)
        const stats = appUtils.readJSON('estadisticas', {});

        console.log(`📦 Datos cargados: ${productos.length} productos, ${pedidos.length} pedidos`);

        // ====== CALCULAR KPIs ======
        const total_ventas = pedidos.filter(p => p.estado_actual !== 'Cancelado').reduce((sum, p) => sum + (parseFloat(p.totalneto) || 0), 0);
        const total_pedidos = pedidos.length;
        const activos = pedidos.filter(p => p.estado_actual !== 'Cancelado');
        const clientes = new Set(activos.map(p => p.restauranteid).filter(Boolean)).size;
        const pendientes = pedidos.filter(p => p.estado_actual === 'Pendiente').length;
        const estados = {};
        pedidos.forEach(p => { const estado = p.estado_actual || 'Sin estado'; estados[estado] = (estados[estado] || 0) + 1; });
        this.statusData = estados;
        // Productos con stock bajo (umbral 10)
        const stockBajo = inventario.filter(i => (i.stockdisponible || 0) < 10).length;

        // ====== DATOS PARA GRÁFICO DE VENTAS MENSUALES ======
        const ventasPorMes = {};
        activos.forEach(p => {
            if (p.fechapedido) {
                const fecha = new Date(p.fechapedido);
                if (Number.isNaN(fecha.getTime())) return;
                const mes = `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}`;
                ventasPorMes[mes] = (ventasPorMes[mes] || 0) + (parseFloat(p.totalneto) || 0);
            }
        });
        // Ordenar por mes
        const mesesOrdenados = Object.keys(ventasPorMes).sort();
        const labels = mesesOrdenados.map(m => {
            const [year, month] = m.split('-');
            return new Date(year, month-1).toLocaleString('es-ES', { month: 'short', year: 'numeric' });
        });
        const data = mesesOrdenados.map(m => ventasPorMes[m]);
        const ventasPorDia = {};
        activos.forEach(order => {
            if (!order.fechapedido) return;
            const fecha = new Date(order.fechapedido);
            if (Number.isNaN(fecha.getTime())) return;
            const dayKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
            ventasPorDia[dayKey] = (ventasPorDia[dayKey] || 0) + (parseFloat(order.totalneto) || 0);
        });
        const hoy = new Date();
        hoy.setHours(12, 0, 0, 0);
        const ultimosSieteDias = Array.from({ length: 7 }, (_, index) => {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - 6 + index);
            return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
        });

        // ====== PEDIDOS RECIENTES (últimos 5) ======
        const recent = [...pedidos]
            .sort((a, b) => new Date(b.fechapedido) - new Date(a.fechapedido))
            .slice(0, 5);

        // Guardar en this
        this.data = { total_ventas, total_pedidos, stockBajo, pendientes, clientes };
        this.salesData = { labels, data };
        this.dailySalesData = {
            labels: ultimosSieteDias.map(day => new Date(`${day}T12:00:00`).toLocaleDateString('es-NI', { weekday: 'short', day: '2-digit', month: 'short' })),
            data: ultimosSieteDias.map(day => ventasPorDia[day] || 0)
        };
        this.recentOrders = recent;
        this.inventoryAlerts = inventario
            .map(item => {
                const stock = Number(item.stockdisponible ?? item.stock ?? NaN);
                const minimum = Number(item.stockminimo ?? 10);
                const productId = item.productoid ?? item.producto_id;
                const product = productos.find(candidate => String(candidate.id) === String(productId));
                return { item, stock, minimum, product };
            })
            .filter(alert => Number.isFinite(alert.stock) && Number.isFinite(alert.minimum) && alert.stock < alert.minimum);

        // También actualizar estadísticas en localStorage si quieres cachear los cálculos
        const updatedStats = {
            ...stats,
            total_ventas,
            total_pedidos,
            stock_bajo: stockBajo,
            ventas_mensuales: ventasPorMes
        };
        localStorage.setItem('estadisticas', JSON.stringify(updatedStats));

        console.log("📊 Datos procesados:", this.data);
        console.log("📈 Ventas por mes:", this.salesData);
    },

    // ========== RENDERIZADO DE KPIs ==========
    renderKPIs: function() {
        const data = this.data || { total_ventas: 0, total_pedidos: 0, stockBajo: 0 };

        const kpis = {
            "ventas": `${appUtils.currencySymbol()}${data.total_ventas.toFixed(2)}`,
            "pedidos": data.pendientes,
            "stock": data.stockBajo,
            // Otros indicadores (puedes calcular o dejar estáticos)
            "vs": "Pedidos registrados, sin cancelados",
            "urge": `${data.total_pedidos} pedidos registrados`,
            "critic": data.stockBajo > 10 ? "Inventario crítico" : "Inventario saludable",
            "newc": "Clientes con pedidos no cancelados",
            "clientes": data.clientes
        };

        for (const [id, valor] of Object.entries(kpis)) {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = valor;
                el.style.color = '#333';
            }
        }
    },

    // ========== GRÁFICOS ==========
    renderCharts: function() {
        if (typeof Chart === 'undefined') {
            console.warn("⚠️ Chart.js no está disponible");
            return;
        }

        const sales = this.salesData || { labels: ['Ene','Feb','Mar','Abr','May','Jun'], data: [0,0,0,0,0,0] };

        // Si no hay datos, mostrar mensaje o gráfico vacío
        if (sales.data.length === 0) {
            sales.labels = ['Sin datos'];
            sales.data = [0];
        }

        // Gráfico de transacciones (puedes usar datos de ventas por hora si los tienes en pedidos)
        this.createTransactionalChart(Object.values(this.statusData || {}));
        this.createDailySalesChart();
        // Gráfico de crecimiento (ventas mensuales)
        this.createGrowthChart(sales.labels, sales.data);
        // Gráfico de regiones (si tienes datos de región en pedidos, puedes calcular)
        this.createRegionChart(Object.values(this.statusData || {}));
        // Gráfico de forecast (puedes calcular proyección simple)
        let accumulated = 0;
        this.createForecastChart(sales.data.map(value => accumulated += value));
    },

    // ========== PEDIDOS RECIENTES ==========
    renderRecentOrders: function() {
        const tbody = document.getElementById('recentOrdersBody') || document.querySelector('.recent-orders-table tbody');
        if (!tbody) return;

        if (!this.recentOrders || this.recentOrders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">No hay pedidos recientes</td></tr>`;
            return;
        }

        tbody.innerHTML = this.recentOrders.map(order => {
            const estado = order.estado_actual || 'Pendiente';
            const badgeClass = this._getBadgeClass(estado);
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${new Date(order.fechapedido).toLocaleDateString('es-NI')}</td>
                    <td>${order.cliente_nombre || order.proveedor_nombre || 'Cliente'}</td>
                    <td>${appUtils.currencySymbol()}${parseFloat(order.totalneto || 0).toFixed(2)}</td>
                    <td><span class="badge ${badgeClass}">${estado}</span></td>
                </tr>
            `;
        }).join('');
    },

    _getBadgeClass: function(estado) {
        const map = {
            pendiente: 'badge-warning',
            confirmado: 'badge-info',
            'en preparación': 'badge-preparing',
            'en camino': 'badge-in-transit',
            enviado: 'badge-primary',
            entregado: 'badge-success',
            cancelado: 'badge-danger',
        };
        return map[String(estado || '').trim().toLocaleLowerCase()] || 'badge-secondary';
    },

    getBusinessAlerts: function() {
        const alerts = [];
        const orders = appUtils.readJSON(
            this.userRole === 'provider' ? 'pedidos_proveedor' : 'pedidos_comprador',
            []
        );
        const countStatus = status => orders.filter(order =>
            String(order.estado_actual || '').trim().toLocaleLowerCase() === status
        ).length;
        const pending = countStatus('pendiente');
        const confirmed = countStatus('confirmado');
        const sent = countStatus('enviado');
        const cancelled = countStatus('cancelado');
        if (pending) alerts.push({
            type: 'warning', title: 'Pedidos pendientes',
            message: `${pending} pedido${pending === 1 ? '' : 's'} requiere${pending === 1 ? '' : 'n'} seguimiento.`,
            module: 'orders'
        });
        if (confirmed || sent) alerts.push({
            type: 'info', title: 'Pedidos en proceso',
            message: `${confirmed} confirmado${confirmed === 1 ? '' : 's'} · ${sent} enviado${sent === 1 ? '' : 's'}.`,
            module: 'orders'
        });
        if (cancelled) alerts.push({
            type: 'danger', title: 'Pedidos cancelados',
            message: `${cancelled} pedido${cancelled === 1 ? '' : 's'} cancelado${cancelled === 1 ? '' : 's'} para revisar.`,
            module: 'orders'
        });

        const lowStock = this.inventoryAlerts || [];
        for (const alert of lowStock.slice(0, 5)) {
            const productName = alert.product?.nombreproducto || alert.item.producto_nombre || `Producto ${alert.item.productoid ?? ''}`.trim();
            alerts.push({
                type: 'warning', title: 'Stock bajo',
                message: `${productName}: quedan ${alert.stock}; mínimo ${alert.minimum}.`,
                module: 'inventory'
            });
        }
        if (lowStock.length > 5) alerts.push({
            type: 'warning', title: 'Más productos con stock bajo',
            message: `${lowStock.length - 5} productos adicionales están por debajo del mínimo.`,
            module: 'inventory'
        });
        return alerts;
    },

    renderBusinessAlerts: function() {
        const container = document.getElementById('businessAlerts');
        if (!container) return;
        const alerts = this.getBusinessAlerts();
        if (!alerts.length) {
            container.innerHTML = '<p class="business-alerts-empty">No hay alertas operativas con los datos actuales.</p>';
            return;
        }
        container.innerHTML = alerts.map(alert => `
            <article class="business-alert business-alert-${alert.type}">
                <div><strong>${appUtils.escapeHtml(alert.title)}</strong><p>${appUtils.escapeHtml(alert.message)}</p></div>
                <button type="button" data-alert-module="${alert.module}">Revisar</button>
            </article>
        `).join('');
    },

    // ========== GRÁFICOS (mismos de antes) ==========
    createTransactionalChart: function(horas) {
        const canvas = document.getElementById("transChart");
        if (!canvas) return;
        if (canvas.chart) canvas.chart.destroy();
        canvas.chart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: Object.keys(this.statusData || {}),
                datasets: [{
                    label: "Pedidos por estado",
                    data: horas,
                    backgroundColor: "#3b82f6",
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#555" } } },
                scales: {
                    x: { ticks: { color: "#888" }, grid: { display: false } },
                    y: { ticks: { color: "#888" }, grid: { color: "#eee" } }
                }
            }
        });
    },

    createDailySalesChart: function() {
        const canvas = document.getElementById('dailySalesChart');
        if (!canvas) return;
        if (canvas.chart) canvas.chart.destroy();
        const sales = this.dailySalesData || { labels: [], data: [] };
        canvas.chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: sales.labels.length ? sales.labels : ['Sin datos'],
                datasets: [{
                    label: `Ventas diarias (${appUtils.currencySymbol()})`,
                    data: sales.data.length ? sales.data : [0],
                    backgroundColor: 'rgba(167, 139, 250, 0.72)',
                    borderColor: '#7c3aed',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#555' } } },
                scales: {
                    x: { ticks: { color: '#888' }, grid: { display: false } },
                    y: { beginAtZero: true, ticks: { color: '#888' }, grid: { color: '#eee' } }
                }
            }
        });
    },

    createGrowthChart: function(labels, data) {
        const canvas = document.getElementById("growthChart");
        if (!canvas) return;
        if (canvas.chart) canvas.chart.destroy();
        canvas.chart = new Chart(canvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Ventas mensuales",
                    data: data,
                    borderColor: "#a78bfa",
                    backgroundColor: "rgba(124,58,237,0.1)",
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: "#7c3aed",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#555" } } },
                scales: {
                    x: { ticks: { color: "#888" }, grid: { display: false } },
                    y: { ticks: { color: "#888" }, grid: { color: "#eee" } }
                }
            }
        });
    },

    createRegionChart: function(regiones) {
        const canvas = document.getElementById("regionChart");
        if (!canvas) return;
        if (canvas.chart) canvas.chart.destroy();
        canvas.chart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: Object.keys(this.statusData || {}),
                datasets: [{
                    label: "Distribución de pedidos",
                    data: regiones,
                    backgroundColor: ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"],
                    borderColor: "#fff",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom", labels: { color: "#555", padding: 20 } }
                }
            }
        });
    },

    createForecastChart: function(forecast) {
        const canvas = document.getElementById("forecastChart");
        if (!canvas) return;
        if (canvas.chart) canvas.chart.destroy();
        canvas.chart = new Chart(canvas, {
            type: "line",
            data: {
                labels: this.salesData.labels,
                datasets: [{
                    label: "Importe acumulado de pedidos",
                    data: forecast,
                    borderColor: "#7c3aed",
                    borderDash: [5, 5],
                    backgroundColor: "rgba(124,58,237,0.05)",
                    tension: 0.4,
                    pointBackgroundColor: "#7c3aed",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#555" } } },
                scales: {
                    x: { ticks: { color: "#888" }, grid: { display: false } },
                    y: { ticks: { color: "#888" }, grid: { color: "#eee" } }
                }
            }
        });
    },

    // ========== ESCUCHAR CAMBIOS EN LOCALSTORAGE ==========
    setupStorageListener: function() {
        window.addEventListener('storage', (e) => {
            // Si cambian productos, pedidos o inventario, recargar
            if (['productos', 'pedidos_proveedor', 'pedidos_comprador', 'inventario'].includes(e.key)) {
                console.log("🔄 Detected storage change, refreshing dashboard...");
                this.loadFromStorage();
                this.renderKPIs();
                this.renderCharts();
                this.renderRecentOrders();
                this.renderBusinessAlerts();
                window.notifications?.refresh();
            }
        }, { signal: this._events.signal });
    },

    destroy: function() {
        this._events?.abort();
        clearTimeout(this._toastTimer);
        document.querySelectorAll('#main-view canvas').forEach(canvas => {
            canvas.chart?.destroy();
        });
    },

    // ========== REFRESCAR MANUALMENTE ==========
    refresh: async function() {
        console.log("🔄 Refrescando dashboard (acción manual)...");
        // Primero refrescar datos desde la API (dump-all)
        try {
            await api.refreshFullData();
        } catch (e) {
            console.warn("⚠️ Error al refrescar datos, usando localStorage existente");
        }
        this.loadFromStorage();
        this.renderKPIs();
        this.renderCharts();
        this.renderRecentOrders();
        this.renderBusinessAlerts();
        window.notifications?.refresh();
        this.showNotification('✅ Dashboard actualizado', 'success');
    },

    showNotification: function(msg, type) { appUtils.showToast(msg, type); }
};
